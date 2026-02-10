"use client";

import { Clock3, UtensilsCrossed } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanBrowseItem;
  onViewMenu: (plan: PlanBrowseItem) => void;
  onSelectPlan: (plan: PlanBrowseItem) => void;
  isSelecting?: boolean;
  isSelected?: boolean;
  className?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function PlanCard({
  plan,
  onViewMenu,
  onSelectPlan,
  isSelecting = false,
  isSelected = false,
  className,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "border-gray-200 bg-white py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isSelected && "border-orange-300 ring-2 ring-orange-100",
        className,
      )}
    >
      <CardHeader className="gap-3 px-5 pb-0 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gray-900">{plan.name}</CardTitle>
            <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.duration}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">{currencyFormatter.format(plan.price)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 sm:px-6">
        {plan.description ? <p className="text-sm leading-relaxed text-gray-600">{plan.description}</p> : null}

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <UtensilsCrossed className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Meals included
          </p>
          {plan.meals_included.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label={`Meals in ${plan.name}`}>
              {plan.meals_included.map((meal) => (
                <li
                  key={`${plan._id}-${meal}`}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {meal}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Meal details will be available soon.</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-1 gap-2 px-5 pt-0 sm:grid-cols-2 sm:px-6">
        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-300"
          onClick={() => onViewMenu(plan)}
          aria-label={`View menu for ${plan.name}`}
        >
          View Menu
        </Button>
        <Button
          type="button"
          className="w-full bg-orange-600 text-white hover:bg-orange-700"
          onClick={() => onSelectPlan(plan)}
          disabled={isSelecting}
          aria-label={`Select ${plan.name} plan`}
        >
          {isSelecting ? "Selecting..." : isSelected ? "Selected" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
