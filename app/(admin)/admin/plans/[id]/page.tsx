'use client';

import { use } from 'react';
import { PlanForm } from '@/components/admin/plans/PlanForm';
import { usePlan } from '@/api/hooks/usePlans';

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plan, isLoading } = usePlan(id);

  if (isLoading) return <div className="flex justify-center py-8 text-muted-foreground">Loading plan...</div>;
  if (!plan) return <div className="flex justify-center py-8 text-muted-foreground">Plan not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Plan</h1>
        <p className="text-sm text-muted-foreground">Update plan details</p>
      </div>
      <PlanForm plan={plan} />
    </div>
  );
}
