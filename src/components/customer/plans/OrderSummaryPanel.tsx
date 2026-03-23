"use client";

import { FaArrowRight, FaCheck, FaSpinner, FaShieldAlt } from "react-icons/fa";
import { BadgePercent } from "lucide-react";

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

  const mealTypeLetters = params?.meal_types.map((m) => m[0]).join("") || "-";

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <h2
          className="text-xl font-bold text-[#39070F]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Order Summary
        </h2>
      </div>

      <div className="p-5">
        {/* Selection Summary */}
        <div className="space-y-3 pb-5 mb-5 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-semibold text-[#39070F]">
              {params?.days || "-"} Days
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Meals per day</span>
            <span className="font-semibold text-[#39070F]">
              {params?.meal_types.length || 0}({mealTypeLetters})
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Preference</span>
            <span
              className={cn(
                "font-semibold flex items-center gap-1.5",
                params?.preference === "VEG"
                  ? "text-emerald-600"
                  : "text-red-600",
              )}
            >
              {params?.preference && (
                <span
                  className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border-2",
                    params?.preference === "VEG"
                      ? "border-emerald-500 bg-white"
                      : "border-red-500 bg-white",
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    params?.preference === "VEG" ? "bg-emerald-500" : "bg-red-500"
                  )} />
                </span>
              )}
              {params?.preference === "VEG"
                ? "Veg"
                : params?.preference === "NON_VEG"
                  ? "Non-veg"
                  : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500">Price per meal</span>
              {pricing && pricing.subtotal > 0 && (
                <span className="text-xs text-gray-400">
                  Standard rate ₹100
                </span>
              )}
            </div>
            <span className="font-semibold text-[#39070F]">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Subtotal ({pricing.total_meals} meals)
              </span>
              <span className="font-semibold text-[#39070F]">
                ₹{pricing.subtotal.toLocaleString()}
              </span>
            </div>
            {pricing.bulk_discount.amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <BadgePercent className="w-4 h-4" />
                  Bulk Discount ({pricing.bulk_discount.percentage}%)
                </span>
                <span className="font-semibold text-emerald-600">
                  - ₹{pricing.bulk_discount.amount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
              <span
                className="text-lg font-bold text-[#39070F]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Total Pay
              </span>
              <span
                className="text-3xl font-bold text-[#39070F]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                ₹{pricing.total.toLocaleString()}
              </span>
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              disabled={isContinueDisabled || isLoading}
              className={cn(
                "w-full h-12 rounded-lg font-semibold text-white mt-5 text-sm group transition-all",
                "bg-[#39070F] hover:bg-[#5a1c28] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Proceed to Checkout
                  <FaArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-xs text-gray-400 text-center mt-3">
              *Free delivery included. Pause or skip anytime.
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-400">
              Complete your selections to see pricing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
