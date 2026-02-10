"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type { MenuPreviewDay, MenuPreviewMeal } from "@/api/types/customer.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MenuPreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  menu?: MenuPreviewDay[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

const groupMealsByType = (meals: MenuPreviewMeal[]): Record<string, MenuPreviewMeal[]> => {
  return meals.reduce<Record<string, MenuPreviewMeal[]>>((groups, meal) => {
    const key = meal.meal_type;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(meal);
    return groups;
  }, {});
};

export function MenuPreviewSheet({
  open,
  onOpenChange,
  planName,
  menu,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: MenuPreviewSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={() => onOpenChange(false)}
        aria-label="Close menu preview"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={planName ? `${planName} menu preview` : "Plan menu preview"}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[90vh] overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[32rem] sm:max-w-full sm:rounded-none sm:rounded-l-2xl",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-700">Menu preview</p>
            <h2 className="text-lg font-semibold text-gray-900">{planName ?? "Selected plan"}</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu preview panel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-4 py-4 sm:max-h-full sm:px-6 sm:py-5">
          {isLoading ? (
            <div className="space-y-4" aria-label="Loading menu preview">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`menu-loading-${index}`} className="space-y-2 rounded-xl border border-gray-200 p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && isError ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Unable to load menu preview</AlertTitle>
              <AlertDescription>
                {errorMessage ?? "Please try again in a moment."}
                {onRetry ? (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-300 bg-white text-red-700 hover:bg-red-100"
                      onClick={onRetry}
                      aria-label="Retry loading menu preview"
                    >
                      Retry
                    </Button>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {!isLoading && !isError && (!menu || menu.length === 0) ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <h3 className="text-base font-semibold text-gray-900">No menu available</h3>
              <p className="mt-2 text-sm text-gray-600">We are preparing this menu. Please check back soon.</p>
            </div>
          ) : null}

          {!isLoading && !isError && menu && menu.length > 0 ? (
            <div className="space-y-4">
              {menu.map((day) => {
                const groupedMeals = groupMealsByType(day.meals);

                return (
                  <article key={day.day} className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="text-base font-semibold text-gray-900">{day.day}</h3>
                    <Separator className="my-3" />

                    <div className="space-y-3">
                      {Object.entries(groupedMeals).map(([mealType, meals]) => (
                        <div key={`${day.day}-${mealType}`}>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{mealType}</p>
                          <ul className="mt-1 space-y-1 text-sm text-gray-700">
                            {meals.map((meal) => (
                              <li key={meal.recipe_id} className="rounded-md bg-gray-50 px-2.5 py-1.5">
                                {meal.recipe_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
