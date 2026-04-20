'use client';

import { Button } from '@/components/ui/button';
import { useBatchUpdateStatus } from '@/api/hooks/useAdminOrders';

interface BatchUpdateBarProps {
  routeId: string;
  outletId: string;
  selectedDailyOrderIds: string[];
  selectedAddonOrderIds: string[];
  onClearSelection: () => void;
}

export function BatchUpdateBar({
  routeId,
  outletId,
  selectedDailyOrderIds,
  selectedAddonOrderIds,
  onClearSelection,
}: BatchUpdateBarProps) {
  const batchUpdate = useBatchUpdateStatus();

  const totalSelected = selectedDailyOrderIds.length + selectedAddonOrderIds.length;

  if (totalSelected === 0) return null;

  const handleMarkDelivered = () => {
    batchUpdate.mutate(
      {
        routeId,
        data: {
          status: 'delivered',
          daily_order_ids: selectedDailyOrderIds.length > 0 ? selectedDailyOrderIds : undefined,
          addon_order_ids: selectedAddonOrderIds.length > 0 ? selectedAddonOrderIds : undefined,
        },
      },
      { onSuccess: onClearSelection },
    );
  };

  const handleMarkOutForDelivery = () => {
    batchUpdate.mutate(
      {
        routeId,
        data: {
          status: 'out_for_delivery',
          daily_order_ids: selectedDailyOrderIds.length > 0 ? selectedDailyOrderIds : undefined,
          addon_order_ids: selectedAddonOrderIds.length > 0 ? selectedAddonOrderIds : undefined,
        },
      },
      { onSuccess: onClearSelection },
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-muted/50 border rounded-md sm:flex-row sm:items-center">
      <span className="text-sm font-medium">
        {totalSelected} order{totalSelected !== 1 ? 's' : ''} selected
      </span>
      <div className="flex flex-col gap-2 sm:flex-row sm:ml-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkOutForDelivery}
          disabled={batchUpdate.isPending}
        >
          Mark Out for Delivery
        </Button>
        <Button
          size="sm"
          onClick={handleMarkDelivered}
          disabled={batchUpdate.isPending}
          className="bg-success text-success-foreground hover:bg-success/90"
        >
          Mark Delivered
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={batchUpdate.isPending}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
