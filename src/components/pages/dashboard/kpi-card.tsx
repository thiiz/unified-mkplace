import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  type?: 'success' | 'warning' | 'error';
  icon?: React.ElementType;
}

export function KPICard({
  label,
  value,
  change,
  type,
  icon: Icon
}: KPICardProps) {
  const hasChange = change !== undefined;
  const isPositive = hasChange && change > 0;

  return (
    <Card className='group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg'>
      <div className='to-muted/20 absolute inset-0 bg-gradient-to-br from-transparent opacity-0 transition-opacity group-hover:opacity-100' />
      <CardContent className='p-6'>
        <div className='flex items-center justify-between space-y-0 pb-2'>
          <p className='text-muted-foreground text-sm font-medium'>{label}</p>
          {Icon && (
            <div className='bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary rounded-full p-2 transition-colors'>
              <Icon className='h-4 w-4' />
            </div>
          )}
        </div>
        <div className='flex flex-col gap-1'>
          <h3 className='text-2xl font-bold tracking-tight'>{value}</h3>
          <div className='flex items-center gap-2'>
            {hasChange && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  isPositive
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className='h-3 w-3' />
                ) : (
                  <TrendingDown className='h-3 w-3' />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
            {type && (
              <Badge
                variant='outline'
                className={cn(
                  'text-[10px] font-normal',
                  type === 'success' && 'border-success/50 text-success',
                  type === 'warning' && 'border-warning/50 text-warning',
                  type === 'error' && 'border-destructive/50 text-destructive'
                )}
              >
                {type === 'success' && 'Ótimo'}
                {type === 'warning' && 'Atenção'}
                {type === 'error' && 'Crítico'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
