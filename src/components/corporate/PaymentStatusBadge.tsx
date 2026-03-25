import { Badge } from "@/components/ui/badge";
import type { CorporatePaymentStatus } from "@/api/types/corporate.types";

const paymentStatusLabel: Record<CorporatePaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

const paymentStatusVariant: Record<
  CorporatePaymentStatus,
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
};

interface PaymentStatusBadgeProps {
  status: CorporatePaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <Badge variant={paymentStatusVariant[status]} className={className}>
      {paymentStatusLabel[status]}
    </Badge>
  );
}
