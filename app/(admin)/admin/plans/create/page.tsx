'use client';

import { PlanForm } from '@/components/admin/plans/PlanForm';
import { Can } from '@/components/Auth/can';

export default function CreatePlanPage() {
  return (
    <Can permission="plan:create:global" fallback={<div className="text-center py-8 text-muted-foreground">You do not have permission to create plans.</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Plan</h1>
          <p className="text-sm text-muted-foreground">Define a new subscription plan</p>
        </div>
        <PlanForm />
      </div>
    </Can>
  );
}
