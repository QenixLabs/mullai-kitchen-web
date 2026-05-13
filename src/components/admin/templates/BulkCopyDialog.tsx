'use client';

import { useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useBulkCopy } from '@/api/hooks/useTemplates';
import { useOutlets } from '@/api/hooks/useOutlets';
import { WeekDay } from '@/api/types/menu.types';

interface BulkCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  currentEffectiveFrom: string;
}

const DAYS = [
  { value: '', label: 'All Days' },
  { value: WeekDay.MONDAY, label: 'Monday' },
  { value: WeekDay.TUESDAY, label: 'Tuesday' },
  { value: WeekDay.WEDNESDAY, label: 'Wednesday' },
  { value: WeekDay.THURSDAY, label: 'Thursday' },
  { value: WeekDay.FRIDAY, label: 'Friday' },
  { value: WeekDay.SATURDAY, label: 'Saturday' },
  { value: WeekDay.SUNDAY, label: 'Sunday' },
];

export function BulkCopyDialog({ open, onOpenChange, outletId, currentEffectiveFrom }: BulkCopyDialogProps) {
  const [sourceOutletId, setSourceOutletId] = useState('');
  const [sourceEffectiveFrom, setSourceEffectiveFrom] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const bulkCopy = useBulkCopy(outletId);
  const { data: outletsData } = useOutlets({ status: 'active' });

  const isSubmitting = bulkCopy.isPending;

  const handleSubmit = () => {
    if (!sourceOutletId || !sourceEffectiveFrom) return;

    bulkCopy.mutate(
      {
        source_outlet_id: sourceOutletId,
        source_effective_from: sourceEffectiveFrom,
        target_outlet_id: outletId,
        target_effective_from: currentEffectiveFrom,
        day_of_week: (dayFilter as WeekDay) || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const outlets = outletsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Bulk Copy Templates
          </DialogTitle>
          <DialogDescription>
            Copy meal templates from another outlet and week.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Source Outlet</Label>
            <Select value={sourceOutletId} onValueChange={setSourceOutletId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source outlet" />
              </SelectTrigger>
              <SelectContent>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_from">Source Effective From</Label>
            <Input
              id="source_from"
              type="date"
              value={sourceEffectiveFrom}
              onChange={(e) => setSourceEffectiveFrom(e.target.value)}
            />
          </div>

          <div className="rounded-md border bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Target</p>
            <p className="text-sm text-foreground">
              Current outlet &mdash; week of {currentEffectiveFrom}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Day Filter</Label>
            <Select value={dayFilter || '_all'} onValueChange={(v) => setDayFilter(v === '_all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select day (optional)" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.value || '_all'} value={d.value || '_all'}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !sourceOutletId || !sourceEffectiveFrom}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Copy Templates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
