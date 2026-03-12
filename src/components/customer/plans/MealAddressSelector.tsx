"use client";

import { FaCoffee, FaUtensils, FaDrumstickBite, FaCheck, FaArrowRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddressDropdown } from "./AddressDropdown";
import type { Address } from "@/api/types/customer.types";
import type { MealType } from "@/stores/plan-intent-store";

const MEAL_TYPES_CONFIG: Record<
  MealType,
  { label: string; icon: typeof FaCoffee; time: string; description: string }
> = {
  Breakfast: {
    label: "Breakfast",
    icon: FaCoffee,
    time: "8:00 AM - 9:30 AM",
    description: "Start your day with a wholesome meal",
  },
  Lunch: {
    label: "Lunch",
    icon: FaDrumstickBite,
    time: "12:30 PM - 2:00 PM",
    description: "Midday fuel to keep you going",
  },
  Dinner: {
    label: "Dinner",
    icon: FaUtensils,
    time: "7:30 PM - 9:00 PM",
    description: "End your day with comfort food",
  },
};

interface MealAddressSelectorProps {
  availableMealTypes: MealType[];
  selectedMealType: MealType | null;
  selectedAddressId: string | null;
  addresses: Address[];
  onMealTypeChange: (mealType: MealType) => void;
  onAddressChange: (addressId: string) => void;
  onAddNewAddress: () => void;
  onProceed: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MealAddressSelector({
  availableMealTypes,
  selectedMealType,
  selectedAddressId,
  addresses,
  onMealTypeChange,
  onAddressChange,
  onAddNewAddress,
  onProceed,
  onCancel,
  isLoading = false,
}: MealAddressSelectorProps) {
  const canProceed = selectedMealType && selectedAddressId;

  return (
    <div className="space-y-5 rounded-sm border border-border bg-card p-4 shadow-sm animate-in fade-in-0 slide-in-from-top-2">
      {/* Meal Type Selection */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Select Meal Type
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableMealTypes.map((mealType) => {
            const config = MEAL_TYPES_CONFIG[mealType];
            const Icon = config.icon;
            const isSelected = selectedMealType === mealType;

            return (
              <button
                key={mealType}
                type="button"
                onClick={() => onMealTypeChange(mealType)}
                disabled={isLoading}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-sm border-2 p-3 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50 hover:bg-accent",
                  isLoading && "cursor-not-allowed opacity-50"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <FaCheck className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{config.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Address Selection */}
      {selectedMealType && (
        <div className="animate-in fade-in-0 slide-in-from-top-1">
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Deliver to
          </h4>
          <AddressDropdown
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={onAddressChange}
            onAddNewAddress={onAddNewAddress}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onProceed}
          disabled={!canProceed || isLoading}
          className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              Proceed
              <FaArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
