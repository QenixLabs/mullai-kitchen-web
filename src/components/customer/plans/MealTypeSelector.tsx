"use client";

import { Coffee, Beef, Soup, Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

const MEAL_TYPES_CONFIG: Record<
  MealType,
  { label: string; icon: typeof Coffee; time: string }
> = {
  Breakfast: { label: "Breakfast", icon: Coffee, time: "8:00 AM - 9:30 AM" },
  Lunch: { label: "Lunch", icon: Beef, time: "12:30 PM - 2:00 PM" },
  Dinner: { label: "Dinner", icon: Soup, time: "7:30 PM - 9:00 PM" },
};

interface MealTypeSelectorProps {
  selectedTypes: Set<MealType>;
  onChange: (types: Set<MealType>) => void;
  disabled?: boolean;
}

export function MealTypeSelector({
  selectedTypes,
  onChange,
  disabled = false,
}: MealTypeSelectorProps) {
  function toggleMeal(meal: MealType) {
    const next = new Set(selectedTypes);
    if (next.has(meal)) {
      next.delete(meal);
    } else {
      next.add(meal);
    }
    onChange(next);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(MEAL_TYPES_CONFIG).map(([key, config]) => {
        const meal = key as MealType;
        const isSelected = selectedTypes.has(meal);
        const Icon = config.icon;

        return (
          <button
            key={meal}
            type="button"
            onClick={() => toggleMeal(meal)}
            disabled={disabled}
            className={cn(
              "flex items-center p-4 rounded-2xl transition-all duration-300 border-2 text-left bg-background",
              isSelected
                ? "border-primary shadow-sm"
                : "border-border hover:border-border",
              disabled &&
                "opacity-50 cursor-not-allowed hover:border-border",
            )}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Checkbox */}
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-border",
                )}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={4} />
                )}
              </div>

              {/* Label & Time */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm leading-tight">
                  {config.label}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {config.time}
                </p>
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "text-muted-foreground transition-colors",
                  isSelected && "text-primary",
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
