'use client';

import { createProduct } from '@/actions/products';
import PageContainer from '@/components/layout/page-container';
import { MediaItem, MediaUploader } from '@/components/media/media-uploader';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const productSchema = z.object({
  sku: z.string().min(2, {
    message: 'SKU must be at least 2 characters.'
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, {
    message: 'Price must be greater than 0.'
  }),
  stock: z.coerce.number().int().min(0, {
    message: 'Stock must be a positive integer.'
  }),
  media: z.array(z.any()).min(1, {
    message: 'At least one image is required.'
  }),
  brand: z.string().optional(),
  ean: z.string().optional(),
  weight: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  length: z.coerce.number().optional()
});

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      media: []
    }
  });

  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);
    try {
      // Handle file uploads
      const uploadedMedia = await Promise.all(
        values.media.map(async (item: any) => {
          if (item.file) {
            const formData = new FormData();
            formData.append('file', item.file);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error(`Failed to upload ${item.filename}`);
            }

            return await response.json();
          }
          return item;
        })
      );

      await createProduct({
        ...values,
        media: uploadedMedia as MediaItem[]
      });

      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageContainer scrollable>
      <div className='container mx-auto max-w-2xl py-10'>
        <h1 className='mb-6 text-3xl font-bold'>Add New Product</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <div className='flex gap-2'>
                    <FormControl>
                      <Input placeholder='SKU-...' {...field} />
                    </FormControl>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => form.setValue('sku', generateSKU())}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>Unique product identifier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Product name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Product description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type='number' step='0.01' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='stock'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='media'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images & Videos</FormLabel>
                  <FormControl>
                    <MediaUploader
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload product images and videos. First image will be the
                    main one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder='Product brand' {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for some marketplaces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ean'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EAN Barcode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='EAN-13 barcode (13 digits)'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    International Article Number (EAN-13)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-4 gap-4'>
              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type='number' step='0.01' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='length'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input type='number' step='1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='width'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl>
                      <Input type='number' step='1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='height'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type='number' step='1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
