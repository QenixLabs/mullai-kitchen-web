"use client";

import { motion, AnimatePresence } from "motion/react";
import { 
  IndianRupee, 
  History, 
  Search, 
  Filter, 
  TrendingDown, 
  Utensils, 
  LucideLayoutList,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrderModification } from "@/api/types/corporate.types";

interface ModificationsTabProps {
  modifications: ICorporateOrderModification[];
}

export function ModificationsTab({ modifications }: ModificationsTabProps) {
  const totalCredit = modifications.reduce(
    (sum, mod) => sum + mod.credit_amount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">History Log</h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">
              Detailed tracking of all meal adjustments and credit settlements.
            </p>
          </div>
        </div>

        {modifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 px-8 py-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-emerald-600/60 tracking-widest mb-1">Lifetime Savings</span>
              <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
                 <span className="text-sm">₹</span>
                 {totalCredit.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="w-px h-10 bg-emerald-500/20" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-emerald-600/60 tracking-widest mb-1">Adjustments</span>
              <div className="text-2xl font-black text-emerald-600">
                 {modifications.length}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {modifications.length > 0 ? (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30 border-b border-border/40">
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Execution Date</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Net Veg</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Net Non-Veg</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">Credit Gain</th>
                  <th className="text-right px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Status</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Adjustment Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <AnimatePresence>
                  {modifications.map((mod, index) => (
                    <motion.tr 
                      key={mod._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <CalendarDays className="w-4 h-4 text-primary/40" />
                            <span className="text-sm font-black text-foreground/80">{formatDate(mod.modification_date)}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600">
                        <span className="text-xs mr-0.5">↓</span>
                        {mod.veg_reduction}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-orange-600">
                        <span className="text-xs mr-0.5">↓</span>
                        {mod.nonveg_reduction}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm font-black ring-1 ring-emerald-500/20">
                          <span className="text-[10px]">₹</span>
                          {mod.credit_amount.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Badge
                          className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            mod.status === "approved" 
                              ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                              : mod.status === "rejected"
                                ? "bg-rose-500/5 text-rose-600 border-rose-500/10"
                                : "bg-neutral-500/5 text-neutral-600 border-neutral-500/10"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                             {mod.status === "approved" && <CheckCircle2 className="w-2.5 h-2.5" />}
                             {mod.status === "rejected" && <XCircle className="w-2.5 h-2.5" />}
                             {mod.status === "pending" && <Clock className="w-2.5 h-2.5" />}
                             {mod.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-xs font-bold text-muted-foreground italic truncate max-w-[150px]">
                            {mod.reason || "No comment provided"}
                         </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="p-20 rounded-4xl bg-secondary/20 border-2 border-dashed border-border/40 text-center">
          <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm font-bold text-muted-foreground">The history of modifications is currently empty.</p>
        </div>
      )}
    </div>
  );
}
