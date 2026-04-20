'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateOrderStatus } from '@/api/hooks/useAdminOrders';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  currentStatus: string;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
}: UpdateStatusDialogProps) {
  const [notes, setNotes] = useState('');
  const updateStatus = useUpdateOrderStatus();

  const isTerminal = ['delivered', 'Delivered', 'missed', 'cancelled', 'Cancelled'].includes(currentStatus);

  const handleUpdate = (newStatus: string) => {
    if (!orderId) return;
    updateStatus.mutate(
      { id: orderId, data: { status: newStatus, notes: notes || undefined } },
      {
        onSuccess: () => {
          setNotes('');
          onOpenChange(false);
        },
      },
    );
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNotes('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Current status: <span className="font-medium">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isTerminal ? (
            <p className="text-sm text-muted-foreground">This order has a terminal status and cannot be updated further.</p>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea
                  placeholder="Add a note for this status change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="default"
                  onClick={() => handleUpdate('out_for_delivery')}
                  disabled={updateStatus.isPending}
                  className="bg-info text-info-foreground hover:bg-info/90"
                >
                  Out for Delivery
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleUpdate('delivered')}
                  disabled={updateStatus.isPending}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  Delivered
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdate('missed')}
                  disabled={updateStatus.isPending}
                >
                  Missed
                </Button>
              </div>

              {updateStatus.isPending && (
                <p className="text-xs text-muted-foreground text-center">Updating...</p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
