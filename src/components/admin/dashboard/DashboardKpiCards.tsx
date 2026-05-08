'use client';

import { useMemo } from 'react';
import {
  Wallet, Package, Briefcase, Users, Building2, ChefHat, Route, AlertTriangle,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { IDashboardResponse } from '@/api/types/admin.types';

interface DashboardKpiCardsProps {
  data?: IDashboardResponse;
  isLoading?: boolean;
}

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
type Trend = 'up' | 'down' | 'flat';

const toneStyles: Record<Tone, { card: string; icon: string }> = {
  primary: {
    card: 'border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/[0.03]',
    icon: 'bg-primary/10 text-primary ring-primary/15',
  },
  success: {
    card: 'border-l-4 border-l-emerald-500 bg-gradient-to-br from-card to-emerald-500/[0.03]',
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  },
  warning: {
    card: 'border-l-4 border-l-amber-500 bg-gradient-to-br from-card to-amber-500/[0.03]',
    icon: 'bg-amber-50 text-amber-600 ring-amber-200',
  },
  info: {
    card: 'border-l-4 border-l-sky-500 bg-gradient-to-br from-card to-sky-500/[0.03]',
    icon: 'bg-sky-50 text-sky-600 ring-sky-200',
  },
  destructive: {
    card: 'border-l-4 border-l-rose-500 bg-gradient-to-br from-card to-rose-500/[0.03]',
    icon: 'bg-rose-50 text-rose-600 ring-rose-200',
  },
  muted: {
    card: 'border-l-4 border-l-muted-foreground bg-gradient-to-br from-card to-muted/30',
    icon: 'bg-muted text-muted-foreground ring-border',
  },
};

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: Tone;
  trend?: Trend;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-muted-foreground';

  return (
    <Card className={cn('overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5', toneStyles[tone].card)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">{value}</p>
            {sub && (
              <div className="flex items-center gap-1.5">
                {trend && <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />}
                <p className="truncate text-xs text-muted-foreground">{sub}</p>
              </div>
            )}
          </div>
          <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 shadow-sm', toneStyles[tone].icon)}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardKpiCards({ data, isLoading }: DashboardKpiCardsProps) {
  const canViewRevenue = useHasPermission('report:financial');
  const canViewOrders = useHasPermission(['report:outlet', 'report:cross-outlet'], false);
  const canViewCorporate = useHasPermission(['corporate:view:any', 'corporate:view:outlet'], false);
  const canViewKitchen = useHasPermission('order:kitchen');
  const canViewRoutes = useHasPermission('route:assign');
  const canViewUsers = useHasPermission('user:view:any');
  const canViewSubscriptions = useHasPermission('subscription:view:any');

  const formatCurrency = (n?: number) => (n ? `₹${n.toLocaleString('en-IN')}` : '₹0');

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {canViewRevenue && (
        <StatCard
          icon={<Wallet className="h-4.5 w-4.5" />}
          label="Revenue Today"
          value={formatCurrency(data?.revenue?.today)}
          sub={`Month: ${formatCurrency(data?.revenue?.month)}`}
          tone="primary"
          trend={data?.revenue?.trend?.direction === 'neutral' ? 'flat' : data?.revenue?.trend?.direction}
        />
      )}
      {canViewOrders && (
        <StatCard
          icon={<Package className="h-4.5 w-4.5" />}
          label="Orders Today"
          value={(data?.orders?.today ?? 0).toLocaleString('en-IN')}
          sub={`${data?.orders?.pending ?? 0} pending`}
          tone="info"
        />
      )}
      {canViewCorporate && (
        <StatCard
          icon={<Briefcase className="h-4.5 w-4.5" />}
          label="Corporate Meals"
          value={(data?.corporate?.todayMeals ?? 0).toLocaleString('en-IN')}
          sub={`${data?.corporate?.activeOrders ?? 0} active orders`}
          tone="warning"
        />
      )}
      {canViewSubscriptions && (
        <StatCard
          icon={<Users className="h-4.5 w-4.5" />}
          label="Active Subs"
          value={(data?.subscriptions?.active ?? 0).toLocaleString('en-IN')}
          sub="Recurring customers"
          tone="success"
        />
      )}
      {canViewKitchen && (
        <StatCard
          icon={<ChefHat className="h-4.5 w-4.5" />}
          label="Kitchen Meals"
          value={(data?.kitchen?.mealsToday ?? 0).toLocaleString('en-IN')}
          sub={`${data?.kitchen?.pending ?? 0} pending prep`}
          tone="primary"
        />
      )}
      {canViewRoutes && (
        <StatCard
          icon={<Route className="h-4.5 w-4.5" />}
          label="Active Routes"
          value={(data?.routes?.active ?? 0).toLocaleString('en-IN')}
          sub={`${data?.routes?.pending ?? 0} pending dispatch`}
          tone="info"
        />
      )}
      {canViewUsers && (
        <StatCard
          icon={<Users className="h-4.5 w-4.5" />}
          label="Total Users"
          value={(data?.users?.total ?? 0).toLocaleString('en-IN')}
          sub={`${data?.users?.new ?? 0} new (30d)`}
          tone="success"
        />
      )}
      {canViewCorporate && (
        <StatCard
          icon={<AlertTriangle className="h-4.5 w-4.5" />}
          label="Corp Outstanding"
          value={formatCurrency(data?.corporate?.outstandingAmount)}
          sub={`${data?.corporate?.overdueInvoices ?? 0} overdue invoices`}
          tone="destructive"
        />
      )}
    </div>
  );
}
