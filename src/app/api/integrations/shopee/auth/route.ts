import { createShopeeClient } from '@/services/shopee/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/auth
 * Initiates Shopee OAuth authorization flow
 */
export async function GET(request: NextRequest) {
  try {
    // Create Shopee client instance
    const client = createShopeeClient();

    // Generate authorization URL
    const authUrl = client.generateAuthUrl();

    // Redirect to Shopee authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Shopee auth error:', error);

    // Redirect back to marketplace page with error
    const baseUrl = request.nextUrl.origin;
    const errorUrl = new URL('/dashboard/marketplace/shopee', baseUrl);
    errorUrl.searchParams.set('error', 'auth_failed');
    errorUrl.searchParams.set(
      'message',
      error instanceof Error
        ? error.message
        : 'Failed to initiate authorization'
    );

    return NextResponse.redirect(errorUrl);
  }
}
