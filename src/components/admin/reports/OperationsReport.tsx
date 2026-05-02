'use client';

import { useMemo } from 'react';
import {
  Package,
  Receipt,
  CheckCircle2,
  Clock,
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
            {sub && (
              <p className="truncate text-xs text-muted-foreground">{sub}</p>
            )}
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
    return { totalOrders, totalRevenue, avgSuccessRate, avgDeliveryTime };
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

  if (!data.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Operations Overview"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <PackageOpen className="h-6 w-6" />
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-4 w-4" />}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString('en-IN')}
          sub={`Across ${data.length} period${data.length === 1 ? '' : 's'}`}
          tone="primary"
        />
        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="Total in selected range"
          tone="success"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Success Rate"
          value={`${stats.avgSuccessRate.toFixed(1)}%`}
          sub="Avg delivery success"
          tone="info"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg Delivery Time"
          value={`${Math.round(stats.avgDeliveryTime)} min`}
          sub="Average per order"
          tone="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Orders Trend"
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              count={data.length}
            />
            <div className="p-4">
              <TrendLineChart
                data={data}
                dataKey="orders_count"
                xKey="period"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <HeaderStrip
              title="Revenue by Period"
              icon={<Receipt className="h-3.5 w-3.5" />}
              count={data.length}
            />
            <div className="p-4">
              <RevenueBarChart data={data} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            title="Period Breakdown"
            icon={<Package className="h-3.5 w-3.5" />}
            count={data.length}
          />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Period
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Orders
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Revenue
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Success Rate
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Avg Delivery
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Breakfast
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Lunch
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
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
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                      {row.period}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                      {row.orders_count.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                      {row.delivery_success_rate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                      {Math.round(row.avg_delivery_time_minutes)} min
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                      {row.breakdown?.breakfast ?? 0}
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                      {row.breakdown?.lunch ?? 0}
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                      {row.breakdown?.dinner ?? 0}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
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
