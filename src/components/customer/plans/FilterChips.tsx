"use client";

import { CalendarDays, Check, SlidersHorizontal, UtensilsCrossed, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  layout?: "card" | "horizontal";
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
  layout = "card",
}: FilterChipsProps) {
  const hasFilters = selectedDurations.length > 0 || selectedMealTypes.length > 0;
  const activeFilterCount = selectedDurations.length + selectedMealTypes.length;

  const clearAllFilters = () => {
    onDurationChange([]);
    onMealTypeChange([]);
  };

  // Horizontal layout variant
  if (layout === "horizontal") {
    return (
      <section className={cn("flex flex-wrap items-center gap-3", className)}>
        <span className="text-sm font-medium text-gray-700">Duration:</span>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((duration) => {
            const isActive = selectedDurations.includes(duration);
            return (
              <button
                key={duration}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50",
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

        <div className="h-6 w-px bg-gray-300" aria-hidden="true" />

        <span className="text-sm font-medium text-gray-700">Meal type:</span>
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((mealType) => {
            const isActive = selectedMealTypes.includes(mealType);
            return (
              <button
                key={mealType}
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50",
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

        {hasFilters && (
          <>
            <div className="h-6 w-px bg-gray-300" aria-hidden="true" />
            <Badge variant="secondary" className="gap-1.5 bg-orange-100 text-orange-800">
              {activeFilterCount} active
              <button
                type="button"
                className="ml-1 hover:text-orange-900"
                onClick={clearAllFilters}
                aria-label="Clear all filters"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </>
        )}
      </section>
    );
  }

  // Original card layout
  return (
    <section
      className={cn(
        "space-y-5 rounded-2xl border border-orange-200/80 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/60 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800">Filter plans</h2>
            <p className="text-xs text-gray-600">
              {activeFilterCount > 0 ? `${activeFilterCount} filters active` : "Choose duration and meal type"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-full border border-orange-200/80 bg-white/90 px-3 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-800"
          onClick={clearAllFilters}
          disabled={!hasFilters}
          aria-label="Clear all plan filters"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2.5 rounded-xl border border-orange-100 bg-white/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <CalendarDays className="h-3.5 w-3.5 text-orange-600" />
              Duration
            </p>
            <span className="text-[11px] font-medium text-gray-500">{selectedDurations.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {durationOptions.map((duration) => {
              const isActive = selectedDurations.includes(duration);
              return (
                <button
                  key={duration}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "border-orange-200/90 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
                  )}
                  onClick={() => onDurationChange(toggleItem(selectedDurations, duration))}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${duration} duration`}
                >
                  {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                  {duration}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5 rounded-xl border border-orange-100 bg-white/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <UtensilsCrossed className="h-3.5 w-3.5 text-orange-600" />
              Meal type
            </p>
            <span className="text-[11px] font-medium text-gray-500">{selectedMealTypes.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {mealTypeOptions.map((mealType) => {
              const isActive = selectedMealTypes.includes(mealType);
              return (
                <button
                  key={mealType}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "border-orange-200/90 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
                  )}
                  onClick={() => onMealTypeChange(toggleItem(selectedMealTypes, mealType))}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${mealType} meals`}
                >
                  {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                  {mealType}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-600">Tip: You can combine multiple chips to narrow down plans faster.</p>
      </div>
    </section>
  );
}
