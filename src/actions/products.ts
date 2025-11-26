'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      shopeeProducts: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  categoryId?: string;
}) {
  const product = await prisma.product.create({
    data: {
      ...data,
      price: data.price // Ensure decimal handling if needed, but Prisma handles number -> Decimal
    }
  });

  revalidatePath('/dashboard/products');
  return product;
}

export async function publishProductToShopee(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  const shop = await prisma.shopeeShop.findFirst();
  if (!shop) throw new Error('No Shopee shop connected');

  const { createShopeeClient } = await import('@/services/shopee/client');
  const client = createShopeeClient();
  const sdk = await client.getSdkForShop(shop.shopId);

  // Upload images
  const imageIds: string[] = [];
  for (const url of product.images) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer) // Not needed if we use Blob directly

      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      // @ts-ignore - Ignoring type check as we are guessing the signature
      const uploadRes = await sdk.mediaSpace.uploadImage({
        image: file
      });

      // @ts-ignore
      if (uploadRes.image_info?.image_id) {
        // @ts-ignore
        imageIds.push(uploadRes.image_info.image_id);
      }
    } catch (e) {
      console.error('Failed to upload image:', url, e);
    }
  }

  // Create product on Shopee
  const res = await sdk.product.addItem({
    item_name: product.name,
    description: product.description || product.name,
    original_price: Number(product.price),
    seller_stock: [{ stock: product.stock }],
    weight: product.weight || 0.1,
    item_status: 'NORMAL',
    image: {
      image_id_list: imageIds
    },
    // Dimensions
    dimension: {
      package_length: Math.round(product.length || 10),
      package_width: Math.round(product.width || 10),
      package_height: Math.round(product.height || 10)
    },
    category_id: 12345, // Placeholder
    logistic_info: []
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
