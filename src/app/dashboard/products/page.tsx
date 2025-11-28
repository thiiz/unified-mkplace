import { getProducts } from '@/actions/products';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Products</h1>
        <Link href='/dashboard/products/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' /> Add Product
          </Button>
        </Link>
      </div>

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
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className='font-mono text-sm'>
                    {product.sku}
                  </TableCell>
                  <TableCell className='font-medium'>{product.name}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(product.price))}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='sm'>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
