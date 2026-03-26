"use client";

import { cn } from "@/lib/utils";
import type { CorporateOrderStatus } from "@/api/types/corporate.types";

const statusConfig: Record<
  CorporateOrderStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
  },
  draft: {
    label: "Draft",
    className: "bg-blue-100/80 text-blue-800 border-blue-200",
  },
  pending_payment: {
    label: "Pending Payment",
    className: "bg-amber-100/80 text-amber-800 border-amber-200",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-100/80 text-slate-800 border-slate-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100/80 text-rose-800 border-rose-200",
  },
};

interface OrderStatusBadgeProps {
  status: CorporateOrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-sm",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
