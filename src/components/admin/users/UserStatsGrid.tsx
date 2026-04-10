'use client';

import { Users, Shield, Store, Bike } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/api/hooks/useAdminUsers';

const STATS = [
  { key: 'totalStaff' as const, label: 'Total Staff', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'admins' as const, label: 'Admins', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  { key: 'hubOwners' as const, label: 'Hub Owners', icon: Store, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  { key: 'activeRiders' as const, label: 'Active Riders', icon: Bike, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
];

export function UserStatsGrid() {
  const stats = useUserStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = stats[stat.key];
        return (
          <div
            key={stat.key}
            className="bg-card rounded-3xl p-5 sm:p-6 border border-border/40 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </div>
            {stats.isLoading ? (
              <Skeleton className="h-9 w-20 rounded-xl" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {value.toLocaleString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
