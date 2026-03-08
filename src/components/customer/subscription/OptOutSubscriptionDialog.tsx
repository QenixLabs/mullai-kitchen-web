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
import {
  format,
  isSameDay,
  startOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isWeekend,
  isSameMonth,
  addMonths,
} from "date-fns";
import { X, PiggyBank, Loader2, CalendarDays, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useCreateOptOutPeriod } from "@/api/hooks/use-subscription";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

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
  perDayPrice: number;
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
  perDayPrice,
  onSuccess,
}: OptOutSubscriptionDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(subscriptionStartDate);
  const createOptOutMutation = useCreateOptOutPeriod();

  const daysRemaining = maxOptOutDays - daysAlreadyOptedOut - selectedDates.length;
  const totalCredit = selectedDates.length * perDayPrice;

  const form = useForm<z.infer<typeof optOutSchema>>({
    resolver: zodResolver(optOutSchema),
    defaultValues: {
      opted_out_dates: [],
      reason: "",
    },
  });

  // Get valid opt-out date range
  const validDateRange = useMemo(() => {
    const today = startOfDay(new Date());
    const minDate = addDays(today, 1); // Can't opt out today
    const effectiveStartDate = minDate > subscriptionStartDate ? minDate : subscriptionStartDate;
    return { start: effectiveStartDate, end: subscriptionEndDate };
  }, [subscriptionStartDate, subscriptionEndDate]);

  // Check if a date is eligible for opt-out
  const isDateEligible = (date: Date) => {
    return date >= validDateRange.start && date <= validDateRange.end;
  };

  // Generate calendar weeks for current month view
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const weeks = eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 0 }
    );

    return weeks.map((weekStart) => {
      return eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
      });
    });
  }, [currentMonth]);

  // Navigation
  const canGoPrev = startOfMonth(currentMonth) > validDateRange.start;
  const canGoNext = endOfMonth(currentMonth) < validDateRange.end;

  const goToPrevMonth = () => setCurrentMonth((prev) => addMonths(prev, -1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  // Date selection
  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  const handleDateToggle = (date: Date) => {
    if (!isDateEligible(date)) return;

    const isSelected = isDateSelected(date);
    const newDates = isSelected
      ? selectedDates.filter((d) => !isSameDay(d, date))
      : selectedDates.length < daysAlreadyOptedOut + daysRemaining
        ? [...selectedDates, date]
        : selectedDates;

    setSelectedDates(newDates);
    form.setValue("opted_out_dates", newDates);
  };

  // Quick actions
  const selectAllWeekends = () => {
    const weekends: Date[] = [];
    let current = new Date(validDateRange.start);
    const end = new Date(validDateRange.end);

    while (current <= end) {
      if (isWeekend(current) && !isDateSelected(current)) {
        weekends.push(new Date(current));
      }
      current = addDays(current, 1);
    }

    const availableSlots = daysAlreadyOptedOut + daysRemaining - selectedDates.length;
    const toAdd = weekends.slice(0, availableSlots);
    const newDates = [...selectedDates, ...toAdd];
    setSelectedDates(newDates);
    form.setValue("opted_out_dates", newDates);
  };

  const clearAll = () => {
    setSelectedDates([]);
    form.setValue("opted_out_dates", []);
  };

  // Selected dates summary (sorted)
  const sortedSelectedDates = useMemo(() => {
    return [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
  }, [selectedDates]);

  // Group selected dates by month for display
  const selectedByMonth = useMemo(() => {
    const groups: Record<string, Date[]> = {};
    sortedSelectedDates.forEach((date) => {
      const key = format(date, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(date);
    });
    return groups;
  }, [sortedSelectedDates]);

  const handleSubmit = async (data: z.infer<typeof optOutSchema>) => {
    if (selectedDates.length === 0) return;

    const dateStrings = selectedDates.map((d) => d.toISOString().split("T")[0]);

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

  const handleClose = () => {
    setSelectedDates([]);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Opt Out Days
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {daysRemaining}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}/ {maxOptOutDays}
                    </span>
                  </p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Credit
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalCredit.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedDates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>

            {daysRemaining <= 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">
                  You've reached the maximum opt-out limit (50% of subscription days)
                </p>
              </div>
            )}

            {/* Calendar */}
            <div className="border border-border rounded-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h4 className="font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h4>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goToNextMonth}
                    disabled={!canGoNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-center text-xs font-medium py-2",
                        i === 0 || i === 6
                          ? "text-muted-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="space-y-1">
                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((date) => {
                        const isSelected = isDateSelected(date);
                        const isEligible = isDateEligible(date);
                        const isCurrentMonth = isSameMonth(date, currentMonth);
                        const isWeekendDay = isWeekend(date);

                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => handleDateToggle(date)}
                            disabled={!isEligible}
                            className={cn(
                              "relative h-10 w-full rounded-lg text-sm font-medium transition-all",
                              !isCurrentMonth && "text-muted-foreground/30",
                              isCurrentMonth && !isEligible && "text-muted-foreground/30",
                              isCurrentMonth &&
                                isEligible &&
                                !isSelected &&
                                "text-foreground hover:bg-muted",
                              isWeekendDay &&
                                isCurrentMonth &&
                                isEligible &&
                                !isSelected &&
                                "text-muted-foreground/70",
                              isSelected &&
                                "bg-primary text-primary-foreground shadow-sm",
                              !isEligible && "cursor-not-allowed"
                            )}
                          >
                            {format(date, "d")}

                            {isWeekendDay && isEligible && !isSelected && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-muted-foreground/30" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span>Opted Out</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                <span>Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded border border-border" />
                <span>Delivering</span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllWeekends}
                disabled={daysRemaining <= 0}
                className="rounded-lg"
              >
                Auto-select Weekends
              </Button>
            </div>

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Selected Days ({selectedDates.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {Object.entries(selectedByMonth).map(([monthName, dates]) => (
                    <div key={monthName} className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {monthName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dates.map((date) => (
                          <Badge
                            key={date.toISOString()}
                            variant="secondary"
                            className="rounded-lg px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                            onClick={() => handleDateToggle(date)}
                          >
                            <span className="font-medium">
                              {format(date, "EEE, MMM d")}
                            </span>
                            <X className="h-3 w-3 ml-2" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credit display */}
            {totalCredit > 0 && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    ₹{totalCredit.toLocaleString()} will be credited to your wallet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} × ₹{perDayPrice}
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
                      className="rounded-lg border-input bg-card focus:ring-primary focus:border-primary resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedDates.length === 0 || createOptOutMutation.isPending}
                className="rounded-lg bg-primary hover:bg-primary/90"
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
