'use client';

import { exportProductToMarketplace } from '@/actions/marketplace-export';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarketplaceType } from '@/services/marketplaces/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: any;
  stock: number;
  brand?: string | null;
  ean?: string | null;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
};

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  marketplace: MarketplaceType;
  onSuccess?: () => void;
};

export function ExportDialog({
  open,
  onOpenChange,
  product,
  marketplace,
  onSuccess
}: ExportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [ean, setEan] = useState('');
  const [weight, setWeight] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');

  // Marketplace-specific fields
  const [categoryId, setCategoryId] = useState('');

  // Initialize form with product data when dialog opens
  useEffect(() => {
    if (open && product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? String(product.price) : '');
      setStock(product.stock ? String(product.stock) : '');
      setBrand(product.brand || '');
      setEan(product.ean || '');
      setWeight(product.weight ? String(product.weight) : '');
      setWidth(product.width ? String(product.width) : '');
      setHeight(product.height ? String(product.height) : '');
      setLength(product.length ? String(product.length) : '');
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Update product data first if changed
      // For now, we'll just use the marketplace export

      const exportOptions =
        marketplace === 'shopee'
          ? {
              categoryId: parseInt(categoryId),
              attributes: [],
              logistics: [
                {
                  logistic_id: 1,
                  enabled: true
                }
              ]
            }
          : {};

      const result = await exportProductToMarketplace(
        product.id,
        marketplace,
        exportOptions
      );

      if (result.success) {
        toast.success(result.message || 'Product exported successfully!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.errors?.join(', ') || 'Export failed');
      }
    } catch (error) {
      console.error('[ExportDialog] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Export to {marketplace}</DialogTitle>
          <DialogDescription>
            Review and adjust product details before exporting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Product Details Section */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Product Details</h3>

            <div className='grid gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Product Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='price'>
                    Price (R$) <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='price'
                    type='number'
                    step='0.01'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='stock'>
                    Stock <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='stock'
                    type='number'
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='brand'>Brand</Label>
                <Input
                  id='brand'
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder='No Brand'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ean'>EAN Barcode</Label>
                <Input
                  id='ean'
                  value={ean}
                  onChange={(e) => setEan(e.target.value)}
                  placeholder='EAN-13 (13 digits)'
                />
                <p className='text-muted-foreground text-xs'>
                  International Article Number
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Details Section */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>Shipping Details</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='weight'>Weight (kg)</Label>
                <Input
                  id='weight'
                  type='number'
                  step='0.01'
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder='0.1'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='length'>Length (cm)</Label>
                <Input
                  id='length'
                  type='number'
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder='10'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='width'>Width (cm)</Label>
                <Input
                  id='width'
                  type='number'
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder='10'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='height'>Height (cm)</Label>
                <Input
                  id='height'
                  type='number'
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder='10'
                />
              </div>
            </div>
          </div>

          {/* Marketplace-Specific Section */}
          {marketplace === 'shopee' && (
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>Shopee Settings</h3>

              <div className='space-y-2'>
                <Label htmlFor='categoryId'>
                  Category ID <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='categoryId'
                  type='number'
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder='e.g., 100017'
                  required
                />
                <p className='text-muted-foreground text-xs'>
                  Enter the Shopee category ID for this product
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isLoading ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
