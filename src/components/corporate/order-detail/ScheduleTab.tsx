"use client";

import { format, isBefore, startOfDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { 
  CalendarDays, 
  Settings2, 
  CalendarCheck2, 
  Clock, 
  AlertCircle,
  Truck,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface ScheduleTabProps {
  order: ICorporateOrder;
  deliveryDates: Date[];
  modifiedDatesSet: Set<string>;
  onDateClick: (date: Date) => void;
}

const DAY_LABELS: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
  Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
};

export function ScheduleTab({
  order,
  deliveryDates,
  modifiedDatesSet,
  onDateClick,
}: ScheduleTabProps) {
  const isInactive = order.status !== "active";

  if (isInactive) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-2 p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Truck className="w-48 h-48 rotate-12" />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black">Historical Delivery Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl bg-secondary/30 border border-border/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Total Deliveries Fulfiilled</span>
              <div className="text-3xl font-black">{order.total_delivery_days}</div>
            </div>
            <div className="p-6 rounded-3xl bg-secondary/30 border border-border/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Service Cycle</span>
              <div className="text-sm font-bold mt-1">
                {formatDate(order.start_date)} — {formatDate(order.end_date)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-4xl bg-primary/5 border border-primary/20 flex flex-col justify-center">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Active Schedule
          </h3>
          <div className="flex flex-wrap gap-2">
            {order.selected_days.map((day) => (
              <div key={day} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-tight">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-bold mt-6 leading-relaxed">
            This order is currently {order.status}. Modification of previous schedules is not available.
          </p>
        </div>
      </motion.div>
    );
  }

  const today = startOfDay(new Date());
  const upcomingDates = deliveryDates
    .filter((d) => !isBefore(d, today))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Area */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-12 xl:col-span-5 space-y-6"
      >
        <div className="p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Smart Calendar</h2>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-success/40" />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Calendar
              numberOfMonths={1}
              defaultMonth={parseISO(order.start_date)}
              fromMonth={parseISO(order.start_date)}
              toMonth={parseISO(order.end_date)}
              className="p-0 border-0 pointer-events-auto"
              classNames={{
                month: "space-y-6",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-black uppercase tracking-[0.2em] text-primary",
                nav_button: "h-8 w-8 bg-secondary/50 hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-colors border border-border/50",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                head_row: "flex w-full justify-between mt-2",
                head_cell: "text-muted-foreground/40 w-10 font-black text-[10px] uppercase",
                row: "flex w-full justify-between mt-2",
                cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-10 w-10 p-0 font-bold transition-all rounded-xl hover:bg-primary/10 hover:text-primary flex items-center justify-center cursor-pointer",
                day_today: "bg-secondary text-primary border-2 border-primary/20",
                day_outside: "text-muted-foreground/20 opacity-50 cursor-default",
              }}
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
                deliveryDay: "bg-primary/5 text-primary font-black ring-1 ring-primary/10 shadow-sm",
                modifiedDay: "bg-success/5 text-success font-black ring-2 ring-success/30 ring-inset",
                pastDay: "opacity-40 grayscale pointer-events-none cursor-not-allowed line-through scale-90",
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

          <div className="mt-10 grid grid-cols-2 gap-3 pt-8 border-t border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-primary/20 ring-1 ring-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Standard Delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-success/20 ring-2 ring-success/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modified Order</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="w-3 h-3 rounded-full bg-muted/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Past / Non-Delivery</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gold/5 border border-gold/20 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <p className="text-xs font-bold text-gold/80 leading-relaxed italic">
            "Quick Tip: Future delivery counts can be adjusted until midnight of the previous day. Select any future delivery day above to begin."
          </p>
        </div>
      </motion.div>

      {/* Upcoming Deliveries Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-12 xl:col-span-7 space-y-6"
      >
        <div className="p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Upcoming Window</h3>
            </div>
            <div className="text-[10px] font-black px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest">
              Next 5 Runs
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {upcomingDates.map((date, index) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isModified = modifiedDatesSet.has(dateStr);
                const dayName = format(date, "EEEE");

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group relative p-5 rounded-3xl border transition-all duration-300",
                      isModified 
                        ? "bg-emerald-500/3 border-emerald-500/10" 
                        : "bg-secondary/40 border-border/40 hover:border-primary/20"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-colors",
                          isModified 
                            ? "bg-white border-emerald-500/20 text-emerald-600" 
                            : "bg-white border-border/50 text-foreground"
                        )}>
                          <span className="text-[10px] font-black uppercase leading-none mb-0.5">{format(date, "MMM")}</span>
                          <span className="text-lg font-black leading-none">{format(date, "dd")}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black flex items-center gap-2">
                            {dayName}
                            {isModified && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                <CalendarCheck2 className="w-2.5 h-2.5" />
                                Adjusted
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                            Allocation: <span className="text-foreground">{order.headcount} Total Meals</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                           <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
                              <span className="text-[10px] font-bold text-muted-foreground">V: {order.veg_count}</span>
                           </div>
                           <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-orange-500/40" />
                              <span className="text-[10px] font-bold text-muted-foreground">NV: {order.nonveg_count}</span>
                           </div>
                        </div>

                        {!isModified ? (
                          <Button 
                            onClick={() => onDateClick(date)}
                            className="bg-primary text-white hover:bg-primary/90 font-black text-xs h-10 px-6 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all group-hover:px-8"
                          >
                            <Settings2 className="w-4 h-4" />
                            <span className="hidden sm:inline ml-2">Edit Meal Split</span>
                            <ArrowRight className="w-4 h-4 ml-1 sm:ml-2 sm:hidden lg:inline" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest h-10 px-4">
                             <AlertCircle className="w-4 h-4" />
                             Locked for Review
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {upcomingDates.length === 0 && (
              <div className="p-12 rounded-4xl bg-secondary/20 border-2 border-dashed border-border/40 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-muted-foreground">No upcoming deliveries found for this service cycle.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
