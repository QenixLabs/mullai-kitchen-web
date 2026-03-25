"use client";

import { format } from "date-fns";
import { ClipboardCheck, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DAYS_OF_WEEK, MEAL_TYPES } from "./ScheduleSection";
import {
  DEFAULT_VEG_PRICE,
  DEFAULT_NONVEG_PRICE,
  DEFAULT_DELIVERY_CHARGE,
  DEFAULT_TAX_RATE,
  type PricingBreakdown,
} from "@/lib/corporate/pricing";

export interface OrderSummaryProps {
  selectedDays: string[];
  mealTypes: string[];
  startDate: string;
  endDate: string | null;
  totalDeliveryDays: number;
  durationWeeks: number;
  headcount: number;
  vegCount: number;
  nonvegCount: number;
  addressLine: string;
  area: string;
  outletName?: string;
  pricing: PricingBreakdown;
}

export function OrderSummary({
  selectedDays,
  mealTypes,
  startDate,
  endDate,
  totalDeliveryDays,
  durationWeeks,
  headcount,
  vegCount,
  nonvegCount,
  addressLine,
  area,
  outletName,
  pricing,
}: OrderSummaryProps) {
  const filteredDays = DAYS_OF_WEEK.filter((d) =>
    selectedDays.includes(d.value),
  );
  const filteredMeals = MEAL_TYPES.filter((m) =>
    mealTypes.includes(m.value),
  );

  return (
    <div className="lg:sticky lg:top-8 lg:self-start">
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
        <div className="p-6 pt-7 space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Order Summary
          </h2>

          {/* Schedule */}
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Days: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {filteredDays.length > 0 ? (
                    filteredDays.map((d) => (
                      <Badge key={d.value} variant="secondary" className="text-xs">
                        {d.label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      No days selected
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Meals: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {filteredMeals.length > 0 ? (
                    filteredMeals.map((m) => (
                      <Badge key={m.value} variant="secondary" className="text-xs">
                        {m.label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      No meals selected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium">
                  {startDate
                    ? format(new Date(startDate), "MMM dd, yyyy")
                    : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">End</span>
                <span className="font-medium">
                  {endDate
                    ? format(new Date(endDate), "MMM dd, yyyy")
                    : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {durationWeeks} {durationWeeks === 1 ? "week" : "weeks"} (
                  {totalDeliveryDays} delivery days)
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Headcount */}
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Headcount
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{headcount}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="bg-success/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-success">{vegCount}</div>
                <div className="text-success">Veg</div>
              </div>
              <div className="bg-warning/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-warning">
                  {nonvegCount}
                </div>
                <div className="text-warning">Non-veg</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Summary */}
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Delivery Address
            </h3>
            <div className="text-sm space-y-1">
              {addressLine && (
                <p className="font-medium">{addressLine}</p>
              )}
              {area && (
                <p className="text-muted-foreground">{area}</p>
              )}
              {outletName && (
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary">{outletName}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Pricing Breakdown
            </h3>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Veg meals ({vegCount} x {mealTypes.length} meals x{" "}
                  {totalDeliveryDays} days x Rs.{DEFAULT_VEG_PRICE})
                </span>
                <span className="font-medium">
                  <IndianRupee className="h-3 w-3 inline" />
                  {pricing.vegAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Non-veg meals ({nonvegCount} x {mealTypes.length} meals x{" "}
                  {totalDeliveryDays} days x Rs.{DEFAULT_NONVEG_PRICE})
                </span>
                <span className="font-medium">
                  <IndianRupee className="h-3 w-3 inline" />
                  {pricing.nonvegAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Delivery charges ({totalDeliveryDays} days x Rs.
                  {DEFAULT_DELIVERY_CHARGE})
                </span>
                <span className="font-medium">
                  <IndianRupee className="h-3 w-3 inline" />
                  {pricing.deliveryTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  <IndianRupee className="h-3 w-3 inline" />
                  {pricing.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax (GST {(DEFAULT_TAX_RATE * 100).toFixed(0)}%)
                </span>
                <span className="font-medium">
                  <IndianRupee className="h-3 w-3 inline" />
                  {pricing.tax.toLocaleString("en-IN")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-primary">
                  <IndianRupee className="h-4 w-4 inline" />
                  {pricing.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Final pricing will be confirmed by the kitchen. This is an
              estimated amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
