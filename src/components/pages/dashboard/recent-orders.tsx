import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const marketplaceIcons = {
  mercadolivre: '🛒',
  shopee: '🛍️',
  amazon: '📦',
  magalu: '🏪'
};

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const },
  paid: { label: 'Pago', variant: 'default' as const },
  shipped: { label: 'Enviado', variant: 'outline' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const }
};

export function RecentOrders() {
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Pedidos</CardTitle>
        <CardDescription>5 pedidos mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='font-mono text-sm'>{order.id}</TableCell>
                <TableCell>
                  <span className='text-lg'>
                    {marketplaceIcons[order.marketplace]}
                  </span>
                </TableCell>
                <TableCell className='font-medium'>
                  {order.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[order.status].variant}>
                    {statusConfig[order.status].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
