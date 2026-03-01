import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  reason: z.string().min(10, "Please provide a reason").max(500, "Reason must be less than 500 characters"),
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
                <FormItem className="space-y-3">
                  <FormLabel>Cancellation Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CANCEL_ALL" id="cancel-all" />
                        <label htmlFor="cancel-all" className="cursor-pointer">
                          Cancel Immediately
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CANCEL_RENEWAL" id="cancel-renewal" />
                        <label htmlFor="cancel-renewal" className="cursor-pointer">
                          Cancel at End Date
                        </label>
                      </div>
                    </RadioGroup>
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
