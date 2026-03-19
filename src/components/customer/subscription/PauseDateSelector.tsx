"use client";

import { useState, useMemo } from "react";
import { format, isSameDay, startOfDay } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CalendarDays, Plus } from "lucide-react";

interface PauseDateSelectorProps {
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
  minDate: Date;
  maxDate: Date;
  disabledDates?: Date[];
}

export function PauseDateSelector({
  selectedDates,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
}: PauseDateSelectorProps) {
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

  // Normalize dates for comparison
  const normalizeDate = (date: Date): Date => {
    return startOfDay(new Date(date));
  };

  // Check if a date is already selected
  const isDateSelected = (date: Date): boolean => {
    const normalizedDate = normalizeDate(date);
    return selectedDates.some((d) => isSameDay(normalizeDate(d), normalizedDate));
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const normalizedDate = normalizeDate(date);
    const normalizedMin = normalizeDate(minDate);
    const normalizedMax = normalizeDate(maxDate);

    // Disable if outside range
    if (normalizedDate < normalizedMin || normalizedDate > normalizedMax) {
      return true;
    }

    // Disable already paused dates
    if (disabledDates.some((d) => isSameDay(normalizeDate(d), normalizedDate))) {
      return true;
    }

    return false;
  };

  // Add date from DatePicker
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const normalizedDate = normalizeDate(date);
    
    if (isDateDisabled(date) || isDateSelected(date)) {
      setTempDate(undefined);
      return;
    }
    
    onChange([...selectedDates, normalizedDate]);
    setTempDate(undefined);
  };

  // Remove a specific date
  const removeDate = (dateToRemove: Date) => {
    onChange(selectedDates.filter((d) => !isSameDay(normalizeDate(d), dateToRemove)));
  };

  // Clear all dates
  const clearAllDates = () => {
    onChange([]);
  };

  // Deduplicate and sort selected dates
  const sortedSelectedDates = useMemo(() => {
    const uniqueDates = new Map<string, Date>();
    selectedDates.forEach((date) => {
      const normalized = normalizeDate(date);
      const key = format(normalized, "yyyy-MM-dd");
      uniqueDates.set(key, normalized);
    });
    return Array.from(uniqueDates.values()).sort((a, b) => a.getTime() - b.getTime());
  }, [selectedDates]);

  // Group by month
  const groupedDates = useMemo(() => {
    const groups: Record<string, Date[]> = {};
    sortedSelectedDates.forEach((date) => {
      const key = format(date, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(date);
    });
    return groups;
  }, [sortedSelectedDates]);

  return (
    <div className="space-y-4">
      {/* Date Picker Section */}
      <div className="border rounded-sm bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Add dates to pause</span>
        </div>
        
        <DatePicker
          date={tempDate}
          onDateChange={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
          disabled={isDateDisabled}
          placeholder="Select a date to add"
          className="w-full"
        />

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
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

      {/* Selected Dates List */}
      {sortedSelectedDates.length > 0 && (
        <div className="border rounded-sm bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {sortedSelectedDates.length} date{sortedSelectedDates.length !== 1 ? "s" : ""} selected
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

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.entries(groupedDates).map(([monthKey, dates]) => (
              <div key={monthKey} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{monthKey}</p>
                <div className="flex flex-wrap gap-1.5">
                  {dates.map((date, index) => (
                    <Badge
                      key={`${monthKey}-${index}`}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {format(date, "MMM d")}
                      <button
                        type="button"
                        onClick={() => removeDate(date)}
                        className="ml-1 hover:text-destructive focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
