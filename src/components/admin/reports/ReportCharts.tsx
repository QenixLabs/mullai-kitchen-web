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
} from 'recharts';

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
  color = '#39070F',
}: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface RevenueBarChartProps {
  data: Array<{ period: string; revenue: number }>;
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#39070F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PaymentMethodPieChartProps {
  data: Array<{ method: string; amount: number }>;
}

export function PaymentMethodPieChart({ data }: PaymentMethodPieChartProps) {
  const colors = ['#39070F', '#4F0D1A', '#230509', '#2D0610', '#3D0815'];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="method"
          cx="50%"
          cy="50%"
          outerRadius={100}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RevenueAreaChartProps {
  data: Array<{ date: string; subscription: number; one_time: number }>;
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="subscription"
          stackId="1"
          stroke="#39070F"
          fill="#39070F"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="one_time"
          stackId="1"
          stroke="#4F0D1A"
          fill="#4F0D1A"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
