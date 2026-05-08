'use client';

import { useMemo } from 'react';
import {
  Wallet,
  Receipt,
  ShoppingCart,
  AlertTriangle,
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
import { PaymentMethodPieChart, RevenueAreaChart } from './ReportCharts';
import type { IFinancialReportResponse } from '@/api/types/admin.types';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface FinancialReportProps {
  data: IFinancialReportResponse | undefined;
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
            {count} days
          </span>
        )}
      </div>
    </div>
  );
}

export function FinancialReport({ data, isLoading }: FinancialReportProps) {
  const daily = data?.daily_breakdown ?? [];

  const stats = useMemo(() => {
    if (!data) {
      return {
        totalRevenue: 0,
        subRevenue: 0,
        oneTimeRevenue: 0,
        outstanding: 0,
        revTrend: 'flat' as const,
        subTrend: 'flat' as const,
      };
    }

    const mid = Math.floor(daily.length / 2);
    const firstHalf = daily.slice(0, mid);
    const secondHalf = daily.slice(mid);
    const firstTotal = firstHalf.reduce((s, r) => s + (r.total ?? 0), 0);
    const secondTotal = secondHalf.reduce((s, r) => s + (r.total ?? 0), 0);
    const revTrend: 'up' | 'down' | 'flat' = secondTotal > firstTotal * 1.05 ? 'up' : secondTotal < firstTotal * 0.95 ? 'down' : 'flat';

    const firstSub = firstHalf.reduce((s, r) => s + (r.subscription ?? 0), 0);
    const secondSub = secondHalf.reduce((s, r) => s + (r.subscription ?? 0), 0);
    const subTrend: 'up' | 'down' | 'flat' = secondSub > firstSub * 1.05 ? 'up' : secondSub < firstSub * 0.95 ? 'down' : 'flat';

    return {
      totalRevenue: data.total_revenue ?? 0,
      subRevenue: data.subscription_revenue ?? 0,
      oneTimeRevenue: data.one_time_revenue ?? 0,
      outstanding: data.outstanding ?? 0,
      revTrend,
      subTrend,
    };
  }, [data, daily]);

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

  if (!data || !daily.length) {
    return (
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Financial Overview"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="rounded-full bg-primary/5 p-4 text-primary/60">
              <PackageOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                No financial data
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the date range or filters to see financial metrics.
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
          icon={<Wallet className="h-4.5 w-4.5" />}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="In selected range"
          tone="primary"
          trend={stats.revTrend}
        />
        <StatCard
          icon={<Receipt className="h-4.5 w-4.5" />}
          label="Subscription Revenue"
          value={formatCurrency(stats.subRevenue)}
          sub="Recurring revenue"
          tone="success"
          trend={stats.subTrend}
        />
        <StatCard
          icon={<ShoppingCart className="h-4.5 w-4.5" />}
          label="One-time Revenue"
          value={formatCurrency(stats.oneTimeRevenue)}
          sub="Add-on & single orders"
          tone="info"
        />
        <StatCard
          icon={<AlertTriangle className="h-4.5 w-4.5" />}
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          sub="Pending collections"
          tone="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Payment Methods"
              icon={<Wallet className="h-3.5 w-3.5" />}
              count={data.payment_methods?.length}
            />
            <div className="p-5">
              <PaymentMethodPieChart
                data={data.payment_methods ?? []}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Revenue Composition"
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              count={daily.length}
            />
            <div className="p-5">
              <RevenueAreaChart data={daily} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Daily Breakdown"
            icon={<Receipt className="h-3.5 w-3.5" />}
            count={daily.length}
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-11 px-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Subscription
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    One-time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.map((row, idx) => {
                  const isLast = idx === daily.length - 1;
                  return (
                    <TableRow
                      key={row.date}
                      className={cn(
                        'transition-colors hover:bg-primary/[0.03]',
                        !isLast && 'border-b border-border/30',
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      )}
                    >
                      <TableCell className="px-5 py-3.5 text-sm font-semibold text-foreground">
                        {row.date}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-bold tabular-nums text-foreground">
                        {formatCurrency(row.total)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {formatCurrency(row.subscription)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {formatCurrency(row.one_time)}
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
                {daily.length}
              </span>{' '}
              day{daily.length === 1 ? '' : 's'}
            </span>
            <span className="hidden sm:inline">
              Daily revenue breakdown by source
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
