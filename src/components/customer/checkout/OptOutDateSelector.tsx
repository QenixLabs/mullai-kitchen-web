"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { X, PiggyBank, CalendarDays, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface OptOutDateSelectorProps {
  startDate: Date;
  endDate: Date;
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
  maxOptOutDays: number;
  perDayPrice: number;
  className?: string;
  mealsRemaining?: number;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function OptOutDateSelector({
  startDate,
  endDate,
  selectedDates,
  onChange,
  maxOptOutDays,
  perDayPrice,
  className,
  mealsRemaining,
}: OptOutDateSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate);

  const totalDiscount = selectedDates.length * perDayPrice;
  const daysRemaining = maxOptOutDays - selectedDates.length;

  // Get valid opt-out date range (can't opt out today, need 9pm cutoff)
  const validDateRange = useMemo(() => {
    const today = startOfDay(new Date());
    const minDate = addDays(today, 1); // Can't opt out today
    const effectiveStartDate = minDate > startDate ? minDate : startDate;
    return { start: effectiveStartDate, end: endDate };
  }, [startDate, endDate]);

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

    if (isSelected) {
      onChange(selectedDates.filter((d) => !isSameDay(d, date)));
    } else if (selectedDates.length < maxOptOutDays) {
      onChange([...selectedDates, date]);
    }
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

    const availableSlots = maxOptOutDays - selectedDates.length;
    const toAdd = weekends.slice(0, availableSlots);
    onChange([...selectedDates, ...toAdd]);
  };

  const clearAll = () => {
    onChange([]);
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

  return (
    <section
      className={cn(
        "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Skip Delivery Days
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Select days you don&apos;t want delivery and get ₹{perDayPrice} off per
            day
          </p>
        </div>
        {mealsRemaining !== undefined && (
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium w-fit"
          >
            {mealsRemaining} Meals in Plan
          </Badge>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Selected
            </p>
            <p className="text-2xl font-bold text-foreground">
              {selectedDates.length}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {maxOptOutDays}
              </span>
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              You{"'"}ll Save
            </p>
            <p className="text-2xl font-bold text-primary">
              ₹{totalDiscount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllWeekends}
            disabled={daysRemaining <= 0}
            className="rounded-lg whitespace-nowrap"
          >
            Auto-select Weekends
          </Button>
        </div>
      </div>

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
                        // Base states
                        !isCurrentMonth && "text-muted-foreground/30",
                        isCurrentMonth && !isEligible && "text-muted-foreground/30",

                        // Default (delivering) state - subtle
                        isCurrentMonth &&
                          isEligible &&
                          !isSelected &&
                          "text-foreground hover:bg-muted",

                        // Weekend styling
                        isWeekendDay &&
                          isCurrentMonth &&
                          isEligible &&
                          !isSelected &&
                          "text-muted-foreground/70",

                        // Selected state - prominent
                        isSelected &&
                          "bg-primary text-primary-foreground shadow-sm",

                        // Disabled cursor
                        !isEligible && "cursor-not-allowed"
                      )}
                    >
                      {format(date, "d")}

                      {/* Weekend indicator dot for eligible days */}
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
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs text-muted-foreground">
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

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Selected Days ({selectedDates.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
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

      {/* Limit warning */}
      {daysRemaining <= 0 && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <Info className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">
            You&apos;ve reached the maximum opt-out limit ({maxOptOutDays} days). To
            add more days, remove some existing selections first.
          </p>
        </div>
      )}

      {/* Low remaining warning */}
      {daysRemaining > 0 && daysRemaining <= 3 && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
          <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            You can opt out of {daysRemaining} more day
            {daysRemaining !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {/* Total Savings */}
      {totalDiscount > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              ₹{totalDiscount.toLocaleString()} discount applied
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} ×
              ₹{perDayPrice} off your subscription
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
