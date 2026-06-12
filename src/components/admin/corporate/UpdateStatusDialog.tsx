'use client';

import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateCorporateOrderStatus } from '@/api/hooks/useAdminCorporate';
import type { CorporateOrderStatus } from '@/api/types/corporate.types';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: CorporateOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_TONES: Record<CorporateOrderStatus, string> = {
  draft: 'border-border bg-muted text-muted-foreground',
  pending_payment: 'border-warning/20 bg-warning/10 text-warning',
  active: 'border-info/20 bg-info/10 text-info',
  completed: 'border-success/20 bg-success/10 text-success',
  cancelled: 'border-destructive/20 bg-destructive/10 text-destructive',
};

interface UpdateStatusDialogProps {
  orderId: string | null;
  currentStatus: CorporateOrderStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StatusPill({ status }: { status: CorporateOrderStatus }) {
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        STATUS_TONES[status],
      )}
    >
      {label}
    </span>
  );
}

export function UpdateStatusDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: UpdateStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <UpdateStatusForm
        key={String(open)}
        orderId={orderId}
        currentStatus={currentStatus}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
}

function UpdateStatusForm({
  orderId,
  currentStatus,
  onOpenChange,
}: {
  orderId: string | null;
  currentStatus: CorporateOrderStatus | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<CorporateOrderStatus>(currentStatus || 'draft');
  const updateStatus = useUpdateCorporateOrderStatus();

  const handleSubmit = () => {
    if (!orderId || !status) return;
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const isSame = status === currentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <RefreshCw className="h-3.5 w-3.5" />
            </span>
            Update Order Status
          </DialogTitle>
          <DialogDescription>
            Change the corporate order status. The customer will see this update reflected on their dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {currentStatus && status && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Transition:</span>
              <StatusPill status={currentStatus} />
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <StatusPill status={status as CorporateOrderStatus} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="status-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              New Status
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CorporateOrderStatus)}>
              <SelectTrigger id="status-select" className="h-9">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              disabled={updateStatus.isPending || !status || isSame}
              onClick={handleSubmit}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {updateStatus.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
