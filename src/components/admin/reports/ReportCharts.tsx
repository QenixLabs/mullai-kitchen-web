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

/* ─── Revenue vs Expense Chart ─── */
interface RevenueExpenseChartProps {
  data: Array<{
    date: string;
    individual_revenue: number;
    corporate_revenue: number;
    ingredient_expense: number;
  }>;
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const maxVal = Math.max(
    ...data.flatMap(d => [d.individual_revenue + d.corporate_revenue, d.ingredient_expense]),
    1,
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mkIndFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.primaryLight} />
            <stop offset="100%" stopColor={BRAND_COLORS.primary} />
          </linearGradient>
          <linearGradient id="mkCorpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_COLORS.gold} />
            <stop offset="100%" stopColor={BRAND_COLORS.goldLight} />
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

        <Bar dataKey="individual_revenue" name="Individual Revenue" stackId="revenue" fill="url(#mkIndFill)" radius={[0, 0, 0, 0]} maxBarSize={36} />
        <Bar dataKey="corporate_revenue" name="Corporate Revenue" stackId="revenue" fill="url(#mkCorpFill)" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="ingredient_expense" name="Ingredient Expense" fill={BRAND_COLORS.rose} radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}
