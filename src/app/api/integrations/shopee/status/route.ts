import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/status
 * Returns the connection status for the current user's Shopee integration
 */
export async function GET() {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { connected: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Query database for Shopee shops linked to this user
    const shopeeShops = await prisma.shopeeShop.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If no shops found, return not connected
    if (shopeeShops.length === 0) {
      return NextResponse.json({
        connected: false
      });
    }

    // Return the most recent shop connection
    const shop = shopeeShops[0];

    return NextResponse.json({
      connected: true,
      shopId: shop.shopId,
      shopName: shop.shopName,
      connectedAt: shop.createdAt.toISOString(),
      expiresAt: shop.expireAt.toISOString()
    });
  } catch (error) {
    console.error('Failed to check Shopee status:', error);
    return NextResponse.json(
      {
        connected: false,
        error: 'Failed to check connection status'
      },
      { status: 500 }
    );
  }
}
