'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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

const STATUS_OPTIONS: { value: CorporateOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

interface UpdateStatusDialogProps {
  orderId: string | null;
  currentStatus: CorporateOrderStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStatusDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<CorporateOrderStatus | ''>('');
  const updateStatus = useUpdateCorporateOrderStatus();

  useEffect(() => {
    if (open && currentStatus) {
      setStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const handleSubmit = () => {
    if (!orderId || !status) return;
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CorporateOrderStatus)}>
              <SelectTrigger id="status-select">
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
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={updateStatus.isPending || !status || status === currentStatus}
              onClick={handleSubmit}
            >
              {updateStatus.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
