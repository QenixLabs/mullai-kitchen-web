"use client";

import { MapPin, Calendar, ShoppingBag, AlertCircle, Loader2, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import type { ICorporatePricingResponse } from "@/api/types/corporate.types";

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
    endDate: string | undefined;
    billingCycleDays?: number;
  } | null;
  headcount: {
    total: number;
    veg: number;
    nonVeg: number;
  } | null;
  pricing: ICorporatePricingResponse;
  isLoading?: boolean;
  error?: Error | null;
}

export function OrderSummarySidebar({
  deliveryAddress,
  schedule,
  headcount,
  pricing,
  isLoading,
  error,
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

  const mealsSubtotal = pricing.veg_amount + pricing.nonveg_amount;

  const getBillingCycleLabel = (days?: number): string | null => {
    if (!days) return null;
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    return `${days} days`;
  };

  const billingCycleLabel = getBillingCycleLabel(schedule?.billingCycleDays);

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
                {(() => {
                  const start = schedule.startDate ? formatDate(schedule.startDate) : null;
                  const end = schedule.endDate ? formatDate(schedule.endDate) : null;
                  if (start && end) return `Starts ${start} · Ends ${end}`;
                  if (start) return `Starts ${start} · Ongoing`;
                  if (end) return `Ends ${end}`;
                  return '';
                })()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Pending next step
            </p>
          )}
        </div>

        {/* Billing Cycle */}
        {billingCycleLabel && (
          <>
            <div className="border-t border-gray-100" />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Billing
              </h4>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
                <CalendarClock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Will be billed every <strong>{billingCycleLabel}</strong>
                </p>
              </div>
            </div>
          </>
        )}

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

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating pricing...
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 text-sm text-red-600 py-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Unable to load pricing. Please check your selections.</span>
            </div>
          ) : pricing.grand_total > 0 ? (
            <div className="text-sm space-y-1">
              {pricing.veg_meals > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Veg Meals ({pricing.veg_meals} × ₹{pricing.veg_price_per_meal})</span>
                  <span>{formatCurrency(pricing.veg_amount)}</span>
                </div>
              )}
              {pricing.nonveg_meals > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Non-Veg Meals ({pricing.nonveg_meals} × ₹{pricing.nonveg_price_per_meal})</span>
                  <span>{formatCurrency(pricing.nonveg_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Meals Subtotal</span>
                <span>{formatCurrency(mealsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({pricing.total_delivery_days} days × ₹{pricing.delivery_charge_per_day})</span>
                <span>{formatCurrency(pricing.delivery_total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes (GST {(pricing.tax_rate).toFixed(0)}%)</span>
                <span>{formatCurrency(pricing.tax)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">
              Complete all steps to see pricing.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Estimated Total */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {billingCycleLabel
              ? `Estimated per ${billingCycleLabel.toLowerCase()} cost`
              : 'Estimated Total'}
          </h4>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#39070F]">
              {formatCurrency(pricing.grand_total)}
            </span>
            {pricing.total_delivery_days > 0 && (
              <span className="text-xs text-gray-400">
                ({pricing.total_delivery_days} delivery days{schedule?.billingCycleDays ? ` / ${schedule.billingCycleDays}-day cycle` : ''})
              </span>
            )}
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
