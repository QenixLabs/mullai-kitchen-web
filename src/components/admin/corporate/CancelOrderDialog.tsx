'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCancelCorporateOrder } from '@/api/hooks/useAdminCorporate';

interface CancelOrderDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOrderDialog({ orderId, open, onOpenChange }: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const cancelOrder = useCancelCorporateOrder();

  const handleSubmit = () => {
    if (!orderId) return;
    cancelOrder.mutate(
      { id: orderId, data: { reason: reason || undefined } },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Corporate Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelOrder.isPending}
              onClick={handleSubmit}
            >
              {cancelOrder.isPending ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
