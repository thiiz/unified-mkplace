import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/integrations/shopee/disconnect
 * Removes Shopee shop connection for the current user
 */
export async function POST() {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Delete all Shopee shops for this user
    const result = await prisma.shopeeShop.deleteMany({
      where: {
        userId: session.user.id
      }
    });

    console.log(
      `Disconnected ${result.count} Shopee shop(s) for user ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      disconnected: result.count
    });
  } catch (error) {
    console.error('Failed to disconnect Shopee:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect'
      },
      { status: 500 }
    );
  }
}
