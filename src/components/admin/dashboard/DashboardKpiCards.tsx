'use client';

import { useMemo } from 'react';
import {
  Wallet,
  Package,
  Briefcase,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { IDashboardResponse } from '@/api/types/admin.types';

interface DashboardKpiCardsProps {
  data?: IDashboardResponse;
  isLoading?: boolean;
}

type Trend = 'up' | 'down' | 'flat';

function MiniStat({
  icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: Trend;
  color: string;
}) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-rose-600'
        : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm">
      <span
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          color,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {sub && (
            <div className="flex items-center gap-1">
              {trend && (
                <TrendIcon className={cn('h-3 w-3', trendColor)} />
              )}
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardKpiCards({ data, isLoading }: DashboardKpiCardsProps) {
  const canViewRevenue = useHasPermission('report:financial');
  const canViewOrders = useHasPermission(
    ['report:outlet', 'report:cross-outlet'],
    false,
  );
  const canViewCorporate = useHasPermission(
    ['corporate:view:any', 'corporate:view:outlet'],
    false,
  );
  const canViewSubscriptions = useHasPermission('subscription:view:any');

  const formatCurrency = (n?: number) =>
    n ? `₹${n.toLocaleString('en-IN')}` : '₹0';

  const metrics = useMemo(() => {
    const items: {
      key: string;
      icon: React.ReactNode;
      label: string;
      value: string;
      sub?: string;
      trend?: Trend;
      color: string;
    }[] = [];

    if (canViewRevenue) {
      items.push({
        key: 'revenue',
        icon: <Wallet className="h-4 w-4" />,
        label: 'Revenue Today',
        value: formatCurrency(data?.revenue?.today),
        sub: `Month: ${formatCurrency(data?.revenue?.month)}`,
        trend:
          data?.revenue?.trend?.direction === 'neutral'
            ? 'flat'
            : data?.revenue?.trend?.direction,
        color: 'bg-primary/10 text-primary',
      });
    }

    if (canViewOrders) {
      items.push({
        key: 'orders',
        icon: <Package className="h-4 w-4" />,
        label: 'Orders Today',
        value: (data?.orders?.today ?? 0).toLocaleString('en-IN'),
        sub: `${data?.orders?.pending ?? 0} pending`,
        color: 'bg-sky-50 text-sky-600',
      });
    }

    if (canViewSubscriptions) {
      items.push({
        key: 'subs',
        icon: <Users className="h-4 w-4" />,
        label: 'Active Subs',
        value: (data?.subscriptions?.active ?? 0).toLocaleString('en-IN'),
        sub: 'Recurring',
        color: 'bg-emerald-50 text-emerald-600',
      });
    }

    if (canViewCorporate) {
      items.push({
        key: 'corp-outstanding',
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Corp Outstanding',
        value: formatCurrency(data?.corporate?.outstandingAmount),
        sub: `${data?.corporate?.overdueInvoices ?? 0} overdue`,
        color: 'bg-rose-50 text-rose-600',
      });
    }

    return items;
  }, [data, canViewRevenue, canViewOrders, canViewCorporate, canViewSubscriptions]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((m) => (
        <MiniStat
          key={m.key}
          icon={m.icon}
          label={m.label}
          value={m.value}
          sub={m.sub}
          trend={m.trend}
          color={m.color}
        />
      ))}
    </div>
  );
}
