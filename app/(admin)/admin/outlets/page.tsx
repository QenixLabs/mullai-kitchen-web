'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Store,
  Activity,
  PowerOff,
  Gauge,
  X as XIcon,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/Auth/can';
import { useOutlets, useDeleteOutlet } from '@/api/hooks/useOutlets';
import { OutletTable } from '@/components/admin/outlets/OutletTable';
import { cn } from '@/lib/utils';
import type { Outlet } from '@/api/outlet.api';

const PAGE_SIZE = 10;

export default function OutletsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search]);

  const { data, isLoading, isError, refetch } = useOutlets({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteOutlet();

  const outlets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const stats = useMemo(() => {
    const active = outlets.filter((o) => o.status === 'active').length;
    const inactive = outlets.filter((o) => o.status === 'inactive').length;
    const capacity = outlets.reduce((sum, o) => sum + (o.kitchen_capacity ?? 0), 0);
    return { active, inactive, capacity };
  }, [outlets]);

  const handleDelete = (outlet: Outlet) => {
    deleteMutation.mutate(outlet._id);
  };

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasFilters = !!debouncedSearch || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Store className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Outlets</h1>
            <p className="text-sm text-muted-foreground">
              Manage kitchen outlets, operational hours, and delivery zones.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Store className="h-3 w-3" />
            {total} {total === 1 ? 'outlet' : 'outlets'}
          </Badge>
          <Can permission="outlet:create">
            <Button size="sm" className="h-9 gap-1.5" asChild>
              <Link href="/admin/outlets/create">
                <Plus className="h-4 w-4" />
                Create Outlet
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Store className="h-4 w-4" />}
          label="Total Outlets"
          value={isLoading ? '—' : total.toString()}
          sub={total === 0 ? 'No outlets yet' : 'Across the network'}
          tone="primary"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Active"
          value={isLoading ? '—' : stats.active.toString()}
          sub={stats.active === 0 ? 'None on this page' : 'Accepting orders'}
          tone="success"
        />
        <StatCard
          icon={<PowerOff className="h-4 w-4" />}
          label="Inactive"
          value={isLoading ? '—' : stats.inactive.toString()}
          sub={stats.inactive === 0 ? 'All live' : 'Currently paused'}
          tone="muted"
        />
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          label="Total Capacity"
          value={isLoading ? '—' : stats.capacity.toString()}
          sub={stats.capacity === 0 ? 'No capacity set' : 'Orders / hour combined'}
          tone="info"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search outlets by name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {isError ? (
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Failed to load outlets</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong while fetching the outlet list.
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="h-8">
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <OutletTable
          outlets={outlets}
          isLoading={isLoading}
          onDelete={handleDelete}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          hasFilters={hasFilters}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'muted' | 'info';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    muted: 'bg-muted text-muted-foreground ring-border',
    info: 'bg-info/15 text-info ring-info/20',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">{value}</p>
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
