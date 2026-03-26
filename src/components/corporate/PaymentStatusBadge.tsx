"use client";

import { cn } from "@/lib/utils";
import type { CorporatePaymentStatus } from "@/api/types/corporate.types";

const paymentStatusConfig: Record<
  CorporatePaymentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

interface PaymentStatusBadgeProps {
  status: CorporatePaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status];

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
