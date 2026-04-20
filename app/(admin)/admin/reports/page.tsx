import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';

function StatSkeleton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl bg-white p-6"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      <div className="flex items-start justify-between">
        <span
          className="text-xs font-bold uppercase tracking-[1.2px]"
          style={{ color: '#554243' }}
        >
          {label}
        </span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(68,21,28,0.06)', color: '#44151c' }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div
          className="h-2 w-16 rounded-full"
          style={{ backgroundColor: 'rgba(219,192,193,0.25)' }}
        />
        <span className="text-xs font-bold" style={{ color: '#d97706' }}>
          Soon
        </span>
      </div>
    </div>
  );
}

function MiniChart() {
  // Decorative SVG mini bar chart
  const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95];
  return (
    <svg
      viewBox="0 0 240 80"
      className="w-full h-20"
      preserveAspectRatio="none"
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 20}
          y={80 - h}
          width="12"
          height={h}
          rx="4"
          fill={i % 3 === 0 ? '#44151c' : 'rgba(68,21,28,0.15)'}
          opacity={0.6 + (i % 3) * 0.1}
        />
      ))}
    </svg>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports & Analytics"
        subtitle="View business analytics, sales reports, and performance metrics."
      />

      {/* Placeholder stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeleton
          label="TOTAL REVENUE"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatSkeleton
          label="TOTAL ORDERS"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatSkeleton
          label="ACTIVE USERS"
          icon={<Users className="h-5 w-5" />}
        />
        <StatSkeleton
          label="GROWTH RATE"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div
        className="rounded-3xl bg-white overflow-hidden"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        {/* Decorative top bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              'linear-gradient(90deg, #44151c 0%, #5d101d 50%, #44151c 100%)',
          }}
        />

        <div className="p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Animated-ish icon ring */}
            <div className="relative mb-6">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)',
                  boxShadow: '0 8px 32px rgba(61,0,12,0.25)',
                }}
              >
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: '#d97706' }}
              >
                <Clock className="h-3 w-3 text-white" />
              </div>
            </div>

            <h3
              className="text-xl font-bold mb-2"
              style={{ color: '#3d000c' }}
            >
              Reports Coming Soon
            </h3>
            <p
              className="text-lg text-muted-foreground leading-relaxed"
              style={{ color: '#554243' }}
            >
              Our analytics dashboard is currently under development. Soon you
              will be able to track revenue, order trends, customer growth, and
              kitchen performance in real-time.
            </p>

            {/* Feature teaser pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Sales Reports', icon: <TrendingUp className="h-3 w-3" /> },
                { label: 'User Analytics', icon: <Users className="h-3 w-3" /> },
                { label: 'Order Insights', icon: <ShoppingBag className="h-3 w-3" /> },
                { label: 'Export Data', icon: <ArrowUpRight className="h-3 w-3" /> },
              ].map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: 'rgba(68,21,28,0.06)',
                    color: '#44151c',
                  }}
                >
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          {/* Decorative chart area */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'rgba(68,21,28,0.02)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#554243' }}
              >
                Revenue Overview
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(217,119,6,0.12)',
                  color: '#d97706',
                }}
              >
                Preview
              </span>
            </div>
            <MiniChart />
          </div>
        </div>
      </div>
    </div>
  );
}
