"use client";

import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import { useCustomPlanPricing } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
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
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-4 w-full bg-gray-100 rounded" />
      <div className="h-4 w-3/4 bg-gray-100 rounded" />
      <div className="h-10 w-full bg-gray-100 rounded mt-4" />
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

  const mealTypeLetters = params?.meal_types.map((m) => m[0]).join(", ") || "-";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "sticky top-6 rounded-3xl bg-white border border-gray-100 shadow-xl p-8 transition-all duration-300",
        )}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

        {/* Selection Summary */}
        <div className="space-y-4 pb-6 mb-6 border-b border-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">Duration</span>
            <span className="font-bold text-gray-900">
              {params?.days || "-"} Days
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">Meals per day</span>
            <span className="font-bold text-gray-900">
              {params?.meal_types.length || 0} ({mealTypeLetters})
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">Preference</span>
            <span
              className={cn(
                "font-bold",
                params?.preference === "VEG"
                  ? "text-green-600"
                  : "text-red-600",
              )}
            >
              {params?.preference === "VEG"
                ? "Pure Veg"
                : params?.preference === "NON_VEG"
                  ? "Non-Veg"
                  : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-gray-400 font-medium">Price per meal</span>
              {pricing && pricing.subtotal > 0 && (
                <span className="text-[10px] text-gray-300">
                  Standard rate ₹100
                </span>
              )}
            </div>
            <span className="font-bold text-[#FF6B35]">
              ₹{pricing?.price_per_meal || 0}
            </span>
          </div>
        </div>

        {/* Pricing Breakdown */}
        {isLoading ? (
          <PricingSkeleton />
        ) : error ? (
          <div className="py-4">
            <p className="text-xs text-red-500 text-center">
              Failed to load pricing
            </p>
          </div>
        ) : pricing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-medium">
                Subtotal ({pricing.total_meals} meals)
              </span>
              <span className="font-bold text-gray-900">
                ₹{pricing.subtotal.toLocaleString()}
              </span>
            </div>
            {pricing.bulk_discount.amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">
                  Bulk Discount ({pricing.bulk_discount.percentage}%)
                </span>
                <span className="font-bold text-green-600">
                  - ₹{pricing.bulk_discount.amount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <span className="text-lg font-black text-gray-900">
                Total Pay
              </span>
              <span className="text-2xl font-black text-[#FF6B35]">
                ₹{pricing.total.toLocaleString()}
              </span>
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              disabled={isContinueDisabled || isLoading}
              className={cn(
                "w-full h-14 rounded-2xl font-bold text-white shadow-lg mt-6 text-base group transition-all",
                "bg-[#FF6B35] hover:bg-[#FF8555] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isAuthenticated
                    ? "Continue to Checkout"
                    : "Sign in to Continue"}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-[10px] text-gray-400 text-center mt-4 font-medium italic">
              * Free delivery included. Pause or skip anytime.
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Complete your selections to see pricing
            </p>
          </div>
        )}
      </div>

      {/* Trust Promise */}
      <div className="rounded-2xl bg-orange-50/50 border border-orange-100/50 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#FF6B35]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-black text-gray-900 uppercase tracking-wider">
            Mullai Trust Promise
          </p>
          <p className="text-[10px] text-gray-500 font-medium leading-tight">
            Farm-fresh ingredients & zero MSG.
          </p>
        </div>
      </div>
    </div>
  );
}
