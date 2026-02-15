'use server';

import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      shopeeProducts: true,
      media: {
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createProduct(data: {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  media?: Array<{
    type: 'IMAGE' | 'VIDEO';
    url: string;
    thumbnailUrl?: string;
    publicId: string;
    filename: string;
    size: number;
    mimeType: string;
  }>;
  brand?: string;
  ean?: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  categoryId?: string;
}) {
  const { media, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      price: productData.price,
      // Create media records if provided
      media: media
        ? {
            create: media.map((m, index) => ({
              type: m.type,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl || m.url,
              publicId: m.publicId,
              filename: m.filename,
              size: m.size,
              mimeType: m.mimeType,
              order: index
            }))
          }
        : undefined
    }
  });

  revalidatePath('/dashboard/products');
  return product;
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: {
          order: 'asc'
        }
      },
      shopeeProducts: true
    }
  });
}

export async function updateProduct(
  id: string,
  data: {
    sku?: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    media?: Array<{
      type: 'IMAGE' | 'VIDEO';
      url: string;
      thumbnailUrl?: string;
      publicId: string;
      filename: string;
      size: number;
      mimeType: string;
    }>;
    brand?: string;
    ean?: string;
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
    categoryId?: string;
  }
) {
  const { media, ...productData } = data;

  // If media is provided, delete old media and create new ones
  if (media) {
    await prisma.productMedia.deleteMany({
      where: { productId: id }
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      // Create new media records if provided
      media: media
        ? {
            create: media.map((m, index) => ({
              type: m.type,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl || m.url,
              publicId: m.publicId,
              filename: m.filename,
              size: m.size,
              mimeType: m.mimeType,
              order: index
            }))
          }
        : undefined
    }
  });

  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  // First delete all related media
  await prisma.productMedia.deleteMany({
    where: { productId: id }
  });

  // Delete related Shopee products
  await prisma.shopeeProduct.deleteMany({
    where: { productId: id }
  });

  // Finally delete the product
  const product = await prisma.product.delete({
    where: { id }
  });

  revalidatePath('/dashboard/products');
  return product;
}

export async function publishProductToShopee(
  productId: string,
  options: {
    categoryId: number;
    attributes: Array<{
      attribute_id: number;
      attribute_value_list: Array<{
        value_id?: number;
        original_value_name?: string;
        value_unit?: string;
      }>;
    }>;
    logistics: Array<{
      logistic_id: number;
      logistic_name?: string;
      enabled: boolean;
      is_free?: boolean;
      size_id?: number;
      shipping_fee?: number;
    }>;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
  }
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { media: { orderBy: { order: 'asc' } } }
  });
  if (!product) throw new Error('Product not found');

  const shop = await prisma.shopeeShop.findFirst();
  if (!shop) throw new Error('No Shopee shop connected');

  const { createShopeeClient } = await import('@/services/shopee/client');
  const client = createShopeeClient();
  const sdk = await client.getSdkForShop(shop.shopId);

  // Filter only image media (Shopee doesn't support video in product images)
  const imageMedia = product.media.filter((m) => m.type === 'IMAGE');

  // Upload images
  const imageIds: string[] = [];
  console.log(
    '[Shopee] Starting image upload. Total images:',
    imageMedia.length
  );

  // Manual image upload to bypass SDK multipart issue
  const partnerId = process.env.SHOPEE_PARTNER_ID!;
  const partnerKey = process.env.SHOPEE_PARTNER_KEY!;
  const baseUrl = (
    process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com'
  ).replace(/\/$/, '');
  const path = '/api/v2/media_space/upload_image';

  for (const media of imageMedia) {
    const url = media.url;
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

      console.log('[Shopee] Uploading image manually to:', apiUrl);

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
      throw new Error(
        `Failed to upload image ${url}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  console.log('[Shopee] Total images uploaded:', imageIds.length);

  if (imageIds.length === 0) {
    throw new Error(
      'No images were uploaded successfully. At least one image is required.'
    );
  }

  // Validate and prepare logistics
  const enabledLogistics = options.logistics.filter((l) => l.enabled);
  console.log('[Shopee] Total logistics channels:', options.logistics.length);
  console.log('[Shopee] Enabled logistics channels:', enabledLogistics.length);

  if (enabledLogistics.length === 0) {
    throw new Error('At least one logistics channel must be enabled.');
  }

  const logisticInfo = enabledLogistics.map((l) => ({
    logistic_id: l.logistic_id,
    logistic_name: l.logistic_name || '',
    enabled: true,
    is_free: l.is_free || false,
    shipping_fee: l.shipping_fee,
    size_id: l.size_id
  }));

  console.log(
    '[Shopee] Logistics info to send:',
    JSON.stringify(logisticInfo, null, 2)
  );

  // Create product on Shopee
  console.log('[Shopee] Creating product with:', {
    name: product.name,
    price: Number(product.price),
    stock: product.stock,
    images: imageIds.length,
    logistics: logisticInfo.length,
    categoryId: options.categoryId
  });

  const res = await sdk.product.addItem({
    item_name: product.name,
    item_sku: product.sku,
    description: product.description || product.name,
    original_price: Number(product.price),
    seller_stock: [{ stock: product.stock }],
    weight: options.weight || product.weight || 0.1,
    item_status: 'NORMAL',
    image: {
      image_id_list: imageIds
    },
    // Brand - Use "No Brand" if not specified
    brand: {
      brand_id: 0, // 0 means "No Brand" on Shopee
      original_brand_name: product.brand || 'No Brand'
    },
    // Dimensions
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
    attribute_list: options.attributes,
    logistic_info: logisticInfo
  });

  // @ts-ignore
  if (res.error) {
    // @ts-ignore
    throw new Error(`Shopee API Error: ${res.message}`);
  }

  // Save to DB
  await prisma.shopeeProduct.create({
    data: {
      productId: product.id,
      shopeeShopId: shop.shopId,
      shopeeItemId: res.response.item_id.toString(),
      status: 'SYNCED'
    }
  });

  revalidatePath('/dashboard/products');
  return res;
}
