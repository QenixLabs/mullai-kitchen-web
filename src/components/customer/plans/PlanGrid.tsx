"use client";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { PlanCard } from "./PlanCard";
import { SearchX, Loader2 } from "lucide-react";

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
  <>
    {/* Mobile: Horizontal scroll skeletons */}
    <div className={cn("flex gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-80 w-72 shrink-0 animate-pulse rounded-sm border border-orange-100 bg-white"
          aria-hidden="true"
        />
      ))}
    </div>
    {/* Desktop: Grid skeletons */}
    <div className={cn("hidden grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:grid", className)} aria-label="Loading plans">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[26rem] animate-pulse rounded-sm border border-orange-100 bg-white"
          aria-hidden="true"
        />
      ))}
    </div>
  </>
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
  <div className={cn("flex flex-col items-center justify-center rounded-sm border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center", className)}>
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
      <SearchX className="h-8 w-8 text-orange-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">No plans found</h3>
    <p className="mt-2 max-w-sm text-sm text-gray-600">
      Try adjusting your search or check back later for new meal plans.
    </p>
  </div>
);

// Loading spinner for inline loading states
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className={cn("space-y-4", className)}>
      {/* Mobile: Horizontal scroll view */}
      <div className="flex gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            onViewMenu={onViewMenu}
            onSelectPlan={onSelectPlan}
            isSelected={selectedPlanId === plan._id}
            variant="compact"
          />
        ))}
      </div>

      {/* Scroll indicator for mobile */}
      {plans.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:hidden">
          {plans.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === 0 ? "w-4 bg-primary" : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>
      )}

      {/* Tablet & Desktop: Grid view */}
      <div className="hidden grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:grid">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            onViewMenu={onViewMenu}
            onSelectPlan={onSelectPlan}
            isSelected={selectedPlanId === plan._id}
            variant="default"
          />
        ))}
      </div>
    </div>
  );
}
