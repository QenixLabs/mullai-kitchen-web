'use client';

import { useState } from 'react';
import { AlertTriangle, Ban, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      },
    );
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setReason('');
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
              <Ban className="h-3.5 w-3.5" />
            </span>
            Cancel Corporate Order
          </DialogTitle>
          <DialogDescription>
            This will cancel the order and notify the customer. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Active deliveries linked to this order will be removed from any assigned routes.
            </span>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="cancel-reason"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              Cancellation Reason
              <span className="ml-0.5 normal-case text-[10px] text-muted-foreground/70">
                (optional)
              </span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => handleClose(false)}
              disabled={cancelOrder.isPending}
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 gap-1.5"
              disabled={cancelOrder.isPending}
              onClick={handleSubmit}
            >
              <Ban className="h-3.5 w-3.5" />
              {cancelOrder.isPending ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
