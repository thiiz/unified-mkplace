import prisma from '@/lib/prisma';
import crypto from 'crypto';
import {
  ExportFormField,
  ExportResult,
  MarketplaceAdapter,
  ValidationResult
} from '../types';
import { ShopeeExportOptions } from './types';

export class ShopeeAdapter implements MarketplaceAdapter<ShopeeExportOptions> {
  readonly type = 'shopee' as const;
  readonly name = 'Shopee';

  async canExport(): Promise<boolean> {
    const shop = await prisma.shopeeShop.findFirst();
    return !!shop && !!shop.accessToken;
  }

  async getExportFormFields(): Promise<ExportFormField[]> {
    // For now, return placeholder fields
    // In a real implementation, we would fetch categories and logistics from Shopee API
    return [
      {
        name: 'categoryId',
        type: 'number',
        label: 'Category ID',
        required: true,
        description: 'Shopee category ID for this product'
      }
    ];
  }

  validateExportOptions(options: ShopeeExportOptions): ValidationResult {
    const errors: Record<string, string> = {};

    if (!options.categoryId || options.categoryId <= 0) {
      errors.categoryId = 'Valid category is required';
    }

    if (!options.logistics || options.logistics.length === 0) {
      errors.logistics = 'At least one logistics channel is required';
    }

    const enabledLogistics = options.logistics?.filter((l) => l.enabled) || [];
    if (enabledLogistics.length === 0) {
      errors.logistics = 'At least one logistics channel must be enabled';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }

  async export(
    productId: string,
    options: ShopeeExportOptions
  ): Promise<ExportResult> {
    try {
      // Fetch product
      // Fetch product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { media: { orderBy: { order: 'asc' } } }
      });
      if (!product) {
        throw new Error('Product not found');
      }

      // Fetch shop
      const shop = await prisma.shopeeShop.findFirst();
      if (!shop) {
        throw new Error('No Shopee shop connected');
      }

      // Get Shopee SDK
      const { createShopeeClient } = await import('@/services/shopee/client');
      const client = createShopeeClient();
      const sdk = await client.getSdkForShop(shop.shopId);

      // Filter only image media
      const imageMedia = product.media.filter((m) => m.type === 'IMAGE');
      const imageUrls = imageMedia.map((m) => m.url);

      // Upload images
      const imageIds = await this.uploadImages(imageUrls, shop);

      if (imageIds.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      // Prepare logistics
      const enabledLogistics = options.logistics.filter((l) => l.enabled);
      const logisticInfo = enabledLogistics.map((l) => ({
        logistic_id: l.logistic_id,
        logistic_name: l.logistic_name || '',
        enabled: true,
        is_free: l.is_free || false,
        shipping_fee: l.shipping_fee,
        size_id: l.size_id
      }));

      // Create product on Shopee
      console.log('[Shopee] Creating product:', product.name);

      const res = await sdk.product.addItem({
        item_name: product.name,
        description: product.description || product.name,
        original_price: Number(product.price),
        seller_stock: [{ stock: product.stock }],
        weight: product.weight || 0.1, // Use product weight with fallback
        item_status: 'NORMAL',
        image: {
          image_id_list: imageIds
        },
        brand: {
          brand_id: 0,
          original_brand_name: product.brand || 'No Brand'
        },
        dimension: {
          package_length: Math.round(
            options.dimensions?.length || product.length || 10
          ),
          package_width: Math.round(
            options.dimensions?.width || product.width || 10
          ),
          package_height: Math.round(
            options.dimensions?.height || product.height || 10
          )
        },
        category_id: options.categoryId,
        attribute_list: options.attributes || [],
        logistic_info: logisticInfo
      });

      // @ts-ignore - SDK types may not match exactly
      if (res.error) {
        // @ts-ignore
        throw new Error(`Shopee API Error: ${res.message}`);
      }

      // Save to database
      await prisma.shopeeProduct.create({
        data: {
          productId: product.id,
          shopeeShopId: shop.shopId,
          shopeeItemId: res.response.item_id.toString(),
          status: 'SYNCED'
        }
      });

      return {
        success: true,
        marketplaceItemId: res.response.item_id.toString(),
        message: 'Product exported successfully to Shopee'
      };
    } catch (error) {
      console.error('[ShopeeAdapter] Export failed:', error);
      return {
        success: false,
        errors: [
          error instanceof Error ? error.message : 'Unknown error occurred'
        ]
      };
    }
  }

  /**
   * Upload product images to Shopee
   */
  private async uploadImages(
    imageUrls: string[],
    shop: any
  ): Promise<string[]> {
    const imageIds: string[] = [];
    const partnerId = process.env.SHOPEE_PARTNER_ID!;
    const partnerKey = process.env.SHOPEE_PARTNER_KEY!;
    const baseUrl = (
      process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com'
    ).replace(/\/$/, '');
    const path = '/api/v2/media_space/upload_image';

    console.log(
      '[Shopee] Starting image upload. Total images:',
      imageUrls.length
    );

    for (const url of imageUrls) {
      try {
        console.log('[Shopee] Fetching image from:', url);
        const imgRes = await fetch(url);

        if (!imgRes.ok) {
          throw new Error(`HTTP ${imgRes.status}: ${imgRes.statusText}`);
        }

        const arrayBuffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const blob = new Blob([arrayBuffer], { type: contentType });

        // Prepare Shopee API request
        const timestamp = Math.floor(Date.now() / 1000);
        const baseString = `${partnerId}${path}${timestamp}${shop.accessToken}${shop.shopId}`;
        const sign = crypto
          .createHmac('sha256', partnerKey)
          .update(baseString)
          .digest('hex');
        const apiUrl = `${baseUrl}${path}?partner_id=${partnerId}&timestamp=${timestamp}&access_token=${shop.accessToken}&shop_id=${shop.shopId}&sign=${sign}`;

        console.log('[Shopee] Uploading image to API');

        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');

        const uploadRes = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        }).then((r) => r.json());

        console.log('[Shopee] Upload response:', uploadRes);

        if (uploadRes.image_info?.image_id) {
          imageIds.push(uploadRes.image_info.image_id);
          console.log(
            '[Shopee] Image uploaded successfully. ID:',
            uploadRes.image_info.image_id
          );
        } else {
          console.error(
            '[Shopee] Upload succeeded but no image_id in response:',
            uploadRes
          );
          if (uploadRes.error) {
            throw new Error(
              `Shopee API Error: ${uploadRes.message || uploadRes.error}`
            );
          }
        }
      } catch (e) {
        console.error('[Shopee] Failed to upload image:', url, e);
        // Continue with other images instead of failing completely
      }
    }

    console.log('[Shopee] Total images uploaded:', imageIds.length);
    return imageIds;
  }
}
