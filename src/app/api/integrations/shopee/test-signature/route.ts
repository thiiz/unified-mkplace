import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * GET /api/integrations/shopee/test-signature
 * Test different signature generation methods
 */
export async function GET() {
  const partnerId = process.env.SHOPEE_PARTNER_ID || '';
  const partnerKey = process.env.SHOPEE_PARTNER_KEY || '';

  const timestamp = Math.floor(Date.now() / 1000);
  const path = '/api/v2/shop/auth_partner';
  const baseString = `${partnerId}${path}${timestamp}`;

  // Method 1: Direct hex (current implementation)
  const sig1 = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex');

  // Method 2: Partner Key as hex buffer (if partner_key is hex-encoded)
  let sig2 = 'N/A';
  try {
    const keyBuffer = Buffer.from(partnerKey, 'hex');
    sig2 = crypto
      .createHmac('sha256', keyBuffer)
      .update(baseString)
      .digest('hex');
  } catch (e) {
    sig2 = `Error: ${e}`;
  }

  // Method 3: Base64 encoded partner key
  let sig3 = 'N/A';
  try {
    const keyBuffer = Buffer.from(partnerKey, 'base64');
    sig3 = crypto
      .createHmac('sha256', keyBuffer)
      .update(baseString)
      .digest('hex');
  } catch (e) {
    sig3 = `Error: ${e}`;
  }

  return NextResponse.json({
    info: 'Testing different signature generation methods',
    partnerId,
    partnerKeyLength: partnerKey.length,
    partnerKeyPreview: `${partnerKey.substring(0, 8)}...`,
    timestamp,
    path,
    baseString,
    signatures: {
      method1_direct_string: sig1,
      method2_hex_buffer: sig2,
      method3_base64_buffer: sig3
    },
    shopeeDocExample: {
      description: 'Example from Shopee docs',
      partnerId: '1001141',
      path: '/api/v2/shop/auth_partner',
      timestamp: 1642507340,
      baseString: '1001141/api/v2/shop/auth_partner1642507340',
      note: 'Compare your base string format with this example'
    }
  });
}
