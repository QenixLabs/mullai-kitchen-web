"use client";

import { cn } from "@/lib/utils";
import type { CorporateOrderStatus } from "@/api/types/corporate.types";

const statusConfig: Record<
  CorporateOrderStatus,
  { label: string; style: React.CSSProperties }
> = {
  active: {
    label: "Active",
    style: { backgroundColor: "#00990F", color: "#FFFFFF" },
  },
  draft: {
    label: "Draft",
    style: { backgroundColor: "#3B82F6", color: "#FFFFFF" },
  },
  pending_payment: {
    label: "Pending Payment",
    style: { backgroundColor: "#F59E0B", color: "#FFFFFF" },
  },
  completed: {
    label: "Completed",
    style: { backgroundColor: "#6B7280", color: "#FFFFFF" },
  },
  cancelled: {
    label: "Cancelled",
    style: { backgroundColor: "#EF4444", color: "#FFFFFF" },
  },
};

interface OrderStatusBadgeProps {
  status: CorporateOrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        className
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
