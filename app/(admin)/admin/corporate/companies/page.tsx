'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Building2, Activity, Users, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminCorporateCompanies } from '@/api/hooks/useAdminCorporate';
import { CorporateCompanyTable } from '@/components/admin/corporate/CorporateCompanyTable';

export default function CorporateCompaniesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminCorporateCompanies({
    search: search || undefined,
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

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
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
        <Button className="mt-4 sm:mt-0 shadow-primary" size="default">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Total Companies"
          value={isLoading ? '-' : stats.total.toString()}
        />
        <StatCard
          icon={<Activity className="h-4 w-4 text-success" />}
          label="Active"
          value={isLoading ? '-' : stats.active.toString()}
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-secondary-alt" />}
          label="Inactive"
          value={isLoading ? '-' : stats.inactive.toString()}
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4 text-gold" />}
          label="Active Orders"
          value={isLoading ? '-' : stats.totalOrders.toString()}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 rounded-lg border-input bg-card focus-visible:ring-gold/50"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
          {data?.total != null && `${data.total} total`}
        </div>
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
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-primary transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
