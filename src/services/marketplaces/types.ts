/**
 * Base types and interfaces for marketplace export system
 */

export type MarketplaceType = 'shopee' | 'mercadolivre' | 'amazon' | 'tiktok';

/**
 * Form field types supported by the export dialog
 */
export type FormFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'autocomplete'
  | 'checkbox';

/**
 * Definition of a form field for export options
 */
export interface ExportFormField {
  name: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: Array<{ value: string | number; label: string; data?: any }>;
  loadOptions?: () => Promise<
    Array<{ value: string | number; label: string; data?: any }>
  >;
  dependencies?: string[]; // Fields that this field depends on
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Validation result for export options
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

/**
 * Result of an export operation
 */
export interface ExportResult {
  success: boolean;
  marketplaceItemId?: string;
  message?: string;
  errors?: string[];
}

/**
 * Base interface that all marketplace adapters must implement
 */
export interface MarketplaceAdapter<
  TExportOptions = any,
  TExportResult extends ExportResult = ExportResult
> {
  /** Unique identifier for the marketplace */
  readonly type: MarketplaceType;

  /** Display name of the marketplace */
  readonly name: string;

  /**
   * Check if the user can export to this marketplace
   * (e.g., is authenticated, has required permissions)
   */
  canExport(): Promise<boolean>;

  /**
   * Get the form fields needed to export a product to this marketplace
   * These fields will be dynamically rendered in the export dialog
   */
  getExportFormFields(): Promise<ExportFormField[]>;

  /**
   * Validate export options before attempting export
   */
  validateExportOptions(options: TExportOptions): ValidationResult;

  /**
   * Execute the export of a product to the marketplace
   * @param productId - ID of the product to export
   * @param options - Marketplace-specific export options
   */
  export(productId: string, options: TExportOptions): Promise<TExportResult>;
}

/**
 * Base product data that all adapters receive
 */
export interface ProductData {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  brand: string | null;
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
}
