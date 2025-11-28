'use server';

import { marketplaceRegistry } from '@/services/marketplaces/registry';
import { ExportResult, MarketplaceType } from '@/services/marketplaces/types';
import { revalidatePath } from 'next/cache';

/**
 * Generic server action to export a product to any marketplace
 */
export async function exportProductToMarketplace(
  productId: string,
  marketplace: MarketplaceType,
  options: any
): Promise<ExportResult> {
  try {
    // Get the appropriate adapter
    const adapter = marketplaceRegistry.get(marketplace);

    if (!adapter) {
      return {
        success: false,
        errors: [`Marketplace adapter not found: ${marketplace}`]
      };
    }

    // Check if export is possible
    const canExport = await adapter.canExport();
    if (!canExport) {
      return {
        success: false,
        errors: [
          `Cannot export to ${marketplace}: not connected or not configured`
        ]
      };
    }

    // Validate export options
    const validation = adapter.validateExportOptions(options);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
          ? Object.values(validation.errors)
          : ['Validation failed']
      };
    }

    // Execute export
    console.log(
      `[exportProductToMarketplace] Exporting product ${productId} to ${marketplace}`
    );
    const result = await adapter.export(productId, options);

    // Revalidate relevant pages
    if (result.success) {
      revalidatePath(`/dashboard/marketplace/${marketplace}`);
      revalidatePath('/dashboard/products');
    }

    return result;
  } catch (error) {
    console.error('[exportProductToMarketplace] Error:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'An unexpected error occurred'
      ]
    };
  }
}

/**
 * Get form fields for a specific marketplace
 */
export async function getMarketplaceExportFields(marketplace: MarketplaceType) {
  const adapter = marketplaceRegistry.get(marketplace);

  if (!adapter) {
    throw new Error(`Marketplace adapter not found: ${marketplace}`);
  }

  return await adapter.getExportFormFields();
}

/**
 * Check if a marketplace is available for export
 */
export async function canExportToMarketplace(
  marketplace: MarketplaceType
): Promise<boolean> {
  const adapter = marketplaceRegistry.get(marketplace);

  if (!adapter) {
    return false;
  }

  return await adapter.canExport();
}
