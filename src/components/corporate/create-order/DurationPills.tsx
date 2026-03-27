"use client";

import { cn } from "@/lib/utils";

interface DurationPillsProps {
  value: number;
  onChange: (weeks: number) => void;
}

const DURATIONS = [
  { weeks: 4, label: "4W" },
  { weeks: 6, label: "6W" },
  { weeks: 8, label: "8W" },
  { weeks: 12, label: "12W" },
] as const;

export function DurationPills({ value, onChange }: DurationPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map(({ weeks, label }) => (
        <button
          key={weeks}
          type="button"
          onClick={() => onChange(weeks)}
          className={cn(
            "px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all border",
            value === weeks
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/30"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
