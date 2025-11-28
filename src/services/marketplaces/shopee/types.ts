/**
 * Shopee-specific types for export operations
 */

export interface ShopeeExportOptions {
  categoryId: number;
  attributes: Array<{
    attribute_id: number;
    attribute_value_list: Array<{
      value_id?: number;
      original_value_name?: string;
      value_unit?: string;
    }>;
  }>;
  logistics: Array<{
    logistic_id: number;
    logistic_name?: string;
    enabled: boolean;
    is_free?: boolean;
    size_id?: number;
    shipping_fee?: number;
  }>;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ShopeeCategory {
  category_id: number;
  parent_category_id: number;
  original_category_name: string;
  display_category_name: string;
  has_children: boolean;
}

export interface ShopeeAttribute {
  attribute_id: number;
  original_attribute_name: string;
  display_attribute_name: string;
  is_mandatory: boolean;
  attribute_type: string;
  attribute_value_list?: Array<{
    value_id: number;
    original_value_name: string;
    display_value_name: string;
    value_unit?: string;
  }>;
}

export interface ShopeeLogisticChannel {
  logistics_channel_id: number;
  logistics_channel_name: string;
  enabled: boolean;
  fee_type: string;
  size_list?: Array<{
    size_id: number;
    name: string;
  }>;
}
