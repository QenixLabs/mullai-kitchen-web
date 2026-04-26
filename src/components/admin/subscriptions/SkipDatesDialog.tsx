'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Plus, X, CalendarX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminSkipDates } from '@/api/hooks/useAdminSubscriptions';

const skipSchema = z.object({
  date: z.string().min(1, 'Select a date'),
  reason: z.string().optional(),
});

type SkipFormValues = z.infer<typeof skipSchema>;

interface SkipDatesDialogProps {
  subscriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkipDatesDialog({ subscriptionId, open, onOpenChange }: SkipDatesDialogProps) {
  const skipDates = useAdminSkipDates();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const form = useForm<SkipFormValues>({
    resolver: zodResolver(skipSchema),
    defaultValues: { date: '', reason: '' },
  });

  const addDate = (data: SkipFormValues) => {
    if (!selectedDates.includes(data.date)) {
      setSelectedDates((prev) => [...prev, data.date].sort());
    }
    form.setValue('date', '');
  };

  const removeDate = (date: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) return;
    skipDates.mutate(
      {
        id: subscriptionId,
        data: { dates: selectedDates, reason: form.getValues('reason') },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedDates([]);
          form.reset();
        },
      },
    );
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/60 shadow-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CalendarX className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-xl">Skip Dates</DialogTitle>
          </div>
          <DialogDescription>
            Select individual dates to skip deliveries.
          </DialogDescription>
          <div className="h-1 w-12 rounded-full bg-gold" />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(addDate)} className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      Select Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={!form.watch('date')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedDates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Selected Dates ({selectedDates.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => removeDate(date)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                        'bg-primary/10 text-primary border-primary/20',
                        'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20',
                        'transition-colors cursor-pointer',
                      )}
                    >
                      {formatDateLabel(date)}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional reason for skipping..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setSelectedDates([]);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selectedDates.length === 0 || skipDates.isPending}
                onClick={handleSubmit}
                className="gap-1.5"
              >
                <CalendarX className="h-4 w-4" />
                {skipDates.isPending
                  ? 'Skipping...'
                  : `Skip ${selectedDates.length} Date${selectedDates.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
