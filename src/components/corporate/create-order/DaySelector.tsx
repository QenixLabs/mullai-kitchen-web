"use client";

import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek } from "date-fns";

interface DaySelectorProps {
  selectedDays: string[];
  startDate: string;
  onDayToggle: (day: string, checked: boolean) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export function DaySelector({ selectedDays, startDate, onDayToggle }: DaySelectorProps) {
  // Generate dates for the week starting from the selected start date
  const weekStart = startDate
    ? startOfWeek(new Date(startDate), { weekStartsOn: 1 })
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  const dayData = DAYS.map((day, index) => {
    const date = addDays(weekStart, index);
    return {
      day,
      shortDay: day.slice(0, 3).toUpperCase(),
      dateNum: format(date, "dd"),
    };
  });

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {dayData.map(({ day, shortDay, dateNum }) => {
        const isSelected = selectedDays.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => onDayToggle(day, !isSelected)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl transition-all border",
              "w-12 h-14 sm:w-14 sm:h-16",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            <span className="text-[9px] sm:text-[10px] font-medium opacity-80">{shortDay}</span>
            <span className="text-base sm:text-lg font-bold">{dateNum}</span>
          </button>
        );
      })}
    </div>
  );
}
