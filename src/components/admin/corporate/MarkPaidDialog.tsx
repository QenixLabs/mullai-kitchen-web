'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface MarkPaidDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { payment_reference?: string; paid_at?: string }) => void;
  isSubmitting?: boolean;
}

export function MarkPaidDialog({
  invoiceId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: MarkPaidDialogProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [paidDate, setPaidDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (open) {
      setPaymentReference('');
      setPaidDate(new Date());
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      payment_reference: paymentReference || undefined,
      paid_at: paidDate?.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paid-date">Paid Date</Label>
            <DatePicker
              value={paidDate}
              onChange={setPaidDate}
              placeholder="Select paid date"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-reference">Payment Reference (optional)</Label>
            <Input
              id="payment-reference"
              placeholder="e.g. UTR123456"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Mark as Paid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
