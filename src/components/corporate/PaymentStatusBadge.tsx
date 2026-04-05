"use client";

import { cn } from "@/lib/utils";
import type { CorporatePaymentStatus } from "@/api/types/corporate.types";

const paymentStatusConfig: Record<
  CorporatePaymentStatus,
  { label: string; style: React.CSSProperties }
> = {
  pending: {
    label: "Pending",
    style: { backgroundColor: "#FF962D", color: "#FFFFFF" },
  },
  paid: {
    label: "Paid",
    style: { backgroundColor: "#10B981", color: "#FFFFFF" },
  },
  overdue: {
    label: "Overdue",
    style: { backgroundColor: "#EF4444", color: "#FFFFFF" },
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
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
        className
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
