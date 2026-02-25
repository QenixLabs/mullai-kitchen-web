"use client";

import { Loader2, Calendar } from "lucide-react";

import { useCustomPlanMenuPreview } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeeklyMenuPreviewProps {
  params: CustomPlanMenuPreviewParams | null;
}

function MealCardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-100 animate-pulse h-28" />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <MealCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyMenuPreview({ params }: WeeklyMenuPreviewProps) {
  const { data, isLoading, error } = useCustomPlanMenuPreview(params);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50 text-center">
        <p className="text-sm text-red-800 font-medium">
          Failed to load menu preview. Please try again.
        </p>
      </div>
    );
  }

  if (!data || data.menu.length === 0) {
    return (
      <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-base text-gray-700 font-semibold">
          No menu available
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Select your preferences to see the weekly menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {data.menu.map((day, dayIndex) => (
          <div key={day.day} className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {day.day}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {day.meals.map((meal, mealIndex) => (
                <div
                  key={`${day.day}-${meal.meal_type}`}
                  className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="aspect-video bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-700">
                      {meal.meal_type}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                      {meal.recipe.recipe_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-[#FF6B35]/30 hover:text-[#FF6B35]"
      >
        <Calendar className="w-4 h-4 mr-2" />
        View Full Calendar
      </Button>
    </div>
  );
}
