"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";

import { useCustomPlanPricing } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
import { TrustBadge } from "./TrustBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderSummaryPanelProps {
  params: CustomPlanMenuPreviewParams | null;
  onContinue: () => void;
  isContinueDisabled: boolean;
  isAuthenticated: boolean;
}

function PricingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}

export function OrderSummaryPanel({
  params,
  onContinue,
  isContinueDisabled,
  isAuthenticated,
}: OrderSummaryPanelProps) {
  const { data: pricing, isLoading, error } = useCustomPlanPricing(params);

  return (
    <div
      className={cn(
        "sticky top-6 rounded-2xl bg-white border border-gray-100 shadow-lg p-6 transition-all duration-300",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]",
      )}
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Selection Summary */}
      <div className="space-y-3 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold text-gray-900">
            {params?.days || "-"} days
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Meals per day</span>
          <span className="font-semibold text-gray-900">
            {params?.meal_types.length || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Preference</span>
          <span className="font-semibold text-gray-900">
            {params?.preference === "VEG" ? "Vegetarian" : params?.preference === "NON_VEG" ? "Non-Vegetarian" : "-"}
          </span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      {isLoading ? (
        <div className="py-4">
          <PricingSkeleton />
        </div>
      ) : error ? (
        <div className="py-4">
          <p className="text-sm text-red-600 text-center">
            Failed to load pricing
          </p>
        </div>
      ) : pricing ? (
        <div className="space-y-2.5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Price per meal</span>
            <span className="font-semibold text-gray-900">
              ₹{pricing.price_per_meal}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total meals</span>
            <span className="font-semibold text-gray-900">
              {pricing.total_meals}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">
              ₹{pricing.subtotal}
            </span>
          </div>
          {pricing.bulk_discount.amount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium">
                Bulk discount ({pricing.bulk_discount.percentage}%)
              </span>
              <span className="font-semibold text-green-600">
                -₹{pricing.bulk_discount.amount}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-base pt-2">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-[#FF6B35]">
              ₹{pricing.total}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">
            Complete your selections to see pricing
          </p>
        </div>
      )}

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={isContinueDisabled || isLoading}
        className={cn(
          "w-full h-12 rounded-xl font-semibold text-white shadow-md mt-4",
          "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
          "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100",
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isAuthenticated ? (
          <>
            Continue to Checkout
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Sign in to Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Trust Badges */}
      <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
        <TrustBadge icon={Check} text="No hidden charges" />
        <TrustBadge icon={Check} text="Fresh meals daily" />
        <TrustBadge icon={Check} text="Easy cancellation" />
      </div>
    </div>
  );
}
