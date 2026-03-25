"use client";

import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import {
  CalendarDays,
  IndianRupee,
  MoreVertical,
  FileText,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/corporate/PaymentStatusBadge";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OrderCardProps {
  order: ICorporateOrder;
  variant?: "full" | "compact";
}

// Day abbreviation map for 3-letter display
const DAY_ABBR: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function OrderCard({ order, variant = "full" }: OrderCardProps) {
  const isActive = order.status === "active";
  const canCancel =
    order.status === "active" || order.status === "pending_payment";

  // Progress calculation for active orders
  const elapsed = isActive
    ? Math.max(0, differenceInDays(new Date(), parseISO(order.start_date)))
    : 0;
  const progress = isActive
    ? Math.min(100, (elapsed / (order.total_delivery_days || 1)) * 100)
    : 0;

  if (variant === "compact") {
    return (
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
        <div className="p-4 pt-5">
          <div className="flex items-center gap-4">
            {/* Order ID */}
            <div className="min-w-0 flex-shrink-0">
              <p className="font-semibold text-sm truncate">{order.order_id}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Days */}
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              {order.selected_days.map((day) => (
                <span
                  key={day}
                  className="text-xs bg-muted rounded-md px-1.5 py-0.5 text-muted-foreground"
                >
                  {DAY_ABBR[day] ?? day.slice(0, 3)}
                </span>
              ))}
            </div>

            {/* Progress bar (if active) */}
            {isActive && (
              <div className="hidden sm:flex flex-1 items-center gap-2 min-w-0">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {elapsed}/{order.total_delivery_days}
                </span>
              </div>
            )}

            {/* Amount */}
            <div className="flex-shrink-0 font-semibold text-sm flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" />
              {order.final_amount.toLocaleString("en-IN")}
            </div>

            {/* View button */}
            <Link href={`/corporate/orders/${order._id}`}>
              <Button variant="outline" size="sm" className="rounded-lg gap-1">
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="p-6 pt-7">
        {/* Top row: Order ID + badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-semibold text-lg truncate">{order.order_id}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Schedule summary */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {order.selected_days.map((day) => (
            <Badge key={day} variant="secondary" className="text-xs">
              {DAY_ABBR[day] ?? day.slice(0, 3)}
            </Badge>
          ))}
          {order.meal_types.map((meal) => (
            <Badge key={meal} variant="outline" className="text-xs">
              {meal}
            </Badge>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <CalendarDays className="h-4 w-4 flex-shrink-0" />
          <span>
            {formatDate(order.start_date)} - {formatDate(order.end_date)}
          </span>
        </div>

        {/* Progress bar for active orders */}
        {isActive && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>
                {elapsed} / {order.total_delivery_days} days
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-center gap-1.5 text-xl font-bold text-primary mb-5">
          <IndianRupee className="h-5 w-5" />
          {order.final_amount.toLocaleString("en-IN")}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Link href={`/corporate/orders/${order._id}`}>
            <Button
              variant="outline"
              className="gap-2 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Order actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href={`/corporate/orders/${order._id}?tab=invoices`}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Link>
              </DropdownMenuItem>
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="text-destructive focus:text-destructive"
                  >
                    <Link
                      href={`/corporate/orders/${order._id}?tab=overview`}
                      className="cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Order
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for OrderCard in "full" variant.
 */
export function OrderCardSkeleton() {
  return (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
      <div className="p-6 pt-7 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-7 w-28" />
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
