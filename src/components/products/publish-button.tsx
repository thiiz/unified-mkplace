'use client';

import { publishProductToShopee } from '@/actions/products';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PublishButtonProps {
  productId: string;
  isSynced: boolean;
}

export function PublishButton({ productId, isSynced }: PublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePublish() {
    setIsLoading(true);
    try {
      await publishProductToShopee(productId);
      toast.success('Product published to Shopee successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to publish product to Shopee');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSynced) {
    return (
      <Button variant='outline' size='sm' disabled>
        <span className='flex items-center text-green-600'>Synced</span>
      </Button>
    );
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handlePublish}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Upload className='mr-2 h-4 w-4' />
      )}
      Send to Shopee
    </Button>
  );
}
