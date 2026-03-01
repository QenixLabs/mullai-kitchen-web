import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CancelSubscriptionRequest, CancellationOption } from "@/api/types/subscription.types";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CancelSubscriptionRequest) => void;
  onCancel?: () => void;
  refundAmount?: number;
}

const cancelSchema = z.object({
  cancellation_option: z.enum(['CANCEL_ALL', 'CANCEL_RENEWAL'] as const),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  refundAmount,
}: CancelSubscriptionDialogProps) {
  const form = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      cancellation_option: 'CANCEL_ALL',
      reason: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof cancelSchema>) => {
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
          <DialogTitle>Cancel Subscription</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {refundAmount !== undefined && (
              <Alert className="mb-4">
                <AlertDescription>
                  Potential refund: <span className="font-semibold">₹{refundAmount}</span>
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="cancellation_option"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cancellation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CANCEL_ALL">Cancel Immediately</SelectItem>
                      <SelectItem value="CANCEL_RENEWAL">Cancel at End Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Cancellation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please tell us why you're cancelling..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Keep Subscription
              </Button>
              <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
