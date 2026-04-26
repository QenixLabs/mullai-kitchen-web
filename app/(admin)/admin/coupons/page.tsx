'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TicketPercent,
  Search,
  Plus,
  Hash,
  Activity,
  PauseCircle,
  AlertTriangle,
  X as XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useAdminCoupons, useUpdateCouponStatus } from '@/api/hooks/useAdminCoupons';
import { CouponTable } from '@/components/admin/coupons/CouponTable';
import { cn } from '@/lib/utils';
import type { CouponStatus } from '@/api/types/coupon.types';

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CouponStatus | 'ALL'>('ALL');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search]);

  const statusParam = status === 'ALL' ? undefined : status;

  const { data, isLoading } = useAdminCoupons({
    page,
    limit: 10,
    status: statusParam,
    search: debouncedSearch || undefined,
  });

  const updateStatus = useUpdateCouponStatus();

  const coupons = data?.coupons ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const stats = useMemo(() => {
    const rows = coupons;
    const totalCount = total;
    const active = rows.filter((c) => c.status === 'ACTIVE').length;
    const inactive = rows.filter((c) => c.status === 'INACTIVE').length;
    const expired = rows.filter((c) => c.status === 'EXPIRED').length;
    return { total: totalCount, active, inactive, expired };
  }, [coupons, total]);

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleStatusChange = (coupon: (typeof coupons)[number], newStatus: CouponStatus) => {
    updateStatus.mutate({ id: coupon._id, data: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <TicketPercent className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Coupons</h1>
            <p className="text-sm text-muted-foreground">
              Manage discount codes, validity, and usage limits.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Hash className="h-3 w-3" />
            {stats.total} {stats.total === 1 ? 'coupon' : 'coupons'}
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Hash className="h-4 w-4" />}
          label="Total"
          value={isLoading ? '—' : stats.total.toString()}
          tone="primary"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Active"
          value={isLoading ? '—' : stats.active.toString()}
          tone="success"
        />
        <StatCard
          icon={<PauseCircle className="h-4 w-4" />}
          label="Inactive"
          value={isLoading ? '—' : stats.inactive.toString()}
          tone="muted"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Expired"
          value={isLoading ? '—' : stats.expired.toString()}
          tone="warning"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by coupon code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-9"
            />
          </div>
          {debouncedSearch && (
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
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Status
            </span>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as CouponStatus | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px] gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Can permission="coupon:manage">
              <Button className="h-9 gap-1.5" asChild>
                <Link href="/admin/coupons/create">
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </Link>
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <CouponTable
        data={coupons}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'muted';
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    info: 'bg-info/15 text-info ring-info/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
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
