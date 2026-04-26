"use client";

import { cn } from "@/lib/utils";

export type AvailabilityStatus = "Available" | "On Delivery" | "Inactive";

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  className?: string;
}

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  "On Delivery": "bg-amber-100 text-amber-700 border-amber-200",
  Inactive: "bg-muted text-muted-foreground border-border",
};

const STATUS_DOT: Record<AvailabilityStatus, string> = {
  Available: "bg-green-500",
  "On Delivery": "bg-amber-500",
  Inactive: "bg-muted-foreground",
};

export function AvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}
