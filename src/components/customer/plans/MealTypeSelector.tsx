"use client";

import { FaCheck, FaCoffee, FaHamburger, FaUtensils } from "react-icons/fa";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

interface MealTypeSelectorProps {
  selectedTypes: Set<MealType>;
  onChange: (types: Set<MealType>) => void;
  disabled?: boolean;
}

const MEAL_CONFIG: Record<MealType, { time: string }> = {
  Breakfast: { time: "7:30 AM - 9:00 AM" },
  Lunch: { time: "12:30 PM - 2:00 PM" },
  Dinner: { time: "7:00 PM - 8:30 PM" },
};

const MEAL_ICON: Record<MealType, ComponentType<{ className?: string }>> = {
  Breakfast: FaCoffee,
  Lunch: FaHamburger,
  Dinner: FaUtensils,
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
    <div className="grid grid-cols-1 gap-3">
      {(Object.keys(MEAL_CONFIG) as MealType[]).map((meal) => {
        const isSelected = selectedTypes.has(meal);
        const config = MEAL_CONFIG[meal];
        const Icon = MEAL_ICON[meal];

        return (
          <Button
            key={meal}
            type="button"
            variant="ghost"
            onClick={() => toggleMeal(meal)}
            disabled={disabled}
            className={cn(
              "relative flex h-auto items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
              isSelected
                ? "border-2 border-primary bg-white shadow-[0_4px_14px_rgba(37,10,17,0.08)]"
                : "border border-[#E5DEE2] bg-white hover:border-[#D9CFD4] hover:bg-white",
              disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F3ECEF] text-primary">
              <Icon className="h-4 w-4" />
            </div>

            {/* Label & Time */}
            <div className="min-w-0 flex-1">
              <p
                className="text-[16px] font-bold leading-tight text-[#2F1217]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {meal}
              </p>
              <p className="mt-0.5 text-xs text-[#7A6F73]">Recommended: {config.time}</p>
            </div>

            {/* Checkbox */}
            <div
              className={cn(
                "h-5 w-5 shrink-0 rounded border transition-all flex items-center justify-center",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-[#D5CACE] bg-white",
              )}
            >
              {isSelected && <FaCheck className="h-3 w-3 text-white" />}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
