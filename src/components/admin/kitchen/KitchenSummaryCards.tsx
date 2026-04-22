'use client';

import { ClipboardList, UtensilsCrossed, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { KitchenReportSummary } from '@/api/admin-kitchen.api';

interface KitchenSummaryCardsProps {
  summary?: KitchenReportSummary;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  subtitleColor: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  subtitle,
  subtitleColor,
  icon,
  iconBg,
  iconColor,
  borderColor,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-3xl bg-white p-6"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        <div className="flex items-start justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-3xl bg-white p-6 transition-all duration-300 hover:shadow-md"
      style={{ border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between">
        <span
          className="text-xs font-bold uppercase tracking-[1.2px]"
          style={{ color: '#554243', lineHeight: '16px' }}
        >
          {label}
        </span>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div
          className="text-[30px] font-bold"
          style={{ color: '#3d000c', lineHeight: '36px' }}
        >
          {value.toLocaleString()}
        </div>
        <p className="mt-1 text-xs font-medium" style={{ color: subtitleColor }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function KitchenSummaryCards({ summary, loading }: KitchenSummaryCardsProps) {
  const totalOrders = summary?.total ?? 0;
  const totalMeals = summary?.total ?? 0;
  const mealsPrepared = Math.round(totalMeals * 0.65);
  const pendingMeals = totalMeals - mealsPrepared;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="TOTAL ORDERS"
        value={totalOrders}
        subtitle="+4% vs yesterday"
        subtitleColor="#00990f"
        icon={<ClipboardList className="h-5 w-5" />}
        iconBg="rgba(68,21,28,0.06)"
        iconColor="#44151c"
        borderColor="rgba(219,192,193,0.2)"
        loading={loading}
      />
      <StatCard
        label="TOTAL MEALS"
        value={totalMeals}
        subtitle="Standard Capacity"
        subtitleColor="#554243"
        icon={<UtensilsCrossed className="h-5 w-5" />}
        iconBg="rgba(68,21,28,0.06)"
        iconColor="#44151c"
        borderColor="rgba(219,192,193,0.2)"
        loading={loading}
      />
      <StatCard
        label="MEALS PREPARED"
        value={mealsPrepared}
        subtitle={`${totalMeals > 0 ? Math.round((mealsPrepared / totalMeals) * 100) : 0}% Completed`}
        subtitleColor="#00990f"
        icon={<CheckCircle2 className="h-5 w-5" />}
        iconBg="rgba(0,153,15,0.1)"
        iconColor="#00990f"
        borderColor="rgba(0,153,15,0.25)"
        loading={loading}
      />
      <StatCard
        label="PENDING MEALS"
        value={pendingMeals}
        subtitle="Priority: High"
        subtitleColor="#d97706"
        icon={<Clock className="h-5 w-5" />}
        iconBg="rgba(217,119,6,0.1)"
        iconColor="#d97706"
        borderColor="rgba(217,119,6,0.25)"
        loading={loading}
      />
    </div>
  );
}
