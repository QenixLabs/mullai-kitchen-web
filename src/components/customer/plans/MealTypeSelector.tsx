"use client";

import { FaCheck } from "react-icons/fa";

import { cn } from "@/lib/utils";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

interface MealTypeSelectorProps {
  selectedTypes: Set<MealType>;
  onChange: (types: Set<MealType>) => void;
  disabled?: boolean;
}

const MEAL_CONFIG: Record<MealType, { time: string }> = {
  Breakfast: { time: "8:00 AM - 9:30 AM" },
  Lunch: { time: "12:30 PM - 2:00 PM" },
  Dinner: { time: "7:30 PM - 9:00 PM" },
};

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(Object.keys(MEAL_CONFIG) as MealType[]).map((meal) => {
        const isSelected = selectedTypes.has(meal);
        const config = MEAL_CONFIG[meal];

        return (
          <button
            key={meal}
            type="button"
            onClick={() => toggleMeal(meal)}
            disabled={disabled}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left",
              isSelected
                ? "border-2 border-primary bg-primary/5 shadow-lg"
                : "border border-gray-200 bg-white hover:border-gray-300 shadow-sm",
              disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
            )}
          >
            {/* Radio circle */}
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-gray-400 bg-white",
              )}
            >
              {isSelected && <FaCheck className="w-3.5 h-3.5 text-white" />}
            </div>

            {/* Label & Time */}
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-primary text-lg leading-tight"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {meal}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{config.time}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
