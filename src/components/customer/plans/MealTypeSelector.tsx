"use client";

import { Coffee, UtensilsCrossed, Moon, Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

const MEAL_TYPES_CONFIG: Record<
  MealType,
  { label: string; icon: typeof Coffee }
> = {
  Breakfast: { label: "Breakfast", icon: Coffee },
  Lunch: { label: "Lunch", icon: UtensilsCrossed },
  Dinner: { label: "Dinner", icon: Moon },
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
    <div className="space-y-3">
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
              "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-500 border-2",
              isSelected
                ? "border-[#FF6B35] bg-orange-50/50 shadow-[0_4px_20px_rgba(255,107,53,0.15)]"
                : "border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#FF6B35]/30 hover:shadow-[0_4px_20px_rgba(255,107,53,0.1)] hover:-translate-y-0.5",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300",
                  isSelected
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8555] text-white shadow-md"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="font-semibold text-gray-900">{config.label}</span>
            </div>

            {isSelected ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-md">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
            )}
          </button>
        );
      })}
    </div>
  );
}
