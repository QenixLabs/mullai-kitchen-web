'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const handleDelete = (plan: Plan) => {
    if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
      deletePlan.mutate(plan._id);
    }
  };

  const handleStatusChange = (plan: Plan, newStatus: PlanStatus) => {
    updateStatus.mutate({ id: plan._id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Plans</h1>
          <p className="text-sm text-muted-foreground">Manage subscription plans</p>
        </div>
        <Can permission="plan:create:global">
          <Button asChild>
            <Link href="/admin/plans/create">
              <Plus className="mr-2 h-4 w-4" />Create Plan
            </Link>
          </Button>
        </Can>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
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
        <Select value={duration} onValueChange={(v) => { setDuration(v === 'all' ? '' : v); setPage(1); }}>
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
      </div>

      <PlanTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
