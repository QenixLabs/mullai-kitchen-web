"use client";

import { Loader2, Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";

import { useCustomPlanMenuPreview } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeeklyMenuPreviewProps {
  params: CustomPlanMenuPreviewParams | null;
}

function MealCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      <div className="aspect-video bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <MealCardSkeleton key={i} />
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
      <div className="p-6 rounded-2xl border-2 border-red-50 text-center">
        <p className="text-sm text-red-500 font-medium">
          Failed to load menu preview.
        </p>
      </div>
    );
  }

  if (!data || data.menu.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium tracking-tight">
          Select your preferences to see the weekly menu preview.
        </p>
      </div>
    );
  }

  // Get first meal of each day for the preview
  const menuPreview = data.menu
    .map((day) => ({
      day: day.day,
      meal: day.meals[0], // Taking the first meal for preview
    }))
    .slice(0, 4); // Limit to 4 days for the preview like in the image

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Weekly Preview Menu</h2>
        <Button
          variant="link"
          className="text-[#FF6B35] font-bold text-sm h-auto p-0 hover:no-underline"
        >
          View Full Calendar
          <Calendar className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuPreview.map((item, idx) => (
          <div
            key={item.day}
            className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="aspect-video relative bg-gray-100">
              {item.meal.recipe.recipe_image ? (
                <Image
                  src={item.meal.recipe.recipe_image}
                  alt={item.meal.recipe.recipe_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-2">
                    {item.day}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-wider mb-1">
                {item.day}
              </p>
              <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                {item.meal.recipe.recipe_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
