import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { mockSalesData } from '@/lib/mock-data';

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Canal</CardTitle>
        <CardDescription>Últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={mockSalesData}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='day'
              className='text-xs'
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className='text-xs'
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type='monotone'
              dataKey='mercadolivre'
              stroke='hsl(var(--chart-1))'
              strokeWidth={2}
              name='Mercado Livre'
            />
            <Line
              type='monotone'
              dataKey='shopee'
              stroke='hsl(var(--chart-2))'
              strokeWidth={2}
              name='Shopee'
            />
            <Line
              type='monotone'
              dataKey='amazon'
              stroke='hsl(var(--chart-3))'
              strokeWidth={2}
              name='Amazon'
            />
            <Line
              type='monotone'
              dataKey='magalu'
              stroke='hsl(var(--chart-4))'
              strokeWidth={2}
              name='Magalu'
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
