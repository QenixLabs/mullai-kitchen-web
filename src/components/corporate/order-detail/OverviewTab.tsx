import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  IndianRupee,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Store,
  CalendarRange,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OverviewTabProps {
  order: ICorporateOrder;
}

const DAY_LABELS: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
  Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
};

export function OverviewTab({ order }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <CalendarRange className="w-48 h-48 rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarRange className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">Subscription Timeline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Delivery Period
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-bold">From</span>
                    <span className="text-lg font-black">{formatDate(order.start_date)}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 mt-4" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-bold">To</span>
                    <span className="text-lg font-black">{formatDate(order.end_date)}</span>
                  </div>
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-sm font-bold">
                  {order.total_delivery_days} Scheduled Deliveries
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <Clock className="h-3.5 w-3.5" />
                  Weekly Schedule
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.selected_days.map((day) => (
                    <div key={day} className="px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-black uppercase border border-border/50">
                      {DAY_LABELS[day] ?? day.slice(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {order.meal_types.map((meal) => (
                    <div key={meal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-xs font-black uppercase border border-primary/10">
                      <Utensils className="w-3 h-3" />
                      {meal}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Headcount Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-4xl bg-linear-to-br from-primary to-primary/90 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Users className="w-40 h-40" />
          </div>
          
          <h3 className="text-xl font-black mb-8 opacity-90">Meal Distribution</h3>
          
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Total Capacity</span>
                <div className="text-4xl font-black mt-1">{order.headcount}</div>
              </div>
              <Users className="w-8 h-8 opacity-40 mb-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Veg</span>
                <div className="text-2xl font-black mt-1">{order.veg_count}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Non-Veg</span>
                <div className="text-2xl font-black mt-1">{order.nonveg_count}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Location Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Delivery Hub</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-secondary/50 border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-sm font-black">{order.outlet_name}</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Primary kitchen responsible for fulfilling all scheduled meals for this corporate partner.
              </p>
            </div>
            <div className="px-1 space-y-2">
              <p className="text-sm font-black leading-tight">
                {order.delivery_address.address_line}
              </p>
              <p className="text-xs text-muted-foreground font-bold">
                {order.delivery_address.area}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-8 rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Financial Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-secondary/30 border border-border/40 hover:border-primary/20 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Proforma Base</span>
              <div className="text-2xl font-black flex items-center gap-1">
                <span className="text-sm">₹</span>
                {order.proforma_amount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-500/3 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-2 block">Credits/Reductions</span>
              <div className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                <span className="text-sm">- ₹</span>
                {order.total_reduction_amount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 block">Final Payable</span>
              <div className="text-3xl font-black text-primary flex items-center gap-1">
                <span className="text-base">₹</span>
                {order.final_amount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

