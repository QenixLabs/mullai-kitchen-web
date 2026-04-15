'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      { onSuccess: () => { onOpenChange(false); form.reset(); } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
        </DialogHeader>
        <Alert>
          <AlertDescription>
            Pausing will credit the wallet for skipped days. The subscription status will change to paused.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="start_date" render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="end_date" render={({ field }) => (
              <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pauseSubscription.isPending}>
                {pauseSubscription.isPending ? 'Pausing...' : 'Pause'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
