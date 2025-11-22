import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  type?: 'success' | 'warning' | 'error';
}

export function KPICard({ label, value, change, type }: KPICardProps) {
  const hasChange = change !== undefined;
  const isPositive = hasChange && change > 0;

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-6'>
        <div className='flex flex-col gap-2'>
          <p className='text-muted-foreground text-sm font-medium'>{label}</p>
          <div className='flex items-baseline justify-between'>
            <h3 className='text-foreground text-3xl font-bold'>{value}</h3>
            {hasChange && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className='h-4 w-4' />
                ) : (
                  <TrendingDown className='h-4 w-4' />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          {type && (
            <div className='mt-1'>
              <Badge
                variant={
                  type === 'success'
                    ? 'default'
                    : type === 'warning'
                      ? 'destructive'
                      : 'destructive'
                }
              >
                {type === 'success' && 'Ótimo'}
                {type === 'warning' && 'Atenção'}
                {type === 'error' && 'Crítico'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
