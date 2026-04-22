'use client';

import { Users, UserCheck, Clock, Ban, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BentoStatsCard } from '@/components/admin/layout/BentoStatsCard';
import { useUserStats } from '@/api/hooks/useAdminUsers';

export function UserStatsGrid() {
  const stats = useUserStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <BentoStatsCard
        label="TOTAL USERS"
        value={stats.isLoading ? <Skeleton className="h-9 w-20 rounded-xl" /> : stats.totalStaff?.toLocaleString() ?? '0'}
        icon={Users}
      />
      <BentoStatsCard
        label="ACTIVE USERS"
        value={stats.isLoading ? <Skeleton className="h-9 w-20 rounded-xl" /> : '1,100'}
        icon={UserCheck}
      />
      <BentoStatsCard
        label="PENDING"
        value={stats.isLoading ? <Skeleton className="h-9 w-20 rounded-xl" /> : (stats.pendingCount?.toLocaleString() ?? '0')}
        icon={Clock}
      />
      <BentoStatsCard
        label="BLOCKED"
        value={stats.isLoading ? <Skeleton className="h-9 w-20 rounded-xl" /> : '12'}
        icon={Ban}
      />
      <BentoStatsCard
        label="NEW THIS WEEK"
        value={stats.isLoading ? <Skeleton className="h-9 w-20 rounded-xl" /> : '24'}
        icon={TrendingUp}
      />
    </div>
  );
}
