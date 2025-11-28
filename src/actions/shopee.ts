'use server';

import prisma from '@/lib/prisma';
import { createShopeeClient } from '@/services/shopee/client';

export async function getShopeeCategories(shopId: string) {
  const client = createShopeeClient();
  const sdk = await client.getSdkForShop(shopId);
  // Using 'pt-br' as default since the user seems to be Portuguese speaking ("precisamos criar...")
  const res = await sdk.product.getCategory({ language: 'pt-br' });
  return res.response.category_list;
}

export async function getShopeeAttributes(shopId: string, categoryId: number) {
  const client = createShopeeClient();
  const sdk = await client.getSdkForShop(shopId);
  const res = await sdk.product.getAttributeTree({
    category_id: categoryId,
    language: 'pt-br'
  });
  return res.response.attribute_list;
}

export async function getShopeeLogistics(shopId: string) {
  const client = createShopeeClient();
  const sdk = await client.getSdkForShop(shopId);
  const res = await sdk.logistics.getChannelList();
  return res.response.logistics_channel_list;
}

export async function getConnectedShopeeShop() {
  const shop = await prisma.shopeeShop.findFirst();
  return shop;
}
