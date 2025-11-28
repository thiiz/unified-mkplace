'use server';

import prisma from '@/lib/prisma';

export type MarketplaceType = 'shopee' | 'mercadolivre' | 'amazon' | 'tiktok';

export async function getProductsForMarketplace(marketplace: MarketplaceType) {
  const allProducts = await prisma.product.findMany({
    include: {
      shopeeProducts: marketplace === 'shopee'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // For now, only Shopee is implemented
  if (marketplace === 'shopee') {
    const exported = allProducts.filter(
      (p) => p.shopeeProducts && p.shopeeProducts.length > 0
    );
    const available = allProducts.filter(
      (p) => !p.shopeeProducts || p.shopeeProducts.length === 0
    );

    return { exported, available };
  }

  // For other marketplaces, return all as available
  return {
    exported: [],
    available: allProducts
  };
}

export async function getExportedProducts(marketplace: MarketplaceType) {
  if (marketplace === 'shopee') {
    return await prisma.product.findMany({
      where: {
        shopeeProducts: {
          some: {}
        }
      },
      include: {
        shopeeProducts: {
          include: {
            shopeeShop: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  return [];
}

export async function getAvailableProducts(marketplace: MarketplaceType) {
  if (marketplace === 'shopee') {
    return await prisma.product.findMany({
      where: {
        shopeeProducts: {
          none: {}
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // For other marketplaces, return all products
  return await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}
