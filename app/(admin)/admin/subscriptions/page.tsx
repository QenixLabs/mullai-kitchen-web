'use client';

import { useState, useMemo } from 'react';
import { Search, X, Users, Play, Pause, CalendarX, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdminSubscriptions } from '@/api/hooks/useAdminSubscriptions';
import { SubscriptionTable } from '@/components/admin/subscriptions/SubscriptionTable';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import { cn } from '@/lib/utils';

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminSubscriptions({
    search: search || undefined,
    status: (status as SubscriptionStatus) || undefined,
    page,
    limit: 10,
  });

  const subscriptions = data?.data ?? [];

  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE).length;
    const paused = subscriptions.filter((s) => s.status === SubscriptionStatus.PAUSED).length;
    const inactive = subscriptions.filter(
      (s) => s.status === SubscriptionStatus.EXPIRED || s.status === SubscriptionStatus.CANCELLED,
    ).length;
    return { total, active, paused, inactive };
  }, [subscriptions]);

  const hasFilters = search || status;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
          <ClipboardList className="h-3.5 w-3.5" />
          Subscriptions
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer subscriptions, pauses, and delivery schedules.
        </p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Subscriptions"
          value={isLoading ? '-' : stats.total.toString()}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Play}
          label="Active"
          value={isLoading ? '-' : stats.active.toString()}
          color="bg-success/10 text-success"
        />
        <StatCard
          icon={Pause}
          label="Paused"
          value={isLoading ? '-' : stats.paused.toString()}
          color="bg-warning/10 text-warning"
        />
        <StatCard
          icon={CalendarX}
          label="Expired / Cancelled"
          value={isLoading ? '-' : stats.inactive.toString()}
          color="bg-muted text-muted-foreground"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={SubscriptionStatus.PAUSED}>Paused</SelectItem>
            <SelectItem value={SubscriptionStatus.EXPIRED}>Expired</SelectItem>
            <SelectItem value={SubscriptionStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
            }}
          >
            <X data-icon="inline-start" className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <SubscriptionTable
        data={subscriptions}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn(
          'flex size-11 items-center justify-center rounded-xl shrink-0',
          color,
        )}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none text-foreground">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
