'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Activity,
  Users,
  ClipboardList,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
          <Building2 className="h-3.5 w-3.5" />
          Corporate
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage corporate clients, delegates, and their active accounts.
        </p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total Companies"
          value={isLoading ? '-' : stats.total.toString()}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Activity}
          label="Active"
          value={isLoading ? '-' : stats.active.toString()}
          color="bg-success/10 text-success"
        />
        <StatCard
          icon={Users}
          label="Inactive"
          value={isLoading ? '-' : stats.inactive.toString()}
          color="bg-muted text-muted-foreground"
        />
        <StatCard
          icon={ClipboardList}
          label="Active Orders"
          value={isLoading ? '-' : stats.totalOrders.toString()}
          color="bg-info/10 text-info"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        {debouncedSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            <X data-icon="inline-start" className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
        <Button size="sm" className="ml-auto h-9 gap-1.5">
          <Plus data-icon="inline-start" className="h-4 w-4" />
          Add Company
        </Button>
      </div>

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
          <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
