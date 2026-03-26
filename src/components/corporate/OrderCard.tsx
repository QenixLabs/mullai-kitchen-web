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

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

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
  const totalDays = order.total_delivery_days || 1;
  const progress = isActive ? Math.min(100, (elapsed / totalDays) * 100) : 0;

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
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
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div className="flex flex-1 flex-col p-7">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors truncate">
              {order.company_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-mono text-muted-foreground tracking-tighter bg-muted/50 px-2 py-0.5 rounded-md">
                {order.order_id}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/5 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Headcount</p>
              <p className="text-sm font-bold">{order.headcount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gold/10 text-gold-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Days</p>
              <p className="text-sm font-bold">{order.total_delivery_days} Days</p>
            </div>
          </div>
        </div>

        {/* Schedule & Meals Chips */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap gap-1.5">
            {order.selected_days.map((day) => (
              <span key={day} className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight rounded-lg bg-primary/3 text-primary/70 border border-primary/5 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                {DAY_ABBR[day] ?? day.slice(0, 3)}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {order.meal_types.map((meal) => (
              <span key={meal} className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full bg-secondary text-secondary-foreground border border-border shadow-sm group-hover:bg-card transition-colors">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {meal}
              </span>
            ))}
          </div>
        </div>

        {/* Address Summary */}
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground mb-6 bg-muted/20 p-3 rounded-2xl">
          <MapPin className="h-4 w-4 shrink-0 text-primary/40" />
          <span className="truncate">{order.delivery_address.area}, {order.delivery_address.city}</span>
        </div>

        {/* Progress Section */}
        {isActive && (
          <div className="mb-6 p-4 rounded-3xl bg-secondary/30 relative overflow-hidden group/progress">
            <div className="flex items-center justify-between text-[11px] font-bold mb-2">
              <div className="flex items-center gap-1.5 text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>ACTIVE PROGRESS</span>
              </div>
              <span className="text-muted-foreground">{elapsed} / {totalDays} days</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full relative"
              >
                <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-[-20deg] animate-shimmer-slide" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-auto pt-6 border-t border-border/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Total Amount</p>
            <div className="flex items-center gap-1 text-2xl font-black text-primary">
              <IndianRupee className="h-5 w-5" />
              <span>{order.final_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/corporate/orders/${order._id}`}>
              <Button
                variant="default"
                className="h-12 w-12 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
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
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm">
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
