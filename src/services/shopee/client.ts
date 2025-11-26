import prisma from '@/lib/prisma';
import { ShopeeSDK } from '@congminh1254/shopee-sdk';

// Define interfaces locally to avoid deep import issues
interface AccessToken {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  merchant_id?: number;
  request_id: string;
  error: string;
  message: string;
  [key: string]: any;
}

interface TokenStorage {
  store(token: AccessToken): Promise<void>;
  get(): Promise<AccessToken | null>;
  clear(): Promise<void>;
}

export interface ShopeeConfig {
  partnerId: string;
  partnerKey: string;
  redirectUri: string;
  apiUrl?: string;
}

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  merchant_id?: number;
}

class MemoryTokenStorage implements TokenStorage {
  private token: AccessToken | null = null;

  async store(token: AccessToken): Promise<void> {
    this.token = token;
  }

  async get(): Promise<AccessToken | null> {
    return this.token;
  }

  async clear(): Promise<void> {
    this.token = null;
  }
}

export class ShopeeClient {
  private sdk: ShopeeSDK;
  private config: ShopeeConfig;

  constructor(config: ShopeeConfig) {
    this.config = config;

    // Ensure base URL has /api/v2 suffix
    let baseUrl = config.apiUrl || 'https://partner.shopeemobile.com/api/v2';
    // Remove trailing slash if present to avoid double slashes before appending
    baseUrl = baseUrl.replace(/\/$/, '');

    if (!baseUrl.endsWith('/api/v2')) {
      baseUrl = `${baseUrl}/api/v2`;
    }

    // Use MemoryTokenStorage to prevent file system writes in serverless environments
    // The actual persistence will be handled explicitly in getAccessToken using Prisma
    this.sdk = new ShopeeSDK(
      {
        partner_id: parseInt(config.partnerId),
        partner_key: config.partnerKey,
        base_url: baseUrl
      },
      new MemoryTokenStorage()
    );
  }

  /**
   * Generate authorization URL for shop authorization
   */
  generateAuthUrl(redirectUri?: string): string {
    const redirect = redirectUri || this.config.redirectUri;
    return this.sdk.getAuthorizationUrl(redirect);
  }

  /**
   * Exchange authorization code for access token and save to database
   */
  async getAccessToken(
    code: string,
    shopId: number,
    userId?: string // Optional for now to maintain compatibility, but required for DB save
  ): Promise<ShopeeTokenResponse> {
    const token = await this.sdk.auth.getAccessToken(code, shopId);

    // Save to database if userId is provided
    if (userId && token.shop_id) {
      try {
        const expireAt = new Date(Date.now() + token.expire_in * 1000);

        await prisma.shopeeShop.upsert({
          where: {
            shopId: token.shop_id.toString()
          },
          update: {
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresIn: token.expire_in,
            expireAt: expireAt,
            userId: userId // Update owner if needed
          },
          create: {
            userId: userId,
            shopId: token.shop_id.toString(),
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresIn: token.expire_in,
            expireAt: expireAt
          }
        });
        console.log(`[Shopee] Token saved to DB for shop ${token.shop_id}`);
      } catch (error) {
        console.error('[Shopee] Failed to save token to DB:', error);
        // Don't throw, just log error so the flow continues
      }
    }

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expire_in: token.expire_in,
      shop_id: token.shop_id,
      merchant_id: (token as any).merchant_id
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    shopId: number
  ): Promise<ShopeeTokenResponse> {
    const token = await this.sdk.auth.getRefreshToken(refreshToken, shopId);

    // Update in DB
    try {
      const expireAt = new Date(Date.now() + token.expire_in * 1000);

      // We need to find the record first to know the userId if we want to be strict,
      // but for update we can just target by shopId
      await prisma.shopeeShop.update({
        where: {
          shopId: shopId.toString()
        },
        data: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          expiresIn: token.expire_in,
          expireAt: expireAt
        }
      });
      console.log(`[Shopee] Refreshed token updated in DB for shop ${shopId}`);
    } catch (error) {
      console.error('[Shopee] Failed to update refreshed token in DB:', error);
    }

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expire_in: token.expire_in,
      shop_id: token.shop_id,
      merchant_id: (token as any).merchant_id
    };
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
