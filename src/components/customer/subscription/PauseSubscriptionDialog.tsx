"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isSameDay, startOfDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wallet, CalendarDays, Plus, X } from "lucide-react";

interface PauseSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { paused_dates: string[]; reason?: string }) => void;
  onCancel?: () => void;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  perDayPrice: number;
  existingPausedDates?: Date[];
  warningMessage?: string;
}

const pauseSchema = z.object({
  paused_dates: z.array(z.string()).min(1, "Select at least one date to pause"),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

export function PauseSubscriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  subscriptionStartDate,
  subscriptionEndDate,
  perDayPrice,
  existingPausedDates = [],
  warningMessage,
}: PauseSubscriptionDialogProps) {
  const [confirmedPermanent, setConfirmedPermanent] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

  const form = useForm<z.infer<typeof pauseSchema>>({
    resolver: zodResolver(pauseSchema),
    defaultValues: {
      paused_dates: [],
      reason: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedDates = form.watch("paused_dates");
  const selectedDates = useMemo(() => watchedDates || [], [watchedDates]);

  // Normalize dates for comparison
  const normalizeDate = (date: Date): Date => {
    return startOfDay(new Date(date));
  };

  // Check if a date is already selected
  const isDateSelected = (date: Date): boolean => {
    const normalizedDate = normalizeDate(date);
    return selectedDates.some((d) => isSameDay(normalizeDate(new Date(d)), normalizedDate));
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const normalizedDate = normalizeDate(date);
    const normalizedMin = normalizeDate(subscriptionStartDate);
    const normalizedMax = normalizeDate(subscriptionEndDate);

    // Disable if outside range
    if (normalizedDate < normalizedMin || normalizedDate > normalizedMax) {
      return true;
    }

    // Disable already paused dates
    if (existingPausedDates.some((d) => isSameDay(normalizeDate(d), normalizedDate))) {
      return true;
    }

    return false;
  };

  // Add date from DatePicker
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const normalizedDate = normalizeDate(date);
    const dateString = format(normalizedDate, "yyyy-MM-dd");
    
    if (isDateDisabled(date) || isDateSelected(date)) {
      setTempDate(undefined);
      return;
    }
    
    form.setValue("paused_dates", [...selectedDates, dateString]);
    setTempDate(undefined);
  };

  // Remove a specific date
  const removeDate = (dateString: string) => {
    form.setValue("paused_dates", selectedDates.filter((d) => d !== dateString));
  };

  // Clear all dates
  const clearAllDates = () => {
    form.setValue("paused_dates", []);
  };

  // Calculate total credit
  const totalCredit = useMemo(() => {
    return Math.round(perDayPrice * selectedDates.length * 100) / 100;
  }, [perDayPrice, selectedDates.length]);

  // Sort and group selected dates for display
  const sortedSelectedDates = useMemo(() => {
    const uniqueDates = [...new Set(selectedDates)].sort();
    return uniqueDates.map(d => new Date(d));
  }, [selectedDates]);

  const groupedDates = useMemo(() => {
    const groups: Record<string, Date[]> = {};
    sortedSelectedDates.forEach((date) => {
      const key = format(date, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(date);
    });
    return groups;
  }, [sortedSelectedDates]);

  const handleSubmit = (data: z.infer<typeof pauseSchema>) => {
    onSubmit({
      paused_dates: data.paused_dates,
      reason: data.reason,
    });
    form.reset();
    setConfirmedPermanent(false);
    setTempDate(undefined);
    onOpenChange(false);
  };

  const handleClose = () => {
    onCancel?.();
    form.reset();
    setConfirmedPermanent(false);
    setTempDate(undefined);
    onOpenChange(false);
  };

  const canSubmit = selectedDates.length > 0 && confirmedPermanent && !form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
          <DialogDescription>
            Select dates you want to pause. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Select Dates using DatePicker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <FormLabel className="text-base font-medium m-0">Step 1: Select dates to pause</FormLabel>
              </div>
              
              <DatePicker
                date={tempDate}
                onDateChange={handleDateSelect}
                minDate={subscriptionStartDate}
                maxDate={subscriptionEndDate}
                disabled={isDateDisabled}
                placeholder="Click to select a date"
                className="w-full"
              />

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
                  <span>Already Paused</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-muted opacity-50" />
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Step 2: Show Selected Dates */}
            {selectedDates.length > 0 && (
              <div className="border rounded-sm bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      Step 2: {sortedSelectedDates.length} date{sortedSelectedDates.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllDates}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(groupedDates).map(([monthKey, dates]) => (
                    <div key={monthKey} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{monthKey}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dates.map((date) => {
                          const dateString = format(date, "yyyy-MM-dd");
                          return (
                            <Badge
                              key={dateString}
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              {format(date, "MMM d")}
                              <button
                                type="button"
                                onClick={() => removeDate(dateString)}
                                className="ml-1 hover:text-destructive focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Credit Amount */}
            {selectedDates.length > 0 && (
              <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg px-4 py-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Step 3: ₹{totalCredit.toLocaleString()} credit
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} × ₹{perDayPrice.toFixed(2)} per day
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Step 4: Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are you pausing these dates?"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Step 5: Warning and Consent */}
            <div className="space-y-4">
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertTitle className="text-destructive font-bold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Step 5: IMPORTANT - Pause Cannot Be Undone
                </AlertTitle>
                <AlertDescription className="text-destructive/90">
                  <p className="font-semibold mb-2">
                    Once you pause these dates, you CANNOT resume or undo this action.
                  </p>
                  {warningMessage && (
                    <p className="text-sm mb-2 font-medium">{warningMessage}</p>
                  )}
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Meals will not be delivered on paused dates</li>
                    <li>You will receive credits immediately in your wallet</li>
                    <li>This action is permanent and irreversible</li>
                    <li>Maximum 3 pause operations per month</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Confirmation Checkbox */}
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <FormControl>
                  <Checkbox
                    checked={confirmedPermanent}
                    onCheckedChange={(checked) => setConfirmedPermanent(checked === true)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer text-destructive">
                    I understand that pausing is permanent and cannot be undone
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Credits will be added to your wallet immediately upon confirmation.
                  </p>
                </div>
              </FormItem>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canSubmit}
              >
                {form.formState.isSubmitting ? "Pausing..." : "Pause Permanently"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
