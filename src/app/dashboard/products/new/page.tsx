'use client';

import { createProduct } from '@/actions/products';
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
  images: z.string().optional(), // Comma separated URLs for now
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
      name: '',
      description: '',
      price: 0,
      stock: 0,
      images: ''
    }
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);
    try {
      const images = values.images
        ? values.images.split(',').map((s) => s.trim())
        : [];

      await createProduct({
        ...values,
        images
      });

      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='container mx-auto max-w-2xl py-10'>
      <h1 className='mb-6 text-3xl font-bold'>Add New Product</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
            name='images'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images (URLs)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='http://example.com/image1.jpg, http://example.com/image2.jpg'
                    {...field}
                  />
                </FormControl>
                <FormDescription>Comma separated URLs</FormDescription>
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
  );
}
