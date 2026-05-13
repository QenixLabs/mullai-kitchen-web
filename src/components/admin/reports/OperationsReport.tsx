'use client';

import { useMemo } from 'react';
import {
  Package,
  Receipt,
  CheckCircle2,
  Clock,
  BarChart3,
  PackageOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendLineChart, RevenueBarChart } from './ReportCharts';
import type { IOperationsReportItem } from '@/api/types/admin.types';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface OperationsReportProps {
  data: IOperationsReportItem[];
  isLoading: boolean;
}

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
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
  trend?: 'up' | 'down' | 'flat';
}) {
  const toneStyles = {
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
  } as const;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-muted-foreground';

  return (
    <Card className={cn('overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5', toneStyles[tone].card)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && (
              <div className="flex items-center gap-1.5">
                {trend && <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />}
                <p className="truncate text-xs text-muted-foreground">{sub}</p>
              </div>
            )}
          </div>
          <span
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 shadow-sm',
              toneStyles[tone].icon,
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderStrip({
  title,
  icon,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            {count} periods
          </span>
        )}
      </div>
    </div>
  );
}

export function OperationsReport({ data, isLoading }: OperationsReportProps) {
  const stats = useMemo(() => {
    const rows = data ?? [];
    const totalOrders = rows.reduce((s, r) => s + (r.orders_count ?? 0), 0);
    const totalRevenue = rows.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const avgSuccessRate =
      rows.length > 0
        ? rows.reduce((s, r) => s + (r.delivery_success_rate ?? 0), 0) /
          rows.length
        : 0;
    const avgDeliveryTime =
      rows.length > 0
        ? rows.reduce(
            (s, r) => s + (r.avg_delivery_time_minutes ?? 0),
            0,
          ) / rows.length
        : 0;

    // Simple trend detection: compare first half to second half
    const mid = Math.floor(rows.length / 2);
    const firstHalf = rows.slice(0, mid);
    const secondHalf = rows.slice(mid);
    const firstOrders = firstHalf.reduce((s, r) => s + (r.orders_count ?? 0), 0);
    const secondOrders = secondHalf.reduce((s, r) => s + (r.orders_count ?? 0), 0);
    const orderTrend: 'up' | 'down' | 'flat' = secondOrders > firstOrders * 1.05 ? 'up' : secondOrders < firstOrders * 0.95 ? 'down' : 'flat';

    const firstRev = firstHalf.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const secondRev = secondHalf.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const revTrend: 'up' | 'down' | 'flat' = secondRev > firstRev * 1.05 ? 'up' : secondRev < firstRev * 0.95 ? 'down' : 'flat';

    return { totalOrders, totalRevenue, avgSuccessRate, avgDeliveryTime, orderTrend, revTrend };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[360px] w-full rounded-xl" />
          <Skeleton className="h-[360px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Operations Overview"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="rounded-full bg-primary/5 p-4 text-primary/60">
              <PackageOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                No operations data
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the date range or filters to see operations metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-4.5 w-4.5" />}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString('en-IN')}
          sub={`Across ${data.length} period${data.length === 1 ? '' : 's'}`}
          tone="primary"
          trend={stats.orderTrend}
        />
        <StatCard
          icon={<Receipt className="h-4.5 w-4.5" />}
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="Total in selected range"
          tone="success"
          trend={stats.revTrend}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          label="Success Rate"
          value={`${stats.avgSuccessRate.toFixed(1)}%`}
          sub="Avg delivery success"
          tone="info"
        />
        <StatCard
          icon={<Clock className="h-4.5 w-4.5" />}
          label="Avg Delivery Time"
          value={`${Math.round(stats.avgDeliveryTime)} min`}
          sub="Average per order"
          tone="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Orders Trend"
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              count={data.length}
            />
            <div className="p-5">
              <TrendLineChart
                data={data}
                dataKey="orders_count"
                xKey="period"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Revenue by Period"
              icon={<Receipt className="h-3.5 w-3.5" />}
              count={data.length}
            />
            <div className="p-5">
              <RevenueBarChart data={data} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Period Breakdown"
            icon={<Package className="h-3.5 w-3.5" />}
            count={data.length}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Period
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Orders
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Revenue
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Success Rate
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Avg Delivery
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Breakfast
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Lunch
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Dinner
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => {
                  const isLast = idx === data.length - 1;
                  return (
                    <TableRow
                      key={row.period}
                      className={cn(
                        'transition-colors hover:bg-primary/[0.03]',
                        !isLast && 'border-b border-border/30',
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      )}
                    >
                      <TableCell className="px-5 py-3.5 text-sm font-semibold text-foreground">
                        {row.period}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-foreground">
                        {row.orders_count.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                          row.delivery_success_rate >= 95 ? 'bg-emerald-50 text-emerald-700' :
                          row.delivery_success_rate >= 80 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        )}>
                          {row.delivery_success_rate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-foreground">
                        {Math.round(row.avg_delivery_time_minutes)} min
                      </TableCell>
                      <TableCell className="hidden px-5 py-3.5 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                        {row.breakdown?.breakfast ?? 0}
                      </TableCell>
                      <TableCell className="hidden px-5 py-3.5 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                        {row.breakdown?.lunch ?? 0}
                      </TableCell>
                      <TableCell className="hidden px-5 py-3.5 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                        {row.breakdown?.dinner ?? 0}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-5 py-3 text-[11px] text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">
                {data.length}
              </span>{' '}
              period{data.length === 1 ? '' : 's'}
            </span>
            <span className="hidden sm:inline">
              Revenue and delivery metrics per period
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
