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

// Hoisted loading skeleton - prevents recreation on every render
const PlanLoadingSkeleton = ({ count, className }: { count: number; className?: string }) => (
  <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", className)} aria-label="Loading plans">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="h-[27rem] animate-pulse rounded-2xl border border-orange-100 bg-white"
        aria-hidden="true"
      />
    ))}
  </div>
);

// Hoisted error alert - prevents recreation on every render
const PlanErrorAlert = ({ message, className }: { message?: string; className?: string }) => (
  <Alert variant="destructive" className={cn("border-red-200 bg-red-50 text-red-800", className)}>
    <AlertTitle>Unable to load plans</AlertTitle>
    <AlertDescription>{message ?? "Please refresh and try again."}</AlertDescription>
  </Alert>
);

// Hoisted empty state - prevents recreation on every render
const NoPlansFound = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center", className)}>
    <h3 className="text-lg font-semibold text-gray-900">No plans found</h3>
    <p className="mt-2 text-sm text-gray-600">
      Try adjusting your filters or search term to see more meal plans.
    </p>
  </div>
);

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
    return <PlanLoadingSkeleton count={loadingCount} className={className} />;
  }

  if (isError) {
    return <PlanErrorAlert message={errorMessage} className={className} />;
  }

  if (plans.length === 0) {
    return <NoPlansFound className={className} />;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", className)}>
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
