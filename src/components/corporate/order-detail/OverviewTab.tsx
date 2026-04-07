"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { format } from "date-fns";
import { CalendarDays, Calendar, MapPin, CreditCard, CalendarClock } from "lucide-react";
import Image from "next/image";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OverviewTabProps {
  order: ICorporateOrder;
}

const DAY_LABELS: Record<string, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN"
};

// Map day names to their order for sorting
const DAY_ORDER: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7
};

export function OverviewTab({ order }: OverviewTabProps) {
  // Sort days by their order in the week
  const sortedDays = [...order.selected_days].sort((a, b) => (DAY_ORDER[a] || 0) - (DAY_ORDER[b] || 0));

  const getBillingCycleLabel = (days: number): string => {
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    return `Every ${days} days`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Subscription Timeline - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 lg:col-span-2 lg:p-8"
        >
          <div className="flex items-center justify-between mb-8 rounded-xl" >
            <h3 className="text-lg font-medium" style={{ color: '#44151C' }}>Subscription Timeline</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Billing Cycle */}
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">BILLING CYCLE</span>
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
                <CalendarClock className="w-4 h-4" />
                {getBillingCycleLabel(order.billing_cycle_days)}
              </div>
              {order.current_billing_start && (
                <p className="text-xs text-gray-400 mt-2">
                  Current billing period started {format(new Date(order.current_billing_start), "MMM dd, yyyy")}
                </p>
              )}
            </div>

            {/* Delivery Period */}
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">DELIVERY PERIOD</span>
              <p className="text-base font-semibold mb-4" style={{ color: '#44151C' }}>
                {format(new Date(order.start_date), "MMM dd, yyyy")} — {format(new Date(order.end_date), "MMM dd, yyyy")}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold" style={{ color: '#554243' }}>
                <Image
                  src="/images/Container.png"
                  alt="Deliveries"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                {order.total_delivery_days} Scheduled Deliveries
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-4">WEEKLY SCHEDULE</span>
              <div className="flex flex-wrap gap-2">
                {sortedDays.map((day) => (
                  <div key={day} className="flex flex-col items-center">
                    <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold mb-1.5">
                      {DAY_LABELS[day] || day.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {order.meal_types.map((meal) => (
                        <span key={`${day}-${meal}`} className="text-[8px] font-medium text-gray-500 uppercase px-1.5 py-0.5 bg-gray-100 rounded">
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Meal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl p-6 text-white sm:p-8"
          style={{ backgroundColor: '#3A070F' }}
        >
          <h3 className="text-lg font-medium mb-8 text-white">Meal Distribution</h3>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">TOTAL CAPACITY</span>
              <div className="text-5xl font-bold mt-1">{order.headcount}</div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">VEG</span>
                </div>
                <span className="text-xl font-bold">{String(order.veg_count).padStart(2, '0')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">NON-VEG</span>
                </div>
                <span className="text-xl font-bold">{String(order.nonveg_count).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - Delivery Hub and Financial Overview */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Delivery Hub with Map - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white sm:flex-row"
        >
          {/* Map on the left */}
          <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-40 md:w-48">
            <Image
              src="/images/map.png"
              alt="Delivery Location Map"
              fill
              className="object-cover"
            />
          </div>

          {/* Content on the right */}
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold" style={{ color: '#44151C' }}>Delivery Hub</h3>
            </div>
            <p className="text-base font-semibold mb-2" style={{ color: '#554243' }}>{order.outlet_name}</p>
            <p className="text-sm leading-relaxed" style={{ color: '#554243' }}>
              {order.delivery_address.address_line}, {order.delivery_address.area}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
            </p>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-100 p-6 sm:p-8"
          style={{ backgroundColor: '#F2ECED' }}
        >
          <div className="flex items-center gap-2 mb-8">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-medium" style={{ color: '#44151C' }}>Financial Overview</h3>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-semibold text-blue-700 mb-2">
              <CalendarClock className="w-3.5 h-3.5" />
              Billed {getBillingCycleLabel(order.billing_cycle_days)}
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm" style={{ color: '#554243' }}>Proforma Base Amount</span>
              <span className="text-base font-semibold" style={{ color: '#554243' }}>₹ {proformaAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm" style={{ color: '#554243' }}>Modifications</span>
              <span
                className={cn(
                  'text-base font-semibold',
                  order.total_modification_amount > 0 ? 'text-amber-600' : 'text-emerald-600',
                )}
              >
                {order.total_modification_amount > 0 ? '+ ' : ''}₹ {Math.abs(order.total_modification_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--primary))' }}>FINAL PAYABLE</span>
                <p className="text-xs text-gray-400 mt-0.5">For the full subscription period</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>₹ {order.final_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
