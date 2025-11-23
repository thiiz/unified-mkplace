import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/debug
 * Debug endpoint to test Shopee configuration and signature generation
 */
export async function GET(request: NextRequest) {
  const partnerId = process.env.SHOPEE_PARTNER_ID || '';
  const partnerKey = process.env.SHOPEE_PARTNER_KEY || '';
  const redirectUri = process.env.SHOPEE_REDIRECT_URI || '';
  const apiUrl =
    process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com';

  // Generate test signature
  const timestamp = Math.floor(Date.now() / 1000);
  const path = '/api/v2/shop/auth_partner';
  const baseString = `${partnerId}${path}${timestamp}`;
  const signature = partnerKey
    ? crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex')
    : 'N/A (Partner Key not configured)';

  // Build test auth URL
  const testAuthUrl =
    partnerId && partnerKey && redirectUri
      ? `${apiUrl}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${signature}&redirect=${encodeURIComponent(redirectUri)}`
      : 'N/A (Missing configuration)';

  const debugInfo = {
    title: 'Shopee Integration Debug Info',
    timestamp: new Date().toISOString(),
    configuration: {
      partnerId: partnerId || '❌ NOT SET',
      partnerKey: partnerKey
        ? `✅ Set (${partnerKey.length} chars)`
        : '❌ NOT SET',
      redirectUri: redirectUri || '❌ NOT SET',
      apiUrl: apiUrl || '❌ NOT SET'
    },
    signatureTest: {
      timestamp,
      path,
      baseString: partnerId && partnerKey ? baseString : 'N/A',
      signature
    },
    testAuthUrl,
    requiredEnvVars: {
      SHOPEE_PARTNER_ID: !!partnerId,
      SHOPEE_PARTNER_KEY: !!partnerKey,
      SHOPEE_REDIRECT_URI: !!redirectUri,
      SHOPEE_API_URL: !!apiUrl
    },
    allConfigured: !!(partnerId && partnerKey && redirectUri),
    instructions: [
      '1. Set SHOPEE_PARTNER_ID in .env.local',
      '2. Set SHOPEE_PARTNER_KEY in .env.local',
      '3. Set SHOPEE_REDIRECT_URI in .env.local (e.g., http://localhost:3000/api/integrations/shopee/callback)',
      '4. Optionally set SHOPEE_API_URL (defaults to https://partner.shopeemobile.com)',
      '5. Restart your development server',
      '6. Visit /dashboard/marketplace/shopee and click "Connect Shopee"'
    ]
  };

  return NextResponse.json(debugInfo, {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
