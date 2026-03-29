"use client";

import { useState } from "react";
import {
  format,
  isBefore,
  startOfDay,
  parseISO,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface ScheduleTabProps {
  order: ICorporateOrder;
  deliveryDates: Date[];
  modifiedDatesSet: Set<string>;
  onDateClick: (date: Date) => void;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function ScheduleTab({
  order,
  deliveryDates,
  modifiedDatesSet,
  onDateClick,
}: ScheduleTabProps) {
  const isInactive = order.status !== "active";
  const [currentMonth, setCurrentMonth] = useState(() =>
    parseISO(order.start_date)
  );

  const today = startOfDay(new Date());

  // Get upcoming 5 delivery dates
  const upcomingDates = deliveryDates
    .filter((d) => !isBefore(d, today))
    .slice(0, 5);

  // Generate calendar weeks
  const calendarWeeks = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Start from the Sunday of the week containing the first day
    const start = new Date(firstDayOfMonth);
    start.setDate(start.getDate() - start.getDay());

    const weeks: Date[][] = [];
    let current = new Date(start);

    // Generate 6 weeks to ensure we cover the full month
    while (weeks.length < 6) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);

      // Stop if we've passed the end of the month and have at least 4 weeks
      if (current > lastDayOfMonth && weeks.length >= 4) {
        // Only add this week if it contains days from the current month
        if (week.some((day) => isSameMonth(day, currentMonth))) {
          continue;
        }
        break;
      }
    }
    return weeks;
  })();

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isDeliveryDate = (date: Date) =>
    deliveryDates.some((d) => isSameDate(d, date));

  const isModifiedDate = (date: Date) =>
    modifiedDatesSet.has(format(date, "yyyy-MM-dd"));

  const isPastDate = (date: Date) => isBefore(startOfDay(date), today);

  // Historical view for inactive orders
  if (isInactive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-2 p-8 rounded-2xl bg-white border border-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Historical Delivery Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-muted/30 border border-border">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Total Deliveries Fulfilled
              </span>
              <div className="text-3xl font-bold text-foreground">
                {order.total_delivery_days}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-muted/30 border border-border">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Service Cycle
              </span>
              <div className="text-sm font-medium text-foreground">
                {format(parseISO(order.start_date), "MMM dd, yyyy")} —{" "}
                {format(parseISO(order.end_date), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-4 text-foreground">
            Active Schedule
          </h3>
          <div className="flex flex-wrap gap-2">
            {order.selected_days.map((day) => (
              <div
                key={day}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase"
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            This order is currently {order.status}. Modification of previous
            schedules is not available.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Smart Calendar - Left Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-7 space-y-6"
      >
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-primary">Smart Calendar</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(currentMonth, "MMMM yyyy")} Delivery Schedule
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-4">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {calendarWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((dayDate, dayIdx) => {
                  const inMonth = isSameMonth(dayDate, currentMonth);
                  const delivery = isDeliveryDate(dayDate);
                  const modified = isModifiedDate(dayDate);
                  const past = isPastDate(dayDate);
                  const isToday = isSameDate(dayDate, today);

                  // Highlight the 13th as selected (demo) or today
                  const isSelected = dayDate.getDate() === 13 && inMonth;

                  return (
                    <button
                      key={dayIdx}
                      type="button"
                      disabled={past || !delivery}
                      onClick={() => {
                        if (delivery && !past) onDateClick(dayDate);
                      }}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-xl transition-all",
                        !inMonth && "opacity-0 pointer-events-none",
                        inMonth &&
                          !past &&
                          !delivery &&
                          "text-muted-foreground/50 cursor-default",
                        inMonth &&
                          past &&
                          !isToday &&
                          "text-muted-foreground/40 cursor-not-allowed",
                        inMonth &&
                          delivery &&
                          !past &&
                          !isSelected &&
                          "cursor-pointer hover:bg-muted",
                        isToday &&
                          !isSelected &&
                          "bg-primary text-primary-foreground font-semibold",
                        isSelected &&
                          "bg-primary text-primary-foreground font-semibold shadow-md"
                      )}
                    >
                      <span className="text-sm">{dayDate.getDate()}</span>
                      {delivery && inMonth && (
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1",
                            isSelected || isToday
                              ? "bg-primary-foreground"
                              : modified
                                ? "bg-green-500"
                                : "bg-primary"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Standard Delivery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Modified Run
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                No Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="p-5 rounded-xl bg-muted/50 border border-border flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
              Quick Tip
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Future delivery counts can be adjusted until midnight of the
              previous day. Changes after this window may incur a surcharge.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next 5 Runs - Right Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="xl:col-span-5"
      >
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-border shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-primary uppercase tracking-wide">
              Next 5 Runs
            </h3>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-border text-xs font-semibold uppercase tracking-wide text-foreground bg-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>
          </div>

          {/* Run Cards */}
          <div className="space-y-6">
            <AnimatePresence>
              {upcomingDates.map((date, index) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isModified = modifiedDatesSet.has(dateStr);
                const dayName = format(date, "EEEE").toUpperCase();
                const monthDay = format(date, "MMMM d");
                const vegCount = order.veg_count ?? 0;
                const nonVegCount = order.nonveg_count ?? 0;
                const totalMeals = vegCount + nonVegCount;

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative p-5 rounded-xl border border-border bg-white hover:border-primary/30 transition-all"
                  >
                    {/* Modified Badge */}
                    {isModified && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider rounded">
                          Modified
                        </span>
                      </div>
                    )}

                    {/* Date and Total */}
                    <div className="flex justify-between items-start mb-4 pr-20">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#3D000C' }}>
                          {dayName}
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#3D000C' }}>
                          {monthDay}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: '#3D000C' }}>
                          {totalMeals}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#3D000C' }}>
                          Total Meals
                        </p>
                      </div>
                    </div>

                    {/* Meal Split */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-[#F8F2F3]">
                        <p className="text-[11px] mb-1" style={{ color: '#3D000C' }}>
                          Vegetarian
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#3D000C' }}>
                          {String(vegCount).padStart(2, "0")}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F8F2F3]">
                        <p className="text-[11px] mb-1" style={{ color: '#3D000C' }}>
                          Non-Veg
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#3D000C' }}>
                          {String(nonVegCount).padStart(2, "0")}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isModified ? (
                      <Button
                        variant="outline"
                        onClick={() => onDateClick(date)}
                        className="w-full h-10 rounded-lg border border-border bg-white text-xs font-semibold uppercase tracking-wide hover:bg-gray-50 transition-all"
                        style={{ color: '#3D000C' }}
                      >
                        Edit Meal Split
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onDateClick(date)}
                        className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide hover:bg-primary/90 transition-all"
                      >
                        Review Modification
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {upcomingDates.length === 0 && (
              <div className="p-12 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">
                  No upcoming deliveries found for this service cycle.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
