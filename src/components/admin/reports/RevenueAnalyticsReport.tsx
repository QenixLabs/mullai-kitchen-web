'use client';

import { useMemo } from 'react';
import {
  Wallet,
  Users,
  Briefcase,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PackageOpen,
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
import { RevenueExpenseChart } from './ReportCharts';
import type { IRevenueAnalyticsResponse } from '@/api/types/admin.types';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface RevenueAnalyticsReportProps {
  data: IRevenueAnalyticsResponse | undefined;
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

export function RevenueAnalyticsReport({ data, isLoading }: RevenueAnalyticsReportProps) {
  const daily = data?.daily_breakdown ?? [];

  const profitTrend = useMemo(() => {
    if (!daily.length) return 'flat' as const;
    const mid = Math.floor(daily.length / 2);
    const firstHalf = daily.slice(0, mid);
    const secondHalf = daily.slice(mid);
    const firstProfit = firstHalf.reduce((s, r) => s + (r.profit_or_loss ?? 0), 0);
    const secondProfit = secondHalf.reduce((s, r) => s + (r.profit_or_loss ?? 0), 0);
    if (secondProfit > firstProfit * 1.05) return 'up' as const;
    if (secondProfit < firstProfit * 0.95) return 'down' as const;
    return 'flat' as const;
  }, [daily]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[360px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data || !daily.length) {
    return (
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Revenue Analytics"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="rounded-full bg-primary/5 p-4 text-primary/60">
              <PackageOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                No revenue data
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the date range or filters to see revenue analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profitLossTone: 'success' | 'destructive' = data.profit_or_loss >= 0 ? 'success' : 'destructive';
  const profitLossLabel = data.profit_or_loss >= 0 ? 'Profit' : 'Loss';

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Wallet className="h-4.5 w-4.5" />}
          label="Total Revenue"
          value={formatCurrency(data.total_revenue)}
          sub="Individual + Corporate"
          tone="primary"
        />
        <StatCard
          icon={<Users className="h-4.5 w-4.5" />}
          label="Individual Revenue"
          value={formatCurrency(data.individual_revenue)}
          sub="Subscription payments"
          tone="info"
        />
        <StatCard
          icon={<Briefcase className="h-4.5 w-4.5" />}
          label="Corporate Revenue"
          value={formatCurrency(data.corporate_revenue)}
          sub="Corporate invoices"
          tone="warning"
        />
        <StatCard
          icon={<Receipt className="h-4.5 w-4.5" />}
          label="Ingredient Expense"
          value={formatCurrency(data.total_ingredient_expense)}
          sub="Cost of goods consumed"
          tone="destructive"
        />
        <StatCard
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          label={profitLossLabel}
          value={formatCurrency(Math.abs(data.profit_or_loss))}
          sub={data.profit_or_loss >= 0 ? 'Revenue > Expense' : 'Expense > Revenue'}
          tone={profitLossTone}
          trend={profitTrend}
        />
      </div>

      {/* Chart */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Revenue vs Expense"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            count={daily.length}
          />
          <div className="p-5">
            <RevenueExpenseChart data={daily} />
          </div>
        </CardContent>
      </Card>

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
                    Individual
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Corporate
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total Revenue
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Ingredient Expense
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Profit / Loss
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.map((row, idx) => {
                  const isLast = idx === daily.length - 1;
                  const isProfit = row.profit_or_loss >= 0;
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
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {formatCurrency(row.individual_revenue)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {formatCurrency(row.corporate_revenue)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-bold tabular-nums text-foreground">
                        {formatCurrency(row.total_revenue)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {formatCurrency(row.ingredient_expense)}
                      </TableCell>
                      <TableCell className={cn(
                        'px-5 py-3.5 text-right text-sm font-bold tabular-nums',
                        isProfit ? 'text-emerald-600' : 'text-rose-600',
                      )}>
                        {isProfit ? '+' : ''}{formatCurrency(row.profit_or_loss)}
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
              Daily revenue, expense, and profit/loss breakdown
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
