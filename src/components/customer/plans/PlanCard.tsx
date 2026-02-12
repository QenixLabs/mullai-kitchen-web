"use client";

import { Clock3, Star, UtensilsCrossed } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanBrowseItem;
  onViewMenu: (plan: PlanBrowseItem) => void;
  onSelectPlan: (plan: PlanBrowseItem) => void;
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
  isSelected = false,
  className,
}: PlanCardProps) {
  // Calculate monthly price from duration (approximate)
  const getMonthlyPrice = (): number | null => {
    const durationLower = plan.duration.toLowerCase();
    if (durationLower.includes("week") || durationLower.includes("weekly")) {
      return Math.round((plan.price * 4) / 10) * 10; // Round to nearest 10
    }
    if (durationLower.includes("month") || durationLower.includes("monthly")) {
      return plan.price;
    }
    return null;
  };

  const monthlyPrice = getMonthlyPrice();
  const hasImage = Boolean(plan.image_url);

  return (
    <Card
      className={cn(
        "group overflow-hidden border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md card-shadow",
        isSelected && "border-orange-400 ring-2 ring-orange-100",
        className,
      )}
    >
      {/* Image Area */}
      {hasImage ? (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
          <img
            src={plan.image_url}
            alt={plan.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {plan.badge && (
            <Badge className="absolute left-3 top-3 bg-orange-600 text-white">
              {plan.badge}
            </Badge>
          )}
        </div>
      ) : (
        <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
          <UtensilsCrossed className="h-16 w-16 text-orange-300" aria-hidden="true" />
          {plan.badge && (
            <Badge className="absolute left-3 top-3 bg-orange-600 text-white">
              {plan.badge}
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="gap-3 px-5 pb-2 pt-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1.5">
            <CardTitle className="text-lg font-semibold text-gray-900">{plan.name}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {plan.duration}
              </div>
              {plan.rating && (
                <div className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {plan.rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">{currencyFormatter.format(plan.price)}</p>
            {monthlyPrice && monthlyPrice !== plan.price && (
              <p className="text-xs text-gray-500">
                ~{currencyFormatter.format(monthlyPrice)}/month
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-4 sm:px-5">
        {plan.description ? <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">{plan.description}</p> : null}

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

      <CardFooter className="grid grid-cols-1 gap-2 px-5 pt-0 pb-5 sm:grid-cols-2 sm:px-5">
        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-300 hover:bg-gray-50"
          onClick={() => onViewMenu(plan)}
          aria-label={`View menu for ${plan.name}`}
        >
          View Menu
        </Button>
        <Button
          type="button"
          className="w-full bg-orange-600 text-white hover:bg-orange-700"
          onClick={() => onSelectPlan(plan)}
          aria-label={`Select ${plan.name} plan`}
        >
          {isSelected ? "Selected" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
