'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Activity,
  Users,
  ClipboardList,
  X as XIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminCorporateCompanies } from '@/api/hooks/useAdminCorporate';
import { CorporateCompanyTable } from '@/components/admin/corporate/CorporateCompanyTable';
import { cn } from '@/lib/utils';

export default function CorporateCompaniesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
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

  const { data, isLoading } = useAdminCorporateCompanies({
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  const stats = useMemo(() => {
    const companies = data?.data ?? [];
    const active = companies.filter((c) => c.active_orders_count > 0).length;
    const inactive = companies.filter((c) => c.active_orders_count === 0).length;
    const totalOrders = companies.reduce((sum, c) => sum + c.active_orders_count, 0);
    return { total: data?.total ?? 0, active, inactive, totalOrders };
  }, [data?.data, data?.total]);

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Building2 className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Companies</h1>
            <p className="text-sm text-muted-foreground">
              Manage corporate clients, delegates, and their active accounts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Building2 className="h-3 w-3" />
            {stats.total} {stats.total === 1 ? 'company' : 'companies'}
          </Badge>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Total Companies"
          value={isLoading ? '—' : stats.total.toString()}
          sub={stats.total === 0 ? 'No companies yet' : 'Across all outlets'}
          tone="primary"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Active"
          value={isLoading ? '—' : stats.active.toString()}
          sub={stats.active === 0 ? 'None on this page' : 'With live orders'}
          tone="success"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Inactive"
          value={isLoading ? '—' : stats.inactive.toString()}
          sub={stats.inactive === 0 ? 'All engaged' : 'No active orders'}
          tone="muted"
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Active Orders"
          value={isLoading ? '—' : stats.totalOrders.toString()}
          sub={stats.totalOrders === 0 ? 'No active orders' : 'Combined this page'}
          tone="info"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
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
        </CardContent>
      </Card>

      <CorporateCompanyTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
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
