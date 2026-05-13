"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

import { StopCard } from "@/components/delivery/StopCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useCompleteRoute,
  useRouteDetail,
} from "@/api/hooks/useDeliveryRoutes";
import type { DeliveryRouteStatus } from "@/api/types/delivery.types";
import { cn } from "@/lib/utils";

const ROUTE_STATUS_STYLES: Record<DeliveryRouteStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

const ROUTE_STATUS_LABEL: Record<DeliveryRouteStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function DeliveryRouteDetailPage() {
  const params = useParams<{ id: string }>();
  const routeId = params?.id ?? "";
  const router = useRouter();

  const { data: route, isLoading, isError, error } = useRouteDetail(routeId);
  const completeRoute = useCompleteRoute();

  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  // Track whether we've already auto-prompted this session as state, so the
  // React Compiler is happy (refs can't be read during render). The flag is
  // set the first time the page transitions into the "all-resolved" state.
  const [autoPrompted, setAutoPrompted] = useState(false);

  // Stops sorted by sequence — server already sorts but defend against drift.
  // Relying on the React Compiler to memoize this derivation, per project
  // ESLint config (`react-hooks/preserve-manual-memoization`).
  const sortedStops = route?.stops
    ? [...route.stops].sort((a, b) => a.sequence - b.sequence)
    : [];

  // Count how many stops are fully resolved (delivered or missed).
  const resolvedStops = route?.stops
    ? route.stops.filter(
        (s) => s.status === "all_delivered" || s.status === "all_missed",
      ).length
    : 0;

  const totalStops = route?.stops.length ?? 0;
  const orderCount = route?.order_count ?? 0;
  const completedStops = route?.completed_stops ?? 0;

  const progressPct = orderCount === 0
    ? 0
    : Math.min(100, Math.round((completedStops / orderCount) * 100));

  // Auto-prompt the completion dialog once when every stop is resolved.
  // "Adjust state during render" is the React-recommended idiom — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const allResolved =
    route?.status === "IN_PROGRESS" &&
    totalStops > 0 &&
    resolvedStops === totalStops;
  if (allResolved && !autoPrompted) {
    setAutoPrompted(true);
    setConfirmCompleteOpen(true);
  }

  const handleConfirmComplete = () => {
    if (!routeId) return;
    completeRoute.mutate(routeId, {
      onSuccess: () => {
        setConfirmCompleteOpen(false);
      },
    });
  };

  // ---------- Loading ------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <FaChevronLeft />
          </Button>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">
            Route
          </h1>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-sm text-muted-foreground">
          Loading route...
        </div>
      </div>
    );
  }

  // ---------- Error / not found -------------------------------------------
  if (isError || !route) {
    const message =
      (error as { message?: string } | null)?.message ??
      "We couldn't load this route. Try again or head back to today's list.";

    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/delivery")}
            aria-label="Back to today"
          >
            <FaChevronLeft />
          </Button>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">
            Route
          </h1>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          <p className="font-semibold">Couldn&apos;t load route</p>
          <p className="text-destructive/80">{message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/delivery")}
          >
            Back to today
          </Button>
        </div>
      </div>
    );
  }

  const statusLabel = ROUTE_STATUS_LABEL[route.status];
  const statusStyle = ROUTE_STATUS_STYLES[route.status];

  // ---------- Render -------------------------------------------------------
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header */}
      <div className="sticky top-[57px] z-30 -mx-4 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/delivery")}
            aria-label="Back to today"
          >
            <FaChevronLeft />
          </Button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-tight text-foreground">
            {route.name}
          </h1>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
              statusStyle,
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {completedStops}
              </span>{" "}
              of <span className="font-semibold text-foreground">
                {orderCount}
              </span>{" "}
              delivered
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                route.status === "COMPLETED" ? "bg-green-500" : "bg-primary",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {route.status === "IN_PROGRESS" && (
          <Button
            className="w-full"
            onClick={() => setConfirmCompleteOpen(true)}
            disabled={completeRoute.isPending}
          >
            {completeRoute.isPending ? "Completing..." : "Complete Route"}
          </Button>
        )}
      </div>

      {/* Stop list */}
      {sortedStops.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-sm text-muted-foreground">
          No stops on this route.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedStops.map((stop) => (
            <StopCard
              key={`${stop.sequence}:${stop.lat}:${stop.lng}`}
              stop={stop}
              routeId={routeId}
              routeStatus={route.status}
            />
          ))}
        </div>
      )}

      {/* Complete-route confirmation */}
      <AlertDialog
        open={confirmCompleteOpen}
        onOpenChange={(open) => {
          if (!completeRoute.isPending) setConfirmCompleteOpen(open);
        }}
      >
        <AlertDialogContent className="min-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete this route?</AlertDialogTitle>
            <AlertDialogDescription>
              {resolvedStops === totalStops
                ? "All stops are resolved. Marking the route complete is final and cannot be undone from the partner app."
                : "Some stops are still unresolved. Completing the route now will leave them in their current state. This action is final."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeRoute.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmComplete();
              }}
              disabled={completeRoute.isPending}
            >
              {completeRoute.isPending ? "Completing..." : "Yes, complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
