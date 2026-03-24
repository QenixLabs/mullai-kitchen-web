"use client";

import { FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";

import { useCustomPlanMenuPreview } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
import { cn } from "@/lib/utils";

interface WeeklyMenuPreviewProps {
  params: CustomPlanMenuPreviewParams | null;
  preference?: "VEG" | "NON_VEG" | null;
}

function MealCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white flex-shrink-0 w-[160px] shadow-md">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-3">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <MealCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function WeeklyMenuPreview({
  params,
  preference,
}: WeeklyMenuPreviewProps) {
  const { data, isLoading, error } = useCustomPlanMenuPreview(params);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-100 bg-red-50 text-center">
        <p className="text-sm text-red-500">Failed to load menu preview.</p>
      </div>
    );
  }

  if (!data || data.menu.length === 0) {
    return null;
  }

  // Get first meal of each day for the preview
  const menuPreview = data.menu
    .map((day) => ({
      day: day.day,
      meal: day.meals[0],
    }))
    .slice(0, 7);

  const preferenceLabel =
    preference === "VEG" ? "Veg" : preference === "NON_VEG" ? "Non-veg" : "";

  return (
    <div className="space-y-4">
      {preferenceLabel && (
        <h3
          className="text-sm font-medium text-primary"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {preferenceLabel} (weekly menu)
        </h3>
      )}

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {menuPreview.map((item) => (
          <div
            key={item.day}
            className="rounded-xl border border-gray-100 overflow-hidden bg-white flex-shrink-0 w-[160px] shadow-md"
          >
            <div className="aspect-square relative bg-gray-50 overflow-hidden m-2 rounded-lg">
              {item.meal.recipe.recipe_image ? (
                <Image
                  src={item.meal.recipe.recipe_image}
                  alt={item.meal.recipe.recipe_name}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-300 text-center px-2">
                    {item.day}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 pt-1">
              <p
                className="text-sm font-medium text-primary line-clamp-1"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {item.meal.recipe.recipe_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
