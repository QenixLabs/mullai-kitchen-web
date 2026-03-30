"use client";


import { cn } from "@/lib/utils";

interface DaySelectorProps {
  selectedDays: string[];
  onDayToggle: (day: string, checked: boolean) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export function DaySelector({ selectedDays, onDayToggle }: DaySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day);
        const shortDay = day.slice(0, 3).toUpperCase();
        return (
          <button
            key={day}
            type="button"
            onClick={() => onDayToggle(day, !isSelected)}
            className={cn(
              "flex items-center justify-center rounded-xl transition-all border",
              "w-12 h-12 sm:w-14 sm:h-14 text-sm sm:text-base font-bold",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            {shortDay}
          </button>
        );
      })}
    </div>
  );
}
