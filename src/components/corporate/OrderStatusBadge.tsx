import { Badge } from "@/components/ui/badge";
import type { CorporateOrderStatus } from "@/api/types/corporate.types";

const statusVariant: Record<
  CorporateOrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  draft: "secondary",
  pending_payment: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

const statusLabel: Record<CorporateOrderStatus, string> = {
  active: "Active",
  draft: "Draft",
  pending_payment: "Pending Payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface OrderStatusBadgeProps {
  status: CorporateOrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={className}>
      {statusLabel[status]}
    </Badge>
  );
}
