import crypto from 'crypto';

export interface ShopeeConfig {
  partnerId: string;
  partnerKey: string;
  redirectUri: string;
  apiUrl: string;
}

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  merchant_id?: number;
}

export class ShopeeClient {
  private config: ShopeeConfig;

  constructor(config: ShopeeConfig) {
    this.config = config;
  }

  /**
   * Generate HMAC-SHA256 signature for Shopee API requests
   * @param path - API path (e.g., '/api/v2/auth/token/get')
   * @param timestamp - Unix timestamp in seconds
   * @returns Hex-encoded signature
   */
  private generateSignature(
    path: string,
    timestamp: number,
    accessToken?: string,
    shopId?: number
  ): string {
    const { partnerId, partnerKey } = this.config;

    // Base string construction
    let baseString = `${partnerId}${path}${timestamp}`;
    if (accessToken) baseString += accessToken;
    if (shopId) baseString += shopId;

    console.log('[Shopee] Base String:', baseString);

    // CORREÇÃO AQUI: Use a partnerKey diretamente como string.
    // Não converta para Buffer com 'hex'.
    const signature = crypto
      .createHmac('sha256', partnerKey)
      .update(baseString)
      .digest('hex');

    return signature;
  }

  /**
   * Generate authorization URL for shop authorization
   * According to Shopee documentation: partner.shopeemobile.com/api/v2/shop/auth_partner
   * URL format: host + path + partner_id + timestamp + redirect + sign
   * Sign = HMAC-SHA256(partner_id + path + timestamp, partner_key)
   *
   * @param redirectUri - Optional override for redirect URI
   * @returns Complete authorization URL (valid for 5 minutes)
   */
  generateAuthUrl(redirectUri?: string): string {
    const { partnerId, apiUrl } = this.config;
    const redirect = redirectUri || this.config.redirectUri;

    // Generate timestamp (valid for 5 minutes)
    const timestamp = Math.floor(Date.now() / 1000);

    // Path for shop authorization
    const path = '/api/v2/shop/auth_partner';

    // Generate signature: HMAC-SHA256(partner_id + path + timestamp)
    const sign = this.generateSignature(path, timestamp);

    // Build authorization URL
    // Host is the same as API URL (partner.test-stable.shopeemobile.com or partner.shopeemobile.com)
    const authUrl = new URL(`${apiUrl}${path}`);
    authUrl.searchParams.set('partner_id', partnerId);
    authUrl.searchParams.set('timestamp', timestamp.toString());
    authUrl.searchParams.set('redirect', redirect);
    authUrl.searchParams.set('sign', sign);

    console.log('[Shopee] Generated auth URL:', authUrl.toString());
    console.log(
      '[Shopee] URL expires in 5 minutes at:',
      new Date((timestamp + 300) * 1000).toISOString()
    );

    return authUrl.toString();
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from callback
   * @param shopId - Shop ID from callback
   * @returns Token response with access_token and refresh_token
   */
  async getAccessToken(
    code: string,
    shopId: number
  ): Promise<ShopeeTokenResponse> {
    const { partnerId, apiUrl } = this.config;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // API path
    const path = '/api/v2/auth/token/get';

    // Generate signature
    const sign = this.generateSignature(path, timestamp);

    // Build request URL
    const url = new URL(`${apiUrl}${path}`);
    url.searchParams.set('partner_id', partnerId);
    url.searchParams.set('timestamp', timestamp.toString());
    url.searchParams.set('sign', sign);

    // Request body
    const body = {
      code,
      shop_id: shopId,
      partner_id: parseInt(partnerId)
    };

    // Make API request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Shopee API Error: ${data.error} - ${data.message}`);
    }

    return data;
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token from previous token response
   * @param shopId - Shop ID
   * @returns New token response
   */
  async refreshAccessToken(
    refreshToken: string,
    shopId: number
  ): Promise<ShopeeTokenResponse> {
    const { partnerId, apiUrl } = this.config;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // API path
    const path = '/api/v2/auth/access_token/get';

    // Generate signature
    const sign = this.generateSignature(path, timestamp);

    // Build request URL
    const url = new URL(`${apiUrl}${path}`);
    url.searchParams.set('partner_id', partnerId);
    url.searchParams.set('timestamp', timestamp.toString());
    url.searchParams.set('sign', sign);

    // Request body
    const body = {
      refresh_token: refreshToken,
      shop_id: shopId,
      partner_id: parseInt(partnerId)
    };

    // Make API request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Shopee API Error: ${data.error} - ${data.message}`);
    }

    return data;
  }

  /**
   * Make authenticated API request to Shopee
   * @param path - API endpoint path
   * @param accessToken - Access token
   * @param shopId - Shop ID
   * @param body - Request body (optional)
   * @returns API response
   */
  async makeRequest(
    path: string,
    accessToken: string,
    shopId: number,
    body?: any
  ): Promise<any> {
    const { partnerId, apiUrl } = this.config;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate signature
    const sign = this.generateSignature(path, timestamp, accessToken, shopId);

    // Build request URL
    const url = new URL(`${apiUrl}${path}`);
    url.searchParams.set('partner_id', partnerId);
    url.searchParams.set('timestamp', timestamp.toString());
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('shop_id', shopId.toString());
    url.searchParams.set('sign', sign);

    // Make API request
    const response = await fetch(url.toString(), {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Shopee API Error: ${data.error} - ${data.message}`);
    }

    return data;
  }
}

// Factory function to create client instance
export function createShopeeClient(): ShopeeClient {
  const config: ShopeeConfig = {
    partnerId: process.env.SHOPEE_PARTNER_ID || '',
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    redirectUri: process.env.SHOPEE_REDIRECT_URI || '',
    apiUrl: process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com'
  };

  // Validate configuration
  if (!config.partnerId) {
    throw new Error('SHOPEE_PARTNER_ID environment variable is required');
  }
  if (!config.partnerKey) {
    throw new Error('SHOPEE_PARTNER_KEY environment variable is required');
  }
  if (!config.redirectUri) {
    throw new Error('SHOPEE_REDIRECT_URI environment variable is required');
  }

  return new ShopeeClient(config);
}
