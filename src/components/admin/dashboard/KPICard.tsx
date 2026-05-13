import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import type { IKPITrend } from '@/api/types/admin.types';

interface KPICardProps {
  label?: string;
  value?: number | string;
  trend?: IKPITrend;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
  formatValue?: (value: number | string) => string;
}

export function KPICard({
  label,
  value,
  trend,
  icon: Icon,
  loading = false,
  className,
  formatValue = (v) => (typeof v === 'number' ? v.toLocaleString() : v),
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    switch (trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value !== undefined ? formatValue(value) : '—'}
        </div>
        {trend && (
          <div className={cn('flex items-center text-xs mt-1', getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {trend.value > 0 ? '+' : ''}
              {trend.value.toFixed(1)}%
              {trend.period && ` ${trend.period}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
