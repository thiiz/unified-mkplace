'use client';

import { exportProductToMarketplace } from '@/actions/marketplace-export';
import { getConnectedShopeeShop, getShopeeLogistics } from '@/actions/shopee';
import { MediaItem, MediaUploader } from '@/components/media/media-uploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MarketplaceType } from '@/services/marketplaces/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CategorySelector } from './shopee/category-selector';

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
  media?: {
    id: string;
    url: string;
    type: string;
  }[];
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
  const [logisticsChannels, setLogisticsChannels] = useState<any[]>([]);
  const [selectedLogistics, setSelectedLogistics] = useState<number[]>([]);
  const [isFetchingLogistics, setIsFetchingLogistics] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);

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

      // Initialize media
      if (product.media) {
        setMedia(
          product.media.map((m) => ({
            type: m.type as 'IMAGE' | 'VIDEO',
            url: m.url,
            thumbnailUrl: m.url,
            publicId: m.id, // Using id as publicId for existing media
            filename: `media-${m.id}`,
            size: 0,
            mimeType: m.type === 'IMAGE' ? 'image/jpeg' : 'video/mp4'
          }))
        );
      }
    }

    // Fetch logistics if marketplace is Shopee
    if (open && marketplace === 'shopee') {
      const fetchLogistics = async () => {
        setIsFetchingLogistics(true);
        try {
          const shop = await getConnectedShopeeShop();
          if (shop) {
            const channels = await getShopeeLogistics(shop.shopId);
            setLogisticsChannels(channels);
            // Pre-select enabled channels
            const enabled = channels
              .filter((c: any) => c.enabled)
              .map((c: any) => c.logistics_channel_id);
            setSelectedLogistics(enabled);
          }
        } catch (error) {
          console.error('Failed to fetch logistics:', error);
          toast.error('Failed to load logistics channels');
        } finally {
          setIsFetchingLogistics(false);
        }
      };
      fetchLogistics();
    }
  }, [open, product, marketplace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload new images to Cloudinary
      const uploadedMedia: MediaItem[] = [];
      for (const item of media) {
        if (item.file) {
          // This is a new file that needs to be uploaded
          const formData = new FormData();
          formData.append('file', item.file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${item.filename}`);
          }

          const uploadedData = await response.json();
          uploadedMedia.push(uploadedData);
        } else {
          // Existing media, keep as is
          uploadedMedia.push(item);
        }
      }

      // Update product with new media if changed
      if (media.some((m) => m.file)) {
        // We have new images, update the product
        await fetch('/api/products/update-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            media: uploadedMedia.map((m, index) => ({
              type: m.type,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl || m.url,
              publicId: m.publicId,
              filename: m.filename,
              size: m.size,
              mimeType: m.mimeType,
              order: index
            }))
          })
        });
      }

      const exportOptions =
        marketplace === 'shopee'
          ? {
              categoryId: parseInt(categoryId),
              attributes: [],
              logistics: logisticsChannels
                .filter((l) =>
                  selectedLogistics.includes(l.logistics_channel_id)
                )
                .map((l) => ({
                  logistic_id: l.logistics_channel_id,
                  enabled: true,
                  logistic_name: l.logistics_channel_name,
                  is_free: false // Default to false, user can't configure this yet
                }))
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

            {/* Images */}
            <div className='space-y-2'>
              <Label>Images</Label>
              <MediaUploader value={media} onChange={setMedia} />
            </div>

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
                  Category <span className='text-destructive'>*</span>
                </Label>
                <CategorySelector
                  value={categoryId ? parseInt(categoryId) : undefined}
                  onChange={(val) => setCategoryId(val.toString())}
                />
                <p className='text-muted-foreground text-xs'>
                  Select the Shopee category for this product
                </p>
              </div>

              <div className='space-y-2'>
                <Label>Logistics Channels</Label>
                <ScrollArea className='h-[150px] w-full rounded-md border p-4'>
                  {isFetchingLogistics ? (
                    <div className='flex items-center justify-center py-4'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : logisticsChannels.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>
                      No logistics channels found.
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {logisticsChannels.map((channel) => (
                        <div
                          key={channel.logistics_channel_id}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`logistic-${channel.logistics_channel_id}`}
                            checked={selectedLogistics.includes(
                              channel.logistics_channel_id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLogistics([
                                  ...selectedLogistics,
                                  channel.logistics_channel_id
                                ]);
                              } else {
                                setSelectedLogistics(
                                  selectedLogistics.filter(
                                    (id) => id !== channel.logistics_channel_id
                                  )
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`logistic-${channel.logistics_channel_id}`}
                            className='text-sm font-normal'
                          >
                            {channel.logistics_channel_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <p className='text-muted-foreground text-xs'>
                  Select at least one shipping channel
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
