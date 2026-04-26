"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { FaInbox, FaSyncAlt, FaExclamationTriangle } from "react-icons/fa";

import { useMyRoutes } from "@/api/hooks/useDeliveryRoutes";
import { RouteCard } from "@/components/delivery/RouteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Today screen for delivery partners.
 *
 * Lists every route assigned to the signed-in partner for today's local date,
 * with explicit loading / empty / error states and a manual refresh affordance.
 */
export default function DeliveryTodayPage() {
  // Compute today's local date once per mount. Local TZ is critical: server
  // groups routes by the partner's working day, so a UTC-based slice can shift
  // the date near midnight.
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const todayHuman = useMemo(
    () => format(new Date(), "EEE, d MMMM yyyy"),
    [],
  );

  const {
    data: routes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMyRoutes({ date: today });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      const message =
        (error as { message?: string } | undefined)?.message ??
        "Something went wrong while loading your routes.";
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
          <FaExclamationTriangle
            aria-hidden
            className="h-6 w-6 text-destructive"
          />
          <p className="text-sm font-medium text-foreground">
            Couldn&apos;t load routes
          </p>
          <p className="max-w-[20rem] text-xs text-muted-foreground">{message}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? "Retrying..." : "Try again"}
          </Button>
        </div>
      );
    }

    if (!routes || routes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <FaInbox aria-hidden className="h-7 w-7 text-muted-foreground/70" />
          <p className="text-sm font-medium text-foreground">
            No routes assigned today.
          </p>
          <p className="max-w-[20rem] text-xs text-muted-foreground">
            Pull to refresh or check back once your manager publishes a route.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Today&apos;s Routes
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{todayHuman}</p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Refresh routes"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
        >
          <FaSyncAlt
            aria-hidden
            className={cn(
              "h-3.5 w-3.5",
              isRefetching && "animate-spin",
            )}
          />
        </Button>
      </div>

      {renderContent()}
    </div>
  );
}
