"use client";

import { cn } from "@/lib/utils";
import type { MealType } from "@/api/types/addons.types";

export type AddOnCategoryTab = "ALL" | "MEALS" | "SNACKS" | "BEVERAGES";

interface CategoryTabsProps {
  activeCategory: AddOnCategoryTab;
  onCategoryChange: (category: AddOnCategoryTab) => void;
  subscriptionMealTypes: MealType[];
}

const tabs: { value: AddOnCategoryTab; label: string }[] = [
  { value: "ALL", label: "All Items" },
  { value: "MEALS", label: "Meals" },
  { value: "SNACKS", label: "Snacks" },
  { value: "BEVERAGES", label: "Beverages" },
];

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  subscriptionMealTypes,
}: CategoryTabsProps) {
  // Filter tabs based on subscription meal types - only "ALL" is always shown
  // Other tabs depend on if user has those meal types in subscription
  const availableTabs = tabs.filter((tab) => {
    if (tab.value === "ALL") return true;
    // For now, show all tabs since add-ons can be for any meal type
    // In the future, this could filter based on meal_type compatibility
    return true;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {availableTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onCategoryChange(tab.value)}
          className={cn(
            "px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
            activeCategory === tab.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
