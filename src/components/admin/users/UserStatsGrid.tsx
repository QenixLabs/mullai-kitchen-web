'use client';

import { Users, Shield, Store, Bike } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/api/hooks/useAdminUsers';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'muted' | 'info' | 'warning';
  isLoading?: boolean;
}

function StatCard({ icon, label, value, sub, tone, isLoading }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    muted: 'bg-muted text-muted-foreground ring-border',
    info: 'bg-info/15 text-info ring-info/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 rounded-md" />
            ) : (
              <p className="text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">
                {value}
              </p>
            )}
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
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

export function UserStatsGrid() {
  const stats = useUserStats();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-4 w-4" />}
        label="Total Staff"
        value={stats.totalStaff.toLocaleString()}
        sub={stats.totalStaff === 0 ? 'No users yet' : 'Across all roles'}
        tone="primary"
        isLoading={stats.isLoading}
      />
      <StatCard
        icon={<Shield className="h-4 w-4" />}
        label="Admins"
        value={stats.admins.toLocaleString()}
        sub={stats.admins === 0 ? 'None onboarded' : 'Super admin access'}
        tone="info"
        isLoading={stats.isLoading}
      />
      <StatCard
        icon={<Store className="h-4 w-4" />}
        label="Hub Owners"
        value={stats.hubOwners.toLocaleString()}
        sub={stats.hubOwners === 0 ? 'None assigned' : 'Outlet operators'}
        tone="warning"
        isLoading={stats.isLoading}
      />
      <StatCard
        icon={<Bike className="h-4 w-4" />}
        label="Active Riders"
        value={stats.activeRiders.toLocaleString()}
        sub={stats.activeRiders === 0 ? 'No riders live' : 'Currently delivering'}
        tone="success"
        isLoading={stats.isLoading}
      />
    </div>
  );
}
