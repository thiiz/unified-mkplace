import { createShopeeClient } from '@/services/shopee/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/callback
 * Handles OAuth callback from Shopee
 */
export async function GET(request: NextRequest) {
  try {
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

    // Exchange code for access token
    const tokenResponse = await client.getAccessToken(code, shopId);

    // TODO: Store tokens in database or session
    // For now, we'll store in localStorage via client-side redirect
    console.log('Shopee tokens received:', {
      shop_id: shopId,
      access_token: tokenResponse.access_token.substring(0, 10) + '...',
      expires_in: tokenResponse.expire_in
    });

    // Redirect back to marketplace page with success and token data
    const baseUrl = request.nextUrl.origin;
    const successUrl = new URL('/dashboard/marketplace/shopee', baseUrl);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('shop_id', shopId.toString());

    // IMPORTANT: In production, DO NOT pass tokens via URL
    // This is temporary for demonstration. Implement proper server-side session storage.
    successUrl.searchParams.set('access_token', tokenResponse.access_token);
    successUrl.searchParams.set('refresh_token', tokenResponse.refresh_token);
    successUrl.searchParams.set(
      'expire_in',
      tokenResponse.expire_in.toString()
    );

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
