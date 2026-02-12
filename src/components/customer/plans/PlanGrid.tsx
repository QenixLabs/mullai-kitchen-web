"use client";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { PlanCard } from "@/components/customer/plans/PlanCard";

interface PlanGridProps {
  plans: PlanBrowseItem[];
  onViewMenu: (plan: PlanBrowseItem) => void;
  onSelectPlan: (plan: PlanBrowseItem) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  selectedPlanId?: string | null;
  loadingCount?: number;
  className?: string;
}

export function PlanGrid({
  plans,
  onViewMenu,
  onSelectPlan,
  isLoading = false,
  isError = false,
  errorMessage,
  selectedPlanId,
  loadingCount = 6,
  className,
}: PlanGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3", className)} aria-label="Loading plans">
        {Array.from({ length: loadingCount }).map((_, index) => (
          <div
            key={`plan-skeleton-${index}`}
            className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white/80"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className={cn("border-red-200 bg-red-50 text-red-800", className)}>
        <AlertTitle>Unable to load plans</AlertTitle>
        <AlertDescription>{errorMessage ?? "Please refresh and try again."}</AlertDescription>
      </Alert>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center", className)}>
        <h3 className="text-lg font-semibold text-gray-900">No plans found</h3>
        <p className="mt-2 text-sm text-gray-600">
          Try adjusting your filters or search term to see more meal plans.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {plans.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          onViewMenu={onViewMenu}
          onSelectPlan={onSelectPlan}
          isSelected={selectedPlanId === plan._id}
        />
      ))}
    </div>
  );
}
