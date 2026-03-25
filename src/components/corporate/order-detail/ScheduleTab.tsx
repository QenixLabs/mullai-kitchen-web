"use client";

import { format, isBefore, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface ScheduleTabProps {
  order: ICorporateOrder;
  deliveryDates: Date[];
  modifiedDatesSet: Set<string>;
  onDateClick: (date: Date) => void;
}

export function ScheduleTab({
  order,
  deliveryDates,
  modifiedDatesSet,
  onDateClick,
}: ScheduleTabProps) {
  if (order.status !== "active") {
    // Read-only summary for completed/cancelled orders
    return (
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
        <div className="p-6 pt-7">
          <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
            <CalendarDays className="h-5 w-5 text-primary" />
            Delivery Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Total Delivery Days
              </div>
              <div className="text-2xl font-bold">
                {order.total_delivery_days}
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Date Range</div>
              <div className="text-sm font-medium">
                {formatDate(order.start_date)} - {formatDate(order.end_date)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Selected Days
              </div>
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {order.selected_days.map((day) => (
                  <Badge key={day} variant="secondary" className="text-xs">
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active order: calendar + upcoming deliveries list
  const today = startOfDay(new Date());
  const upcomingDates = deliveryDates
    .filter((d) => !isBefore(d, today))
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
        <div className="p-6 pt-7">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Delivery Calendar
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a future delivery date to modify meal quantities. Dates
              with modifications are highlighted.
            </p>
          </div>
          <Calendar
            numberOfMonths={1}
            defaultMonth={parseISO(order.start_date)}
            fromMonth={parseISO(order.start_date)}
            toMonth={parseISO(order.end_date)}
            modifiers={{
              deliveryDay: deliveryDates,
              modifiedDay: deliveryDates.filter((d) =>
                modifiedDatesSet.has(format(d, "yyyy-MM-dd"))
              ),
              pastDay: deliveryDates.filter((d) =>
                isBefore(d, startOfDay(new Date()))
              ),
            }}
            modifiersClassNames={{
              deliveryDay:
                "bg-primary/10 text-primary font-bold rounded-md",
              modifiedDay:
                "bg-success/10 text-success font-bold rounded-md ring-2 ring-success/30",
              pastDay: "text-muted-foreground/50 line-through",
            }}
            onDayClick={(date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isDelivery = deliveryDates.some(
                (d) => format(d, "yyyy-MM-dd") === dateStr
              );
              if (isDelivery) {
                onDateClick(date);
              }
            }}
          />
        </div>
      </div>

      {/* Upcoming Deliveries List */}
      {upcomingDates.length > 0 && (
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
          <div className="p-6 pt-7">
            <h3 className="text-lg font-bold mb-4">Upcoming Deliveries</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Day
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Meals
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isModified = modifiedDatesSet.has(dateStr);
                    const dayName = format(date, "EEEE");

                    return (
                      <tr
                        key={dateStr}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <td className="py-3 px-3 font-medium">
                          {formatDate(dateStr)}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {dayName}
                        </td>
                        <td className="py-3 px-3">
                          {order.headcount} meals ({order.veg_count}V +{" "}
                          {order.nonveg_count}NV)
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={isModified ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {isModified ? "Modified" : "Upcoming"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!isModified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => onDateClick(date)}
                            >
                              Modify
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
