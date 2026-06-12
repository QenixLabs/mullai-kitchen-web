'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

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

const PIE_COLORS = [
  '#39070F',
  '#6B1B2A',
  '#A14D5A',
  '#D4A574',
  '#8B7355',
  '#5C4A3A',
];

/* ─── Shared Tooltip ─── */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: unknown; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
            <span className="text-sm font-bold text-foreground tabular-nums ml-auto">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString('en-IN')
                : String(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Line Chart ─── */
interface TrendLineChartProps {
  data: Array<Record<string, unknown>> | Array<{ period: string; orders_count: number; revenue: number }>;
  dataKey: string;
  xKey?: string;
  color?: string;
}

export function TrendLineChart({
  data,
  dataKey,
  xKey = 'period',
  color = BRAND_COLORS.primary,
}: TrendLineChartProps) {
  const values = data.map(d => (d as Record<string, number>)[dataKey] ?? 0);
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const maxVal = Math.max(...values, 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mkLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="50%" stopColor={color} stopOpacity={0.08} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          domain={[0, Math.ceil(maxVal * 1.2)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          y={avg}
          stroke={BRAND_COLORS.primaryMuted}
          strokeDasharray="6 4"
          strokeOpacity={0.5}
          label={{
            value: 'Avg',
            position: 'right',
            fill: BRAND_COLORS.primaryMuted,
            fontSize: 10,
          }}
        />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="none"
          fill="url(#mkLineFill)"
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: color, strokeWidth: 3, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Bar Chart ─── */
interface RevenueBarChartProps {
  data: Array<{ period: string; revenue: number }>;
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mkBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.primaryLight} />
            <stop offset="100%" stopColor={BRAND_COLORS.primary} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          domain={[0, Math.ceil(maxRev * 1.15)]}
        />
        <Tooltip content={<ChartTooltip />} />

        <Bar dataKey="revenue" fill="url(#mkBarFill)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Pie Chart ─── */
interface PaymentMethodPieChartProps {
  data: Array<{ method: string; amount: number }>;
}

export function PaymentMethodPieChart({ data }: PaymentMethodPieChartProps) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            const val = p.value as number;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return (
              <div className="rounded-lg border border-border/60 bg-card px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: p.payload?.fill }}
                  />
                  <p className="text-xs font-semibold text-muted-foreground">{p.name}</p>
                </div>
                <p className="text-sm font-bold text-foreground">₹{val.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{pct}% of total</p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={40}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs font-medium text-muted-foreground ml-1.5">{value}</span>
          )}
        />
        <Pie
          data={data}
          dataKey="amount"
          nameKey="method"
          cx="50%"
          cy="42%"
          outerRadius={85}
          innerRadius={52}
          stroke="hsl(var(--card))"
          strokeWidth={3}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Area Chart ─── */
interface RevenueAreaChartProps {
  data: Array<{ date: string; subscription: number; one_time: number }>;
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const maxVal = Math.max(
    ...data.flatMap(d => [d.subscription, d.one_time]),
    1,
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mkSubFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND_COLORS.primary} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="mkOtFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND_COLORS.gold} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          domain={[0, Math.ceil(maxVal * 1.2)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs font-medium text-muted-foreground ml-1">{value}</span>
          )}
        />

        <Area
          type="monotone"
          dataKey="subscription"
          stackId="1"
          stroke={BRAND_COLORS.primary}
          strokeWidth={2.5}
          fill="url(#mkSubFill)"
        />
        <Area
          type="monotone"
          dataKey="one_time"
          stackId="1"
          stroke={BRAND_COLORS.gold}
          strokeWidth={2.5}
          fill="url(#mkOtFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Sparkline ─── */
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = BRAND_COLORS.primary, height = 40 }: SparklineProps) {
  if (data.length < 2) return <div style={{ height }} />;
  const chartData = data.map((v, i) => ({ i, v }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="none" fill="url(#sparkFill)" />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
        <YAxis domain={[min - range * 0.1, max + range * 0.1]} hide />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Revenue vs Expense Bar Chart ─── */
interface RevenueExpenseChartProps {
  data: Array<{
    date: string;
    individual_revenue: number;
    addon_revenue?: number;
    corporate_revenue: number;
    procurement_expense?: number;
    ingredient_expense: number;
  }>;
  visibleSeries?: Record<string, boolean>;
}

export function RevenueExpenseChart({ data, visibleSeries }: RevenueExpenseChartProps) {
  const hasAddons = data.some(d => (d.addon_revenue ?? 0) > 0);
  const hasProcurement = data.some(d => (d.procurement_expense ?? 0) > 0);

  const maxVal = Math.max(
    ...data.flatMap(d => [
      d.individual_revenue + (d.addon_revenue ?? 0) + d.corporate_revenue,
      (d.procurement_expense ?? 0) + d.ingredient_expense,
    ]),
    1,
  );

  const isVisible = (key: string) => visibleSeries?.[key] !== false;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mkIndFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.primaryLight} />
            <stop offset="100%" stopColor={BRAND_COLORS.primary} />
          </linearGradient>
          <linearGradient id="mkAddonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.sky} />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="mkCorpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.gold} />
            <stop offset="100%" stopColor={BRAND_COLORS.goldLight} />
          </linearGradient>
          <linearGradient id="mkProcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.amber} />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          domain={[0, Math.ceil(maxVal * 1.2)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs font-medium text-muted-foreground ml-1">{value}</span>
          )}
        />

        {isVisible('individual') && <Bar dataKey="individual_revenue" name="Individual" stackId="revenue" fill="url(#mkIndFill)" radius={[0, 0, 0, 0]} maxBarSize={36} />}
        {hasAddons && isVisible('addon') && <Bar dataKey="addon_revenue" name="Add-ons" stackId="revenue" fill="url(#mkAddonFill)" radius={[0, 0, 0, 0]} maxBarSize={36} />}
        {isVisible('corporate') && <Bar dataKey="corporate_revenue" name="Corporate" stackId="revenue" fill="url(#mkCorpFill)" radius={hasAddons ? [0, 0, 0, 0] : [4, 4, 0, 0]} maxBarSize={36} />}
        {hasProcurement && isVisible('procurement') && <Bar dataKey="procurement_expense" name="Procurement" stackId="expense" fill="url(#mkProcFill)" radius={[0, 0, 0, 0]} maxBarSize={36} />}
        {isVisible('ingredient') && <Bar dataKey="ingredient_expense" name="Ingredient" stackId="expense" fill={BRAND_COLORS.rose} radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.85} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Revenue vs Expense Area Chart ─── */
interface RevenueExpenseAreaChartProps {
  data: Array<{
    date: string;
    individual_revenue: number;
    addon_revenue?: number;
    corporate_revenue: number;
    procurement_expense?: number;
    ingredient_expense: number;
  }>;
  visibleSeries?: Record<string, boolean>;
}

export function RevenueExpenseAreaChart({ data, visibleSeries }: RevenueExpenseAreaChartProps) {
  const isVisible = (key: string) => visibleSeries?.[key] !== false;
  const maxVal = Math.max(
    ...data.flatMap(d => [
      d.individual_revenue + (d.addon_revenue ?? 0) + d.corporate_revenue,
      (d.procurement_expense ?? 0) + d.ingredient_expense,
    ]),
    1,
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaInd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.primary} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BRAND_COLORS.primary} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="areaCorp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.gold} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BRAND_COLORS.gold} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="areaExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.rose} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BRAND_COLORS.rose} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          domain={[0, Math.ceil(maxVal * 1.2)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs font-medium text-muted-foreground ml-1">{value}</span>
          )}
        />

        {isVisible('individual') && <Area type="monotone" dataKey="individual_revenue" name="Individual" stackId="rev" stroke={BRAND_COLORS.primary} strokeWidth={2} fill="url(#areaInd)" />}
        {isVisible('addon') && <Area type="monotone" dataKey="addon_revenue" name="Add-ons" stackId="rev" stroke={BRAND_COLORS.sky} strokeWidth={2} fill="url(#areaInd)" />}
        {isVisible('corporate') && <Area type="monotone" dataKey="corporate_revenue" name="Corporate" stackId="rev" stroke={BRAND_COLORS.gold} strokeWidth={2} fill="url(#areaCorp)" />}
        {isVisible('procurement') && <Area type="monotone" dataKey="procurement_expense" name="Procurement" stackId="exp" stroke={BRAND_COLORS.amber} strokeWidth={2} fill="url(#areaExp)" />}
        {isVisible('ingredient') && <Area type="monotone" dataKey="ingredient_expense" name="Ingredient" stackId="exp" stroke={BRAND_COLORS.rose} strokeWidth={2} fill="url(#areaExp)" />}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Revenue vs Expense Line Chart ─── */
interface RevenueExpenseLineChartProps {
  data: Array<{
    date: string;
    individual_revenue: number;
    addon_revenue?: number;
    corporate_revenue: number;
    procurement_expense?: number;
    ingredient_expense: number;
  }>;
  visibleSeries?: Record<string, boolean>;
}

export function RevenueExpenseLineChart({ data, visibleSeries }: RevenueExpenseLineChartProps) {
  const isVisible = (key: string) => visibleSeries?.[key] !== false;
  const maxVal = Math.max(
    ...data.flatMap(d => [
      d.individual_revenue + (d.addon_revenue ?? 0) + d.corporate_revenue,
      (d.procurement_expense ?? 0) + d.ingredient_expense,
    ]),
    1,
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          domain={[0, Math.ceil(maxVal * 1.2)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs font-medium text-muted-foreground ml-1">{value}</span>
          )}
        />

        {isVisible('individual') && <Line type="monotone" dataKey="individual_revenue" name="Individual" stroke={BRAND_COLORS.primary} strokeWidth={2.5} dot={{ r: 3, fill: BRAND_COLORS.primary, strokeWidth: 2, stroke: '#fff' }} />}
        {isVisible('addon') && <Line type="monotone" dataKey="addon_revenue" name="Add-ons" stroke={BRAND_COLORS.sky} strokeWidth={2.5} dot={{ r: 3, fill: BRAND_COLORS.sky, strokeWidth: 2, stroke: '#fff' }} />}
        {isVisible('corporate') && <Line type="monotone" dataKey="corporate_revenue" name="Corporate" stroke={BRAND_COLORS.gold} strokeWidth={2.5} dot={{ r: 3, fill: BRAND_COLORS.gold, strokeWidth: 2, stroke: '#fff' }} />}
        {isVisible('procurement') && <Line type="monotone" dataKey="procurement_expense" name="Procurement" stroke={BRAND_COLORS.amber} strokeWidth={2.5} dot={{ r: 3, fill: BRAND_COLORS.amber, strokeWidth: 2, stroke: '#fff' }} />}
        {isVisible('ingredient') && <Line type="monotone" dataKey="ingredient_expense" name="Ingredient" stroke={BRAND_COLORS.rose} strokeWidth={2.5} dot={{ r: 3, fill: BRAND_COLORS.rose, strokeWidth: 2, stroke: '#fff' }} />}
      </LineChart>
    </ResponsiveContainer>
  );
}
