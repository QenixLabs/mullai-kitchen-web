"use client";

import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { IndianRupee, ArrowRight, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/corporate/PaymentStatusBadge";
import type { ICorporateOrder } from "@/api/types/corporate.types";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: ICorporateOrder;
  variant?: "full" | "compact";
}

export function OrderCard({ order, variant = "full" }: OrderCardProps) {
  const isActive = order.status === "active";

  // Progress calculation for active orders
  const elapsed = isActive
    ? Math.max(0, differenceInDays(new Date(), parseISO(order.start_date)))
    : 0;
  const totalDays = order.total_delivery_days || 1;

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="group relative flex items-center gap-4 p-4 bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
              {order.company_name}
            </h4>
            <OrderStatusBadge status={order.status} className="scale-90" />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
            {order.order_id}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount</span>
            <div className="flex items-center gap-0.5 font-black text-primary">
              <IndianRupee className="h-3 w-3" />
              <span>{order.final_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-1 flex-col p-6">
        {/* Status Badges - Top */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isActive ? "bg-[#00990F]" : "bg-gray-300"
            )} />
            <span className={cn(
              "text-xs font-semibold tracking-wide",
              isActive ? "text-[#00990F]" : "text-gray-500"
            )}>
              {isActive ? "ACTIVE" : order.status === "completed" ? "COMPLETED" : order.status === "cancelled" ? "CANCELLED" : "DRAFT"}
            </span>
          </div>
          <PaymentStatusBadge status={order.payment_status} />
        </div>

        {/* Order ID and Company Name */}
        <div className="mb-6">
          <p className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{order.order_id}</p>
          <h3 className="text-base font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>
            {order.company_name}
          </h3>
        </div>

        {/* Info Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
          {/* Headcount */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">HEADCOUNT</p>
            <p className="text-base font-semibold text-[#554243]">{order.headcount} People</p>
          </div>

          {/* Meal Mix */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">MEAL MIX</p>
            <p className="text-base font-semibold text-[#554243]">{order.meal_types.join(" & ")}</p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">DURATION</p>
            <p className="text-base font-semibold text-[#554243] truncate">
              {order.selected_days.slice(0, 2).join(", ")}
              {order.selected_days.length > 2 && "..."}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">STATUS</p>
            <p className="text-base font-semibold text-[#554243]">
              {order.status === "active" ? "In Progress" :
               order.status === "pending_payment" ? "Pending Payment" :
               order.status === "completed" ? "Completed" : "Draft"}
            </p>
          </div>

          {/* Active Progress */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">ACTIVE PROGRESS</p>
            <p className="text-base font-semibold text-[#554243]">{elapsed}/{totalDays} Days</p>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">LOCATION</p>
            <p className="text-base font-semibold text-[#554243] truncate">{order.delivery_address.area}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2" />

        {/* Footer - Total and Arrow */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">TOTAL</p>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5" />
              <span>{order.final_amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Link href={`/corporate/orders/${order._id}`}>
            <button className="h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Skeleton loader for OrderCard in "full" variant.
 */
export function OrderCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden bg-card border border-border shadow-sm">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-32 rounded-lg" />
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
        <Skeleton className="h-4 w-52 rounded-lg" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-7 w-28 rounded-lg" />
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
