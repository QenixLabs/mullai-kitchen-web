'use client';

import { useMemo } from 'react';
import {
  Wallet,
  Receipt,
  ShoppingCart,
  AlertTriangle,
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
}) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    info: 'bg-info/15 text-info ring-info/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
              toneStyles[tone],
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
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {count !== undefined && count > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
      };
    }
    return {
      totalRevenue: data.total_revenue ?? 0,
      subRevenue: data.subscription_revenue ?? 0,
      oneTimeRevenue: data.one_time_revenue ?? 0,
      outstanding: data.outstanding ?? 0,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-[340px] w-full rounded-md" />
          <Skeleton className="h-[340px] w-full rounded-md" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-md" />
      </div>
    );
  }

  if (!data || !daily.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Financial Overview"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <PackageOpen className="h-6 w-6" />
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="In selected range"
          tone="primary"
        />
        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="Subscription Revenue"
          value={formatCurrency(stats.subRevenue)}
          sub="Recurring revenue"
          tone="success"
        />
        <StatCard
          icon={<ShoppingCart className="h-4 w-4" />}
          label="One-time Revenue"
          value={formatCurrency(stats.oneTimeRevenue)}
          sub="Add-on & single orders"
          tone="info"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          sub="Pending collections"
          tone="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Payment Methods"
              icon={<Wallet className="h-3.5 w-3.5" />}
              count={data.payment_methods?.length}
            />
            <div className="p-4">
              <PaymentMethodPieChart
                data={data.payment_methods ?? []}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Revenue Composition"
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              count={daily.length}
            />
            <div className="p-4">
              <RevenueAreaChart data={daily} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Daily Breakdown"
            icon={<Receipt className="h-3.5 w-3.5" />}
            count={daily.length}
          />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Subscription
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                      {row.date}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                      {formatCurrency(row.total)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(row.subscription)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(row.one_time)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
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
