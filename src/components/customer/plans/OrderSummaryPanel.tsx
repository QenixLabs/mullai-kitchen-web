"use client";

import { FaSpinner } from "react-icons/fa";

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
  isAuthenticated: _isAuthenticated,
}: OrderSummaryPanelProps) {
  const { data: pricing, isLoading, error } = useCustomPlanPricing(params);

  const mealTypeLetters = params?.meal_types.map((m) => m[0]).join(" + ") || "-";

  const preferenceLabel =
    params?.preference === "VEG"
      ? "Veg Only"
      : params?.preference === "NON_VEG"
        ? "Non-Veg"
        : "-";

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7E0E4] bg-[#F8F4F6] p-5 shadow-[0_10px_26px_rgba(20,15,17,0.08)] lg:sticky lg:top-6">
      <h2
        className="text-[24px] font-bold leading-none text-[#341117]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        Order Summary
      </h2>

      <div className="mt-6">
        <div className="space-y-2.5 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7A6F73]">Duration</span>
            <span className="font-bold text-[#2E1318]">
              {params?.days || "-"} Days
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7A6F73]">Meals per day</span>
            <span className="font-bold text-[#2E1318]">
              {params?.meal_types.length || 0} ({mealTypeLetters})
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7A6F73]">Preference</span>
            <span className="font-bold text-[#2E1318]">{preferenceLabel}</span>
          </div>
        </div>

        {isLoading ? (
          <PricingSkeleton />
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-3 py-3 text-xs text-red-600">Failed to load pricing</div>
        ) : pricing ? (
          <>
            <div className="space-y-2 border-t border-[#E7DEE2] pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#7A6F73]">Subtotal</span>
                <span className="font-semibold text-[#2E1318]">₹{pricing.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#22A35A]">Bulk Discount</span>
                <span className="font-semibold text-[#22A35A]">
                  - ₹{pricing.bulk_discount.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#7A6F73]">Delivery Fee</span>
                <span className="font-semibold text-[#2E1318]">FREE</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#4A0010] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Estimated Total</p>
              <p className="mt-1 text-[40px] font-black leading-none">₹{pricing.total.toLocaleString()}</p>
              <p className="mt-1 text-xs text-white/80">tax incl.</p>
            </div>

            <Button
              onClick={onContinue}
              disabled={isContinueDisabled || isLoading}
              className={cn(
                "mt-4 h-12 w-full rounded-full bg-[#4A0010] text-base font-bold text-white",
                "hover:bg-[#35000B] disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? <FaSpinner className="h-5 w-5 animate-spin" /> : "Proceed to Checkout"}
            </Button>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A2959A]">
              *Free delivery included. Pause or skip anytime.
            </p>
          </>
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
