"use client";

import { MapPin, Calendar, Users, ShoppingBag, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { PricingBreakdown } from "@/lib/corporate/pricing";

interface OrderSummarySidebarProps {
  deliveryAddress: {
    addressLine: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  schedule: {
    selectedDays: string[];
    mealTypes: string[];
    startDate: string;
    durationWeeks: number;
  } | null;
  headcount: {
    total: number;
    veg: number;
    nonVeg: number;
  } | null;
  pricing: PricingBreakdown;
}

export function OrderSummarySidebar({
  deliveryAddress,
  schedule,
  headcount,
  pricing,
}: OrderSummarySidebarProps) {
  const hasAddress = deliveryAddress && deliveryAddress.addressLine;
  const hasSchedule = schedule && schedule.selectedDays.length > 0;
  const hasHeadcount = headcount && headcount.total > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className="xl:sticky xl:top-6 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#39070F]">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
          Order Summary
        </h3>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Delivery Address */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Delivery Address
          </h4>
          {hasAddress ? (
            <p className="text-sm text-gray-700">
              {deliveryAddress.addressLine}, {deliveryAddress.area}, {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </p>
          ) : (
            <p className="text-sm text-gray-500 flex items-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#39070F]" />
              No location selected. Pin your address on the map to proceed.
            </p>
          )}
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Schedule
          </h4>
          {hasSchedule ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p>{schedule.selectedDays.join(", ")}</p>
              <p>{schedule.mealTypes.join(", ")}</p>
              <p>
                {schedule.startDate && formatDate(schedule.startDate)
                  ? `Starts ${formatDate(schedule.startDate)} · ${schedule.durationWeeks} weeks`
                  : `Duration: ${schedule.durationWeeks} weeks`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Pending next step
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Head Count */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Head Count
          </h4>
          {hasHeadcount ? (
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>Total</span>
                <span>{headcount.total}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Veg Meal</span>
                <span>{headcount.veg}</span>
              </div>
              <div className="flex justify-between text-[#39070F]">
                <span>Non Veg Meal</span>
                <span>{headcount.nonVeg}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Total</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Veg Meal</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-[#39070F]">
                <span>Non Veg Meal</span>
                <span>0</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Pricing Breakdown
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Meals Subtotal</span>
              <span>{formatCurrency(pricing.subtotal - pricing.deliveryTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fees</span>
              <span>{formatCurrency(pricing.deliveryTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes (GST 5%)</span>
              <span>{formatCurrency(pricing.tax)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Estimated Total */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Estimated Total
          </h4>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#39070F]">{formatCurrency(pricing.grandTotal)}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 sm:p-3 flex gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            This is an estimated quote. Final pricing will be confirmed after review.
          </p>
        </div>
      </div>
    </div>
  );
}
