import { auth } from '@/lib/auth';
import { createShopeeClient } from '@/services/shopee/client';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/callback
 * Handles OAuth callback from Shopee
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const { searchParams } = request.nextUrl;

    // Get authorization code and shop_id from callback
    const code = searchParams.get('code');
    const shopIdStr = searchParams.get('shop_id');
    const error = searchParams.get('error');

    // Check for authorization errors
    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    // Validate required parameters
    if (!code || !shopIdStr) {
      throw new Error('Missing authorization code or shop_id');
    }

    const shopId = parseInt(shopIdStr, 10);

    if (isNaN(shopId)) {
      throw new Error('Invalid shop_id');
    }

    // Create Shopee client instance
    const client = createShopeeClient();

    // Exchange code for access token and save to database linked to user
    const tokenResponse = await client.getAccessToken(
      code,
      shopId,
      session.user.id
    );

    console.log('Shopee tokens saved for shop:', {
      shop_id: shopId,
      user_id: session.user.id
    });

    // Redirect back to marketplace page with success
    const baseUrl = request.nextUrl.origin;
    const successUrl = new URL('/dashboard/marketplace/shopee', baseUrl);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('shop_id', shopId.toString());

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Shopee callback error:', error);

    // Redirect back to marketplace page with error
    const baseUrl = request.nextUrl.origin;
    const errorUrl = new URL('/dashboard/marketplace/shopee', baseUrl);
    errorUrl.searchParams.set('error', 'callback_failed');
    errorUrl.searchParams.set(
      'message',
      error instanceof Error
        ? error.message
        : 'Failed to complete authorization'
    );

    return NextResponse.redirect(errorUrl);
  }
}
