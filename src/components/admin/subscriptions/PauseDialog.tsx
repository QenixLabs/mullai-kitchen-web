'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pause, CalendarDays, AlertCircle } from 'lucide-react';
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
import { useAdminPauseSubscription } from '@/api/hooks/useAdminSubscriptions';

const pauseSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
});

type PauseFormValues = z.infer<typeof pauseSchema>;

interface PauseDialogProps {
  subscriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseDialog({ subscriptionId, open, onOpenChange }: PauseDialogProps) {
  const pauseSubscription = useAdminPauseSubscription();

  const form = useForm<PauseFormValues>({
    resolver: zodResolver(pauseSchema),
    defaultValues: { start_date: '', end_date: '', reason: '' },
  });

  const onSubmit = (data: PauseFormValues) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    pauseSubscription.mutate(
      { id: subscriptionId, data: { paused_dates: dates, reason: data.reason } },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/60 shadow-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <Pause className="h-4 w-4 text-warning" />
            </div>
            <DialogTitle className="text-xl">Pause Subscription</DialogTitle>
          </div>
          <DialogDescription>
            Select a date range to pause deliveries.
          </DialogDescription>
          <div className="h-1 w-12 rounded-full bg-gold" />
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
          <p className="text-muted-foreground">
            Pausing will credit the wallet for skipped days. The subscription status will change to paused.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional reason for pausing..."
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pauseSubscription.isPending}
                className="gap-1.5"
              >
                <Pause className="h-4 w-4" />
                {pauseSubscription.isPending ? 'Pausing...' : 'Pause Subscription'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
