'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CalendarDays, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success ring-1 ring-success/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            Mark Invoice as Paid
          </DialogTitle>
          <DialogDescription>
            Record the payment date and an optional reference number for this invoice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="paid-date"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <CalendarDays className="h-3 w-3" />
              Paid Date
            </Label>
            <DatePicker
              value={paidDate}
              onChange={setPaidDate}
              placeholder="Select paid date"
              className="h-9 w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="payment-reference"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <Hash className="h-3 w-3" />
              Payment Reference{' '}
              <span className="ml-0.5 normal-case text-[10px] text-muted-foreground/70">
                (optional)
              </span>
            </Label>
            <Input
              id="payment-reference"
              placeholder="e.g. UTR123456"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isSubmitting ? 'Saving...' : 'Mark as Paid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
