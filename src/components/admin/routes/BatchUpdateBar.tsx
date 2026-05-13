'use client';

import { CheckCircle2, Truck, X, ListChecks, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBatchUpdateStatus } from '@/api/hooks/useAdminOrders';

interface BatchUpdateBarProps {
  routeId: string;
  outletId: string;
  selectedDailyOrderIds: string[];
  selectedAddonOrderIds: string[];
  selectedCorporateOrderIds: string[];
  onClearSelection: () => void;
}

export function BatchUpdateBar({
  routeId,
  selectedDailyOrderIds,
  selectedAddonOrderIds,
  selectedCorporateOrderIds,
  onClearSelection,
}: BatchUpdateBarProps) {
  const batchUpdate = useBatchUpdateStatus();

  const totalSelected =
    selectedDailyOrderIds.length +
    selectedAddonOrderIds.length +
    selectedCorporateOrderIds.length;

  if (totalSelected === 0) return null;

  const buildPayload = (status: 'delivered' | 'out_for_delivery' | 'missed') => ({
    routeId,
    data: {
      status,
      daily_order_ids: selectedDailyOrderIds.length > 0 ? selectedDailyOrderIds : undefined,
      addon_order_ids: selectedAddonOrderIds.length > 0 ? selectedAddonOrderIds : undefined,
      corporate_order_ids:
        selectedCorporateOrderIds.length > 0 ? selectedCorporateOrderIds : undefined,
    },
  });

  const handleMarkDelivered = () => {
    batchUpdate.mutate(buildPayload('delivered'), { onSuccess: onClearSelection });
  };

  const handleMarkMissed = () => {
    batchUpdate.mutate(buildPayload('missed'), { onSuccess: onClearSelection });
  };

  const handleMarkOutForDelivery = () => {
    batchUpdate.mutate(buildPayload('out_for_delivery'), { onSuccess: onClearSelection });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 shadow-sm ring-1 ring-primary/10">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
          <ListChecks className="h-3.5 w-3.5" />
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {totalSelected}
          </span>
          <span className="text-xs text-muted-foreground">
            order{totalSelected === 1 ? '' : 's'} selected
          </span>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 bg-background"
          onClick={handleMarkOutForDelivery}
          disabled={batchUpdate.isPending}
        >
          <Truck className="h-3.5 w-3.5" />
          Out for Delivery
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleMarkMissed}
          disabled={batchUpdate.isPending}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Mark Missed
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
          onClick={handleMarkDelivered}
          disabled={batchUpdate.isPending}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark Delivered
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onClearSelection}
          disabled={batchUpdate.isPending}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
