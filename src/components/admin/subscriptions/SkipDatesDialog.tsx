'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
      setSelectedDates(prev => [...prev, data.date].sort());
    }
    form.setValue('date', '');
  };

  const removeDate = (date: string) => {
    setSelectedDates(prev => prev.filter(d => d !== date));
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) return;
    skipDates.mutate(
      { id: subscriptionId, data: { dates: selectedDates, reason: form.getValues('reason') } },
      { onSuccess: () => { onOpenChange(false); setSelectedDates([]); form.reset(); } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skip Dates</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addDate)} className="space-y-4">
            <div className="flex gap-2">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
            {selectedDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDates.map(date => (
                  <Badge key={date} variant="secondary" className="gap-1">
                    {date}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeDate(date)} />
                  </Badge>
                ))}
              </div>
            )}
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" disabled={selectedDates.length === 0 || skipDates.isPending} onClick={handleSubmit}>
                {skipDates.isPending ? 'Skipping...' : `Skip ${selectedDates.length} Date${selectedDates.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
