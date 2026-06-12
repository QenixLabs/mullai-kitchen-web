'use client';

import { useState, useMemo } from 'react';
import { format, subDays, subMonths, differenceInDays } from 'date-fns';
import {
  Wallet,
  Users,
  Briefcase,
  ShoppingBag,
  Receipt,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PackageOpen,
  CalendarDays,
  BarChart2,
  AreaChart as AreaChartIcon,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import {
  Sparkline,
  RevenueExpenseChart,
  RevenueExpenseAreaChart,
  RevenueExpenseLineChart,
} from '../reports/ReportCharts';
import { useRevenueAnalytics } from '@/api/hooks/useAdminReports';
import type { ReportGranularity, IDailyRevenueBreakdown } from '@/api/types/admin.types';

const formatCurrency = (n?: number | null) => `₹${(n ?? 0).toLocaleString('en-IN')}`;

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';
type ChartType = 'bar' | 'area' | 'line';

function getDateRange(period: PeriodType, customStart?: Date, customEnd?: Date): { start: string; end: string; granularity: ReportGranularity } {
  const today = new Date();
  switch (period) {
    case 'daily':
      return {
        start: format(subDays(today, 6), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
        granularity: 'daily',
      };
    case 'weekly':
      return {
        start: format(subDays(today, 27), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
        granularity: 'weekly',
      };
    case 'monthly':
      return {
        start: format(subMonths(today, 2), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
        granularity: 'monthly',
      };
    case 'custom':
      return {
        start: customStart ? format(customStart, 'yyyy-MM-dd') : format(subDays(today, 6), 'yyyy-MM-dd'),
        end: customEnd ? format(customEnd, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),
        granularity: 'daily',
      };
  }
}

function getPreviousPeriodRange(start: string, end: string): { start: string; end: string } {
  const s = new Date(start);
  const e = new Date(end);
  const days = differenceInDays(e, s) + 1;
  return {
    start: format(subDays(s, days), 'yyyy-MM-dd'),
    end: format(subDays(s, 1), 'yyyy-MM-dd'),
  };
}

/* ─── Profit Margin Ring ─── */
function ProfitRing({ percentage, size = 72 }: { percentage: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.abs(percentage), 100) / 100) * circumference;
  const isProfit = percentage >= 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isProfit ? '#10B981' : '#F43F5E'}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-xs font-bold', isProfit ? 'text-emerald-600' : 'text-rose-600')}>
          {percentage >= 0 ? '+' : ''}{percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/* ─── KPI Card with Sparkline ─── */
function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
  sparklineData,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
  sparklineData?: number[];
  delay?: number;
}) {
  const toneStyles = {
    primary: {
      card: 'bg-gradient-to-br from-card to-primary/[0.03]',
      icon: 'bg-primary/10 text-primary',
      spark: BRAND_COLORS.primary,
    },
    success: {
      card: 'bg-gradient-to-br from-card to-emerald-500/[0.03]',
      icon: 'bg-emerald-50 text-emerald-600',
      spark: '#10B981',
    },
    warning: {
      card: 'bg-gradient-to-br from-card to-amber-500/[0.03]',
      icon: 'bg-amber-50 text-amber-600',
      spark: '#F59E0B',
    },
    info: {
      card: 'bg-gradient-to-br from-card to-sky-500/[0.03]',
      icon: 'bg-sky-50 text-sky-600',
      spark: '#0EA5E9',
    },
    destructive: {
      card: 'bg-gradient-to-br from-card to-rose-500/[0.03]',
      icon: 'bg-rose-50 text-rose-600',
      spark: '#F43F5E',
    },
    muted: {
      card: 'bg-gradient-to-br from-card to-muted/30',
      icon: 'bg-muted text-muted-foreground',
      spark: '#8B4A55',
    },
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn('overflow-hidden shadow-sm border-border/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300', toneStyles[tone].card)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
                {value}
              </p>
              {sub && (
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              )}
              {sparklineData && sparklineData.length > 1 && (
                <div className="pt-1">
                  <Sparkline data={sparklineData} color={toneStyles[tone].spark} height={32} />
                </div>
              )}
            </div>
            <span className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneStyles[tone].icon)}>
              {icon}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const BRAND_COLORS = {
  primary: '#39070F',
  primaryDark: '#230509',
  primaryLight: '#4F0D1A',
  primaryMuted: '#8B4A55',
  gold: '#D4A574',
  goldLight: '#ECD1B4',
  emerald: '#10B981',
  sky: '#0EA5E9',
  rose: '#F43F5E',
  amber: '#F59E0B',
};

const SERIES_CONFIG = [
  { key: 'individual', label: 'Individual', color: BRAND_COLORS.primary },
  { key: 'addon', label: 'Add-ons', color: BRAND_COLORS.sky },
  { key: 'corporate', label: 'Corporate', color: BRAND_COLORS.gold },
  { key: 'procurement', label: 'Procurement', color: BRAND_COLORS.amber },
  { key: 'ingredient', label: 'Ingredient', color: BRAND_COLORS.rose },
] as const;

function ChangeBadge({ change }: { change: { pct: number; direction: 'up' | 'down' | 'flat' } }) {
  if (change.direction === 'flat') return <span className="text-[10px] text-muted-foreground">—</span>;
  const Icon = change.direction === 'up' ? TrendingUp : TrendingDown;
  const color = change.direction === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold', color)}>
      <Icon className="h-3 w-3" />
      {change.pct.toFixed(0)}%
    </span>
  );
}

export function DashboardExpenseRevenue() {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [customStart, setCustomStart] = useState<Date | undefined>(subDays(new Date(), 6));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date());
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    individual: true,
    addon: true,
    corporate: true,
    procurement: true,
    ingredient: true,
  });

  const { start, end, granularity } = useMemo(
    () => getDateRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const { data, isLoading } = useRevenueAnalytics({
    start_date: start,
    end_date: end,
    granularity,
  });

  // Fetch previous period for comparison
  const prevRange = useMemo(() => getPreviousPeriodRange(start, end), [start, end]);
  const { data: prevData } = useRevenueAnalytics({
    start_date: prevRange.start,
    end_date: prevRange.end,
    granularity,
  });

  const daily = data?.daily_breakdown ?? [];

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const profitMargin = data && data.total_revenue > 0
    ? (data.profit_or_loss / data.total_revenue) * 100
    : 0;

  // Comparison helper
  const getChange = (current: number, previous: number): { pct: number; direction: 'up' | 'down' | 'flat' } => {
    if (previous === 0) return { pct: 0, direction: current > 0 ? 'up' : 'flat' };
    const pct = ((current - previous) / previous) * 100;
    return {
      pct: Math.abs(pct),
      direction: pct > 2 ? 'up' : pct < -2 ? 'down' : 'flat',
    };
  };

  const totalRevenueChange = getChange(data?.total_revenue ?? 0, prevData?.total_revenue ?? 0);
  const expenseChange = getChange(
    (data?.total_procurement_expense ?? 0) + (data?.total_ingredient_expense ?? 0),
    (prevData?.total_procurement_expense ?? 0) + (prevData?.total_ingredient_expense ?? 0),
  );
  const profitChange = getChange(data?.profit_or_loss ?? 0, prevData?.profit_or_loss ?? 0);

  // Extract sparkline data from daily breakdown
  const getSparkline = (key: keyof IDailyRevenueBreakdown): number[] =>
    daily.map(d => (d[key] as number) ?? 0);

  const chartComponents = {
    bar: RevenueExpenseChart,
    area: RevenueExpenseAreaChart,
    line: RevenueExpenseLineChart,
  };

  const ChartComponent = chartComponents[chartType];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Expense vs Revenue
          </h3>
          {daily.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {granularity === 'daily' && `Last ${daily.length} days`}
              {granularity === 'weekly' && `Last ${daily.length} weeks`}
              {granularity === 'monthly' && `Last ${daily.length} months`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                chartType === 'bar' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              title="Bar chart"
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                chartType === 'area' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              title="Area chart"
            >
              <AreaChartIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                chartType === 'line' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              title="Line chart"
            >
              <Activity className="h-3.5 w-3.5" />
            </button>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs px-3">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Custom Date Range */}
      <AnimatePresence>
        {period === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <DatePicker
              date={customStart}
              onDateChange={setCustomStart}
              placeholder="Start date"
              maxDate={customEnd}
              className="w-40"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <DatePicker
              date={customEnd}
              onDateChange={setCustomEnd}
              placeholder="End date"
              minDate={customStart}
              maxDate={new Date()}
              className="w-40"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || !daily.length ? (
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="rounded-full bg-primary/5 p-4 text-primary/60">
                <PackageOpen className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">No data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust the date range to see expense vs revenue analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Row: Revenue KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<Wallet className="h-4 w-4" />}
              label="Total Revenue"
              value={formatCurrency(data.total_revenue)}
              sub={
                <span className="flex items-center gap-1.5">
                  <ChangeBadge change={totalRevenueChange} />
                  <span className="text-muted-foreground">vs previous period</span>
                </span>
              }
              tone="primary"
              sparklineData={getSparkline('total_revenue')}
              delay={0}
            />
            <KpiCard
              icon={<Users className="h-4 w-4" />}
              label="Individual"
              value={formatCurrency(data.individual_revenue)}
              sub="Subscription payments"
              tone="info"
              sparklineData={getSparkline('individual_revenue')}
              delay={0.05}
            />
            <KpiCard
              icon={<ShoppingBag className="h-4 w-4" />}
              label="Add-ons"
              value={formatCurrency(data.addon_revenue)}
              sub="One-time orders"
              tone="warning"
              sparklineData={getSparkline('addon_revenue')}
              delay={0.1}
            />
            <KpiCard
              icon={<Briefcase className="h-4 w-4" />}
              label="Corporate"
              value={formatCurrency(data.corporate_revenue)}
              sub="Billed invoices"
              tone="muted"
              sparklineData={getSparkline('corporate_revenue')}
              delay={0.15}
            />
          </div>

          {/* Bottom Row: Expense + Profit */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<Receipt className="h-4 w-4" />}
              label="Total Expense"
              value={formatCurrency(data.total_procurement_expense + data.total_ingredient_expense)}
              sub={
                <span className="flex items-center gap-1.5">
                  <ChangeBadge change={expenseChange} />
                  <span className="text-muted-foreground">vs previous period</span>
                </span>
              }
              tone="destructive"
              sparklineData={daily.map(d => d.procurement_expense + d.ingredient_expense)}
              delay={0.2}
            />
            <KpiCard
              icon={<Package className="h-4 w-4" />}
              label="Procurement"
              value={formatCurrency(data.total_procurement_expense)}
              sub="Ingredient purchases"
              tone="destructive"
              sparklineData={getSparkline('procurement_expense')}
              delay={0.25}
            />
            <KpiCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Ingredient Cost"
              value={formatCurrency(data.total_ingredient_expense)}
              sub="Consumption from orders"
              tone="destructive"
              sparklineData={getSparkline('ingredient_expense')}
              delay={0.3}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className={cn(
                'overflow-hidden shadow-sm border-border/40 hover:shadow-md transition-all duration-300',
                data.profit_or_loss >= 0
                  ? 'bg-gradient-to-br from-card to-emerald-500/[0.03]'
                  : 'bg-gradient-to-br from-card to-rose-500/[0.03]'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {data.profit_or_loss >= 0 ? 'Profit' : 'Loss'}
                      </p>
                      <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
                        {formatCurrency(Math.abs(data.profit_or_loss))}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <ChangeBadge change={profitChange} />
                        <span className="text-muted-foreground text-xs">vs previous</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ProfitRing percentage={profitMargin} />
                      <span className="text-[10px] text-muted-foreground font-medium">margin</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardContent className="p-5">
                <ChartComponent data={daily} visibleSeries={visibleSeries} />

                {/* Interactive Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {SERIES_CONFIG.map(s => (
                    <button
                      key={s.key}
                      onClick={() => toggleSeries(s.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                        visibleSeries[s.key]
                          ? 'border-border/60 bg-card text-foreground shadow-sm'
                          : 'border-transparent bg-muted/30 text-muted-foreground opacity-60',
                      )}
                    >
                      {visibleSeries[s.key] ? (
                        <Eye className="h-3 w-3" style={{ color: s.color }} />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color, opacity: visibleSeries[s.key] ? 1 : 0.3 }}
                      />
                      {s.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
