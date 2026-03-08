"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfDay, addDays, getDay } from "date-fns";
import { X, PiggyBank, Loader2 } from "lucide-react";
import { useCreateOptOutPeriod } from "@/api/hooks/use-subscription";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const optOutSchema = z.object({
  opted_out_dates: z.array(z.date()).min(1, "Select at least one date"),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

interface OptOutSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  totalDeliveries: number;
  maxOptOutDays: number;
  daysAlreadyOptedOut: number;
  mealPrice?: number;
  mealCount?: number;
  onSuccess?: () => void;
}

export function OptOutSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionId,
  subscriptionStartDate,
  subscriptionEndDate,
  totalDeliveries,
  maxOptOutDays,
  daysAlreadyOptedOut,
  mealPrice = 80,
  mealCount = 1,
  onSuccess,
}: OptOutSubscriptionDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const createOptOutMutation = useCreateOptOutPeriod();

  const daysRemaining = maxOptOutDays - daysAlreadyOptedOut;
  const discountPerDay = mealPrice * mealCount;
  const totalCredit = selectedDates.length * discountPerDay;

  const form = useForm<z.infer<typeof optOutSchema>>({
    resolver: zodResolver(optOutSchema),
    defaultValues: {
      opted_out_dates: [],
      reason: "",
    },
  });

  // Generate array of ALL valid dates
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    // Can't opt-out for today (need 9 PM previous day cutoff)
    const minDate = addDays(today, 1);
    const effectiveStartDate = minDate > subscriptionStartDate ? minDate : subscriptionStartDate;
    
    let currentDate = new Date(effectiveStartDate);
    const end = new Date(subscriptionEndDate);
    
    // Generate ALL remaining days in the subscription
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }, [subscriptionStartDate, subscriptionEndDate]);

  const handleDateToggle = (date: Date) => {
    const dateIndex = selectedDates.findIndex((d) => isSameDay(d, date));

    if (dateIndex >= 0) {
      // Remove date if already selected
      const newDates = selectedDates.filter((_, i) => i !== dateIndex);
      setSelectedDates(newDates);
      form.setValue("opted_out_dates", newDates);
    } else if (selectedDates.length < daysRemaining) {
      // Add date if under limit
      const newDates = [...selectedDates, date];
      setSelectedDates(newDates);
      form.setValue("opted_out_dates", newDates);
    }
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  const handleSubmit = async (data: z.infer<typeof optOutSchema>) => {
    if (selectedDates.length === 0) return;

    const dateStrings = selectedDates.map(d => d.toISOString().split('T')[0]);

    await createOptOutMutation.mutateAsync({
      id: subscriptionId,
      opted_out_dates: dateStrings,
      reason: data.reason,
    });

    // Reset and close
    setSelectedDates([]);
    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Opt Out Days</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Stats and info */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Days Remaining: <span className="font-bold text-foreground">{daysRemaining}</span>
              </span>
              <Badge 
                variant={selectedDates.length >= daysRemaining ? "destructive" : "secondary"}
                className="rounded-sm"
              >
                {selectedDates.length} selected
              </Badge>
            </div>

            {daysRemaining <= 0 && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
                You've reached the maximum opt-out limit (50% of subscription days)
              </div>
            )}

            {/* Day Grid */}
            <div className="bg-card rounded-sm p-4 border border-border">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                Tap a day to opt-out
              </h4>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {dateRange.map((date) => {
                  const isSelected = isDateSelected(date);
                  const dayOfWeek = getDay(date);
                  const dayNumber = format(date, "dd");
                  const weekdayLabel = WEEKDAYS[dayOfWeek];

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateToggle(date)}
                      disabled={daysRemaining <= 0 && !isSelected}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-sm transition-all relative",
                        isSelected 
                          ? "border-2 border-primary/20 bg-primary/10" 
                          : "border border-border bg-background hover:border-primary"
                      )}
                    >
                      {/* Weekday label */}
                      <span className={cn(
                        "text-[9px] font-bold uppercase",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}>
                        {weekdayLabel}
                      </span>
                      
                      {/* Day number */}
                      <span className={cn(
                        "text-base font-bold",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {dayNumber}
                      </span>
                      
                      {/* Status label */}
                      <div className={cn(
                        "mt-1 text-[8px] font-bold",
                        isSelected ? "text-primary" : "text-primary"
                      )}>
                        {isSelected ? 'OPTED OUT' : 'SELECT'}
                      </div>

                      {/* Cancel icon for opted out */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <div className="bg-card rounded-full p-0.5 shadow-sm border border-border">
                            <X className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                      )}

                      {/* Bottom indicator bar for opted out */}
                      {isSelected && (
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-b-sm" />
                      )}
                    </button>
                  );
                })}
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground text-right">
                Showing {dateRange.length} days
              </div>
            </div>

            {/* Credit amount display */}
            {totalCredit > 0 && (
              <div className="bg-primary/5 border border-primary/10 rounded-sm p-4 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-sm">
                  <PiggyBank className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    ₹{totalCredit.toLocaleString()} will be credited to your wallet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''} × ₹{mealPrice} × {mealCount} meal{mealCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Reason field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are you opting out these days?"
                      {...field}
                      rows={3}
                      className="rounded-sm border-input bg-card focus:ring-primary focus:border-primary resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedDates([]);
                  form.reset();
                  onOpenChange(false);
                }}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedDates.length === 0 || createOptOutMutation.isPending}
                className="rounded-sm bg-primary hover:bg-primary/90"
              >
                {createOptOutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm Opt-Out (₹${totalCredit})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
