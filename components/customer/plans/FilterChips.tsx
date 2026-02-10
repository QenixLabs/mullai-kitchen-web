"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  selectedDurations: string[];
  selectedMealTypes: string[];
  onDurationChange: (durations: string[]) => void;
  onMealTypeChange: (mealTypes: string[]) => void;
  className?: string;
  durationOptions?: readonly string[];
  mealTypeOptions?: readonly string[];
}

const defaultDurationOptions = ["Weekly", "Monthly"] as const;
const defaultMealTypeOptions = ["Breakfast", "Lunch", "Dinner"] as const;

const toggleItem = (list: string[], value: string): string[] => {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
};

export function FilterChips({
  selectedDurations,
  selectedMealTypes,
  onDurationChange,
  onMealTypeChange,
  className,
  durationOptions = defaultDurationOptions,
  mealTypeOptions = defaultMealTypeOptions,
}: FilterChipsProps) {
  const hasFilters = selectedDurations.length > 0 || selectedMealTypes.length > 0;

  return (
    <section className={cn("space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Filter plans</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-gray-600 hover:text-gray-900"
          onClick={() => {
            onDurationChange([]);
            onMealTypeChange([]);
          }}
          disabled={!hasFilters}
          aria-label="Clear all plan filters"
        >
          Clear all
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Duration</p>
          <div className="flex flex-wrap gap-2">
            {durationOptions.map((duration) => {
              const isActive = selectedDurations.includes(duration);
              return (
                <button
                  key={duration}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-orange-200 hover:text-orange-700",
                  )}
                  onClick={() => onDurationChange(toggleItem(selectedDurations, duration))}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${duration} duration`}
                >
                  {duration}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Meal type</p>
          <div className="flex flex-wrap gap-2">
            {mealTypeOptions.map((mealType) => {
              const isActive = selectedMealTypes.includes(mealType);
              return (
                <button
                  key={mealType}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-orange-200 hover:text-orange-700",
                  )}
                  onClick={() => onMealTypeChange(toggleItem(selectedMealTypes, mealType))}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${mealType} meals`}
                >
                  {mealType}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
