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
      <section
        className={cn(
          "rounded-lg border border-border bg-accent/50 p-3 sm:p-4",
          className,
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</span>
            {durationOptions.map((duration) => {
              const isActive = selectedDurations.includes(duration);
              return (
                <button
                  key={duration}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary",
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meal Type</span>
            {mealTypeOptions.map((mealType) => {
              const isActive = selectedMealTypes.includes(mealType);
              return (
                <button
                  key={mealType}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary",
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

        {hasFilters && (
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
              {activeFilterCount} active
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-xs text-foreground hover:bg-background hover:text-primary"
              onClick={clearAllFilters}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear filters
            </Button>
          </div>
        )}
      </section>
    );
  }

  // Original card layout
  return (
    <section
      className={cn(
        "space-y-5 rounded-lg border border-border bg-accent/50 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Filter plans</h2>
            <p className="text-xs text-muted-foreground">
              {activeFilterCount > 0 ? `${activeFilterCount} filters active` : "Choose duration and meal type"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-full border border-border bg-background/90 px-3 text-xs text-foreground hover:bg-accent hover:text-primary"
          onClick={clearAllFilters}
          disabled={!hasFilters}
          aria-label="Clear all plan filters"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2.5 rounded-lg border border-border bg-background/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Duration
            </p>
            <span className="text-[11px] font-medium text-muted-foreground">{selectedDurations.length} selected</span>
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
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border/90 bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary",
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

        <div className="space-y-2.5 rounded-lg border border-border bg-background/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
              Meal type
            </p>
            <span className="text-[11px] font-medium text-muted-foreground">{selectedMealTypes.length} selected</span>
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
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border/90 bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary",
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

        <p className="text-xs text-muted-foreground">Tip: You can combine multiple chips to narrow down plans faster.</p>
      </div>
    </section>
  );
}
