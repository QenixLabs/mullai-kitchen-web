"use client";

import {
  IndianRupee,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OverviewTabProps {
  order: ICorporateOrder;
}

export function OverviewTab({ order }: OverviewTabProps) {
  return (
    <div className="relative rounded-2xl bg-card border border-border shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-bold mb-6">Order Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          {/* Date Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Date Range
            </div>
            <p className="font-medium">
              {formatDate(order.start_date)} - {formatDate(order.end_date)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.total_delivery_days} delivery days
            </p>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Schedule
            </div>
            <div className="flex flex-wrap gap-1">
              {order.selected_days.map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day.slice(0, 3)}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {order.meal_types.map((meal) => (
                <Badge key={meal} variant="outline" className="text-xs">
                  {meal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Quantity
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{order.headcount}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {order.veg_count}
                </div>
                <div className="text-xs text-muted-foreground">Veg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {order.nonveg_count}
                </div>
                <div className="text-xs text-muted-foreground">Non-veg</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          {/* Delivery Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </div>
            <p className="text-sm font-medium">
              {order.delivery_address.address_line}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.delivery_address.area}, {order.delivery_address.city},{" "}
              {order.delivery_address.state} - {order.delivery_address.pincode}
            </p>
          </div>

          {/* Outlet Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4" />
              Outlet
            </div>
            <p className="font-medium">{order.outlet_name}</p>
          </div>
        </div>

        {/* Full-width Pricing Row */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <IndianRupee className="h-4 w-4" />
            Pricing
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Proforma Amount
              </div>
              <div className="text-lg font-bold flex items-center justify-center gap-0.5">
                <IndianRupee className="h-3 w-3" />
                {order.proforma_amount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-success/5 rounded-xl p-4 text-center">
              <div className="text-sm text-success mb-1">Reductions</div>
              <div className="text-lg font-bold text-success flex items-center justify-center gap-0.5">
                - <IndianRupee className="h-3 w-3" />
                {order.total_reduction_amount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 text-center">
              <div className="text-sm text-primary/80 mb-1">Final Amount</div>
              <div className="text-lg font-bold text-primary flex items-center justify-center gap-0.5">
                <IndianRupee className="h-3 w-3" />
                {order.final_amount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
