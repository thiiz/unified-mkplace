'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceType } from '@/services/marketplaces/types';
import { CheckCircle2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ExportDialog } from './export-dialog';

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
  shopeeProducts?: any[];
};

type ProductsTabProps = {
  exportedProducts: Product[];
  availableProducts: Product[];
  marketplace: string;
};

export function ProductsTab({
  exportedProducts,
  availableProducts,
  marketplace
}: ProductsTabProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleExport = (product: Product) => {
    setSelectedProduct(product);
    setExportDialogOpen(true);
  };

  const handleExportSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Tabs defaultValue='exported' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='exported'>
            <CheckCircle2 className='mr-2 h-4 w-4' />
            Exported ({exportedProducts.length})
          </TabsTrigger>
          <TabsTrigger value='available'>
            <Package className='mr-2 h-4 w-4' />
            Available ({availableProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='exported'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marketplace ID</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      No products exported to {marketplace} yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  exportedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className='font-mono text-sm'>
                        {product.sku}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(product.price))}
                      </TableCell>
                      <TableCell>
                        <Badge variant='default'>
                          {product.shopeeProducts?.[0]?.status || 'Synced'}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-mono text-xs'>
                        {product.shopeeProducts?.[0]?.shopeeItemId || 'N/A'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='sm'>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value='available'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center'>
                      All products have been exported to {marketplace}.
                    </TableCell>
                  </TableRow>
                ) : (
                  availableProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className='font-mono text-sm'>
                        {product.sku}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(product.price))}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className='text-right'>
                        <Button size='sm' onClick={() => handleExport(product)}>
                          Export
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          product={selectedProduct}
          marketplace={marketplace as MarketplaceType}
          onSuccess={handleExportSuccess}
        />
      )}
    </>
  );
}
