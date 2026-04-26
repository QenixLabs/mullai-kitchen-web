"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { FaClock, FaPlay, FaArrowRight, FaCheckCircle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { RouteStatusBadge } from "@/components/admin/routes/RouteStatusBadge";
import { useStartRoute } from "@/api/hooks/useDeliveryRoutes";
import type { DeliveryRouteSummary } from "@/api/types/delivery.types";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  route: DeliveryRouteSummary;
}

/** Safely parse an ISO string and format it. Returns `fallback` on any error. */
function safeFormat(
  iso: string | undefined,
  pattern: string,
  fallback = "",
): string {
  if (!iso) return fallback;
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return fallback;
  }
}

export function RouteCard({ route }: RouteCardProps) {
  const router = useRouter();
  const startRoute = useStartRoute();

  const total = route.order_count ?? 0;
  const completed = route.completed_stops ?? 0;
  const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  const dateLabel = safeFormat(route.delivery_date, "EEE, d MMM");
  const timeLabel = safeFormat(route.estimated_start_time, "h:mm a");

  const goToDetail = () => router.push(`/delivery/routes/${route.id}`);

  const handleStart = () => {
    if (startRoute.isPending) return;
    startRoute.mutate(route.id, {
      onSuccess: () => {
        router.push(`/delivery/routes/${route.id}`);
      },
    });
  };

  const renderCta = () => {
    switch (route.status) {
      case "PUBLISHED":
        return (
          <Button
            type="button"
            className="w-full"
            onClick={handleStart}
            disabled={startRoute.isPending}
          >
            {startRoute.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Starting...
              </>
            ) : (
              <>
                <FaPlay aria-hidden />
                Start Route
              </>
            )}
          </Button>
        );
      case "IN_PROGRESS":
        return (
          <Button
            type="button"
            className="w-full"
            variant="default"
            onClick={goToDetail}
          >
            <FaArrowRight aria-hidden />
            Continue
          </Button>
        );
      case "COMPLETED":
        return (
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={goToDetail}
          >
            <FaCheckCircle aria-hidden />
            View Summary
          </Button>
        );
      case "DRAFT":
        return (
          <div className="flex h-9 w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
            Not yet published
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex h-9 w-full items-center justify-center rounded-md border border-dashed border-destructive/30 bg-destructive/5 px-3 text-xs font-medium text-destructive">
            Cancelled
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm",
        "text-card-foreground",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate text-base font-bold text-foreground">
          {route.name}
        </h2>
        <RouteStatusBadge status={route.status} />
      </header>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {dateLabel ? <span className="font-medium">{dateLabel}</span> : null}
        {timeLabel ? (
          <span className="inline-flex items-center gap-1">
            <FaClock aria-hidden className="h-3 w-3" />
            {timeLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            {completed} / {total} delivered
          </span>
          <span className="text-muted-foreground">{Math.round(pct)}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              route.status === "COMPLETED" ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="pt-1">{renderCta()}</div>
    </article>
  );
}
