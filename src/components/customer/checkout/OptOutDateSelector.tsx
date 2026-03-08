"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfDay, addDays, getDay } from "date-fns";
import { X, PiggyBank } from "lucide-react";

interface OptOutDateSelectorProps {
  startDate: Date;
  endDate: Date;
  mealCount: number;
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
  maxOptOutDays: number;
  vegPrice?: number;
  nonvegPrice?: number;
  preference?: 'VEG' | 'NON_VEG';
  className?: string;
  /**
   * Total remaining meals in subscription (for the badge)
   */
  mealsRemaining?: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function OptOutDateSelector({
  startDate,
  endDate,
  mealCount,
  selectedDates,
  onChange,
  maxOptOutDays,
  vegPrice = 80,
  nonvegPrice = 120,
  preference = 'VEG',
  className,
  mealsRemaining,
}: OptOutDateSelectorProps) {
  const mealPrice = preference === 'NON_VEG' ? nonvegPrice : vegPrice;
  const discountPerDay = mealPrice * mealCount;
  const totalDiscount = selectedDates.length * discountPerDay;
  const daysRemaining = maxOptOutDays - selectedDates.length;

  // Generate array of ALL dates from start to end
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    const effectiveStartDate = today > startDate ? today : startDate;
    
    let currentDate = new Date(effectiveStartDate);
    const end = new Date(endDate);
    
    // Generate ALL days in the subscription period
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }, [startDate, endDate]);

  const handleDateToggle = (date: Date) => {
    const dateIndex = selectedDates.findIndex((d) => isSameDay(d, date));

    if (dateIndex >= 0) {
      // Remove date if already selected
      const newDates = selectedDates.filter((_, i) => i !== dateIndex);
      onChange(newDates);
    } else if (selectedDates.length < maxOptOutDays) {
      // Add date if under limit
      onChange([...selectedDates, date]);
    }
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  return (
    <section className={cn(
      "bg-card rounded-sm p-6 shadow-sm border border-border",
      className
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">Delivery Schedule</h3>
          <p className="text-muted-foreground text-sm">
            Tap a day to <span className="text-primary font-bold italic">Opt-out</span> and save on your subscription.
          </p>
        </div>
        {mealsRemaining !== undefined && (
          <div className="text-right">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {mealsRemaining} Meals Remaining
            </span>
          </div>
        )}
      </div>

      {/* Day Grid - Responsive and scrollable for many days */}
      <div className="max-h-[400px] overflow-y-auto pr-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
          {dateRange.map((date) => {
            const isSelected = isDateSelected(date);
            const dayOfWeek = getDay(date);
            const dayNumber = format(date, "dd");
            const weekdayLabel = WEEKDAYS[dayOfWeek];

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateToggle(date)}
                disabled={daysRemaining <= 0 && !isSelected}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-sm transition-all relative",
                  isSelected 
                    ? "border-2 border-primary/20 bg-primary/10" 
                    : "border border-border bg-background-light hover:border-primary",
                  daysRemaining <= 0 && !isSelected && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Weekday label */}
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {weekdayLabel}
                </span>
                
                {/* Day number */}
                <span className={cn(
                  "text-lg font-bold",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {dayNumber}
                </span>
                
                {/* Status label */}
                <div className={cn(
                  "mt-2 text-[10px] font-bold",
                  isSelected ? "text-primary" : "text-primary"
                )}>
                  {isSelected ? 'OPTED OUT' : 'DELIVERING'}
                </div>

                {/* Indicator dot for delivering */}
                {!isSelected && (
                  <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-success" />
                )}

                {/* Cancel icon for opted out */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-card rounded-full p-0.5 shadow-sm">
                      <X className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}

                {/* Bottom indicator bar for opted out */}
                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-b-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Days count info */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {dateRange.length} days
        </div>
        <div className="text-xs text-muted-foreground">
          Selected: <span className="font-bold text-foreground">{selectedDates.length}</span> / {maxOptOutDays} max
        </div>
      </div>

      {/* Savings display */}
      {totalDiscount > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 p-3 rounded-sm border border-primary/10">
          <PiggyBank className="h-4 w-4" />
          <span>Total Savings from Opt-outs: ₹{totalDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Days remaining info */}
      {daysRemaining <= 3 && daysRemaining > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          You can opt out of <span className="font-bold text-primary">{daysRemaining}</span> more day{daysRemaining !== 1 ? 's' : ''}
        </div>
      )}

      {/* Max limit warning */}
      {daysRemaining === 0 && (
        <div className="mt-4 text-xs text-destructive bg-destructive/10 p-3 rounded-sm border border-destructive/20">
          You've selected the maximum allowed opt-out days (50% of subscription)
        </div>
      )}
    </section>
  );
}
