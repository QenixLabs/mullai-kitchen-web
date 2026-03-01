"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PauseSubscriptionRequest } from "@/api/types/subscription.types";

interface PauseSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PauseSubscriptionRequest) => void;
  onCancel?: () => void;
  minDate?: Date;
  maxDate?: Date;
  warningMessage?: string;
}

const pauseSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

export function PauseSubscriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  minDate = new Date(),
  maxDate,
  warningMessage,
}: PauseSubscriptionDialogProps) {
  const form = useForm<z.infer<typeof pauseSchema>>({
    resolver: zodResolver(pauseSchema),
    defaultValues: {
      start_date: new Date(minDate).toISOString().split('T')[0],
      end_date: new Date(minDate).toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: z.infer<typeof pauseSchema>) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    onCancel?.();
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
        </DialogHeader>
        {warningMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{warningMessage}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      minDate={minDate}
                      maxDate={maxDate}
                    />
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
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      minDate={minDate}
                      maxDate={maxDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are you pausing?"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Pausing..." : "Pause Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
