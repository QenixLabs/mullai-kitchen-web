"use client";

import { CalendarDays, CircleCheck, MapPin, ShoppingCart, UtensilsCrossed } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanDetailsPanelProps {
  plan: PlanBrowseItem | null;
  checkedPincode?: string | null;
  isCheckingOut?: boolean;
  onProceedToCheckout: () => void;
  onViewMenu: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function PlanDetailsPanel({
  plan,
  checkedPincode = null,
  isCheckingOut = false,
  onProceedToCheckout,
  onViewMenu,
}: PlanDetailsPanelProps) {
  if (!plan) {
    return (
      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Plan details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Select a plan to view full details and continue to checkout.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-white/95 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
          Selected Plan
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
          <p className="text-sm text-gray-600">{plan.description ?? "Freshly prepared meals tailored to your schedule."}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plan price</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{currencyFormatter.format(plan.price)}</p>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <CalendarDays className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Duration: {plan.duration}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-orange-600" aria-hidden="true" />
            {checkedPincode ? `Pincode ${checkedPincode} is selected` : "Check your pincode for delivery availability"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <UtensilsCrossed className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Meals included
          </p>
          {plan.meals_included.length > 0 ? (
            <ul className="space-y-1" aria-label="Included meals">
              {plan.meals_included.map((meal) => (
                <li key={`${plan._id}-${meal}`} className="flex items-center gap-2 text-sm text-gray-700">
                  <CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {meal}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Meal details will be available soon.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onProceedToCheckout}
            disabled={isCheckingOut}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {isCheckingOut ? "Redirecting..." : "Proceed to Checkout"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full border-gray-300"
            onClick={onViewMenu}
          >
            View full menu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
