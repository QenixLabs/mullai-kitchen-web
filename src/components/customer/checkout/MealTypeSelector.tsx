"use client";

import { FaCoffee, FaDrumstickBite, FaUtensils, FaCheck, FaHome, FaBriefcase } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { MealType } from "@/stores/plan-intent-store";
import type { AddressType } from "@/api/types/customer.types";

interface MealTypeConfig {
  label: string;
  icon: typeof FaCoffee;
  time: string;
  description: string;
  suggestedAddress: AddressType;
}

const MEAL_TYPE_CONFIG: Record<MealType, MealTypeConfig> = {
  Breakfast: {
    label: "Breakfast",
    icon: FaCoffee,
    time: "8:00 AM - 9:30 AM",
    description: "Start your day with a wholesome meal",
    suggestedAddress: "Home",
  },
  Lunch: {
    label: "Lunch",
    icon: FaDrumstickBite,
    time: "12:30 PM - 2:00 PM",
    description: "Midday fuel to keep you going",
    suggestedAddress: "Home",
  },
  Dinner: {
    label: "Dinner",
    icon: FaUtensils,
    time: "7:30 PM - 9:00 PM",
    description: "End your day with comfort food",
    suggestedAddress: "Home",
  },
};

interface MealTypeSelectorProps {
  availableMealTypes: MealType[];
  selectedMealType: MealType | null;
  onMealTypeChange: (mealType: MealType) => void;
  disabled?: boolean;
}

export function MealTypeSelector({
  availableMealTypes,
  selectedMealType,
  onMealTypeChange,
  disabled = false,
}: MealTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
        <FaUtensils className="h-5 w-5 text-primary" />
        Select Meal Type
      </h3>
      <p className="text-sm text-muted-foreground">
        Choose which meal you want delivered. We&apos;ll suggest the best delivery location.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableMealTypes.map((mealType) => {
          const config = MEAL_TYPE_CONFIG[mealType];
          const Icon = config.icon;
          const isSelected = selectedMealType === mealType;

          return (
            <button
              key={mealType}
              type="button"
              onClick={() => onMealTypeChange(mealType)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col gap-3 rounded-sm border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/30 hover:bg-accent",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <FaCheck className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-sm transition-colors",
                    isSelected ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "font-semibold",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{config.time}</p>
                </div>
              </div>

              {/* Suggested address hint */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {config.suggestedAddress === "Home" ? (
                  <FaHome className="h-3 w-3" />
                ) : (
                  <FaBriefcase className="h-3 w-3" />
                )}
                <span>Selected: {config.suggestedAddress}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
