import { ShopeeAdapter } from './shopee/adapter';
import { MarketplaceAdapter, MarketplaceType } from './types';

/**
 * Registry for managing marketplace adapters
 * Provides centralized access to all marketplace integrations
 */
class MarketplaceRegistry {
  private adapters = new Map<MarketplaceType, MarketplaceAdapter>();

  constructor() {
    // Register all available marketplace adapters
    this.register(new ShopeeAdapter());

    // Add more adapters as they are implemented
    // this.register(new MercadoLivreAdapter());
    // this.register(new AmazonAdapter());
    // this.register(new TikTokAdapter());
  }

  /**
   * Register a marketplace adapter
   */
  register(adapter: MarketplaceAdapter) {
    this.adapters.set(adapter.type, adapter);
    console.log(`[MarketplaceRegistry] Registered adapter: ${adapter.name}`);
  }

  /**
   * Get a specific marketplace adapter
   */
  get(type: MarketplaceType): MarketplaceAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * Get all registered adapters
   */
  getAll(): MarketplaceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if a marketplace is supported
   */
  isSupported(type: string): type is MarketplaceType {
    return this.adapters.has(type as MarketplaceType);
  }
}

// Export singleton instance
export const marketplaceRegistry = new MarketplaceRegistry();
