'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  X,
  CalendarCheck,
  DraftingCompass,
  Archive,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Can } from '@/components/Auth/can';
import { usePlans, useDeletePlan, useUpdatePlanStatus } from '@/api/hooks/usePlans';
import { PlanTable } from '@/components/admin/plans/PlanTable';
import { PlanStatus, PlanDuration, PlanType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

export default function PlansPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [planType, setPlanType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePlans({
    search: search || undefined,
    status: (status as PlanStatus) || undefined,
    plan_type: (planType as PlanType) || undefined,
    duration: (duration as PlanDuration) || undefined,
    page,
    limit: 10,
  });

  const deletePlan = useDeletePlan();
  const updateStatus = useUpdatePlanStatus();

  const plans = data?.data ?? [];

  const stats = useMemo(() => {
    const total = plans.length;
    const published = plans.filter((p) => p.status === PlanStatus.PUBLISHED).length;
    const draft = plans.filter((p) => p.status === PlanStatus.DRAFT).length;
    const archived = plans.filter((p) => p.status === PlanStatus.ARCHIVED).length;
    return { total, published, draft, archived };
  }, [plans]);

  const handleDelete = (plan: Plan) => {
    if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
      deletePlan.mutate(plan._id);
    }
  };

  const handleStatusChange = (plan: Plan, newStatus: PlanStatus) => {
    updateStatus.mutate({ id: plan._id, status: newStatus });
  };

  const hasFilters = search || status || planType || duration;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
          <ClipboardList className="h-3.5 w-3.5" />
          Subscriptions
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Plans</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage subscription plans, pricing, and availability.
            </p>
            <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
          </div>
          <Can permission="plan:create:global">
            <Button className="gap-1.5" asChild>
              <Link href="/admin/plans/create">
                <Plus className="h-4 w-4" />
                Create Plan
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarCheck className="h-4 w-4 text-primary" />}
          label="Total Plans"
          value={isLoading ? '-' : stats.total.toString()}
        />
        <StatCard
          icon={<CalendarCheck className="h-4 w-4 text-success" />}
          label="Published"
          value={isLoading ? '-' : stats.published.toString()}
          color="text-success"
        />
        <StatCard
          icon={<DraftingCompass className="h-4 w-4 text-warning" />}
          label="Drafts"
          value={isLoading ? '-' : stats.draft.toString()}
          color="text-warning"
        />
        <StatCard
          icon={<Archive className="h-4 w-4 text-muted-foreground" />}
          label="Archived"
          value={isLoading ? '-' : stats.archived.toString()}
          color="text-muted-foreground"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
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
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={PlanStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={PlanStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={PlanStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={duration}
          onValueChange={(v) => {
            setDuration(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Duration</SelectItem>
            <SelectItem value={PlanDuration.WEEKLY}>Weekly</SelectItem>
            <SelectItem value={PlanDuration.MONTHLY}>Monthly</SelectItem>
            <SelectItem value={PlanDuration.QUARTERLY}>Quarterly</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={planType}
          onValueChange={(v) => {
            setPlanType(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={PlanType.PRE_DEFINED}>Pre-defined</SelectItem>
            <SelectItem value={PlanType.CUSTOM}>Custom</SelectItem>
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
              setPlanType('');
              setDuration('');
              setPage(1);
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <PlanTable
        data={plans}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-primary transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold leading-none ${color || 'text-foreground'}`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
