"use client";

import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Sparkles,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ICorporateOrder } from "@/api/types/corporate.types";

export function computeModification(
  vegChange: number,
  nonvegChange: number,
  vegPrice: number,
  nonvegPrice: number,
  mealTypesCount: number,
): number {
  return (
    vegChange * vegPrice * mealTypesCount +
    nonvegChange * nonvegPrice * mealTypesCount
  );
}

interface ModifyMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ICorporateOrder;
  selectedDate: Date | null;
  vegChange: number;
  nonvegChange: number;
  reason: string;
  onVegChangeChange: (val: number) => void;
  onNonvegChangeChange: (val: number) => void;
  onReasonChange: (val: string) => void;
  onTotalChangeChange: (total: number) => void;
  onSubmit: () => void;
  isPending: boolean;
  modificationAmount: number;
}

// Max additional meals allowed beyond the base allocation
const MAX_ADDITIONAL = 50;

export function ModifyMealDialog({
  open,
  onOpenChange,
  order,
  selectedDate,
  vegChange,
  nonvegChange,
  reason,
  onVegChangeChange,
  onNonvegChangeChange,
  onReasonChange,
  onSubmit,
  isPending,
  modificationAmount,
}: ModifyMealDialogProps) {
  const totalChange = vegChange + nonvegChange;
  const newVeg = order.veg_count - vegChange;
  const newNonveg = order.nonveg_count - nonvegChange;
  const hasChange = vegChange !== 0 || nonvegChange !== 0;
  const isAddition = totalChange < 0;
  const isReduction = totalChange > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 border-0 bg-transparent shadow-none max-h-[90vh] flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card rounded-4xl border border-border/50 shadow-2xl p-6 sm:p-8 overflow-y-auto flex-1"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          <DialogHeader className="mb-6 text-left relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                Modify Daily Allotment
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              Increase or decrease the meal count for a single day. Changes will be
              reflected in your final settlement.
            </DialogDescription>
          </DialogHeader>

          {/* Date Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center border border-border/50 shadow-sm">
              <span className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-0.5">
                {selectedDate && format(selectedDate, "MMM")}
              </span>
              <span className="text-base font-black leading-none text-primary">
                {selectedDate && format(selectedDate, "dd")}
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary/60">
                Selected Date
              </p>
              <p className="text-sm font-black text-foreground">
                {selectedDate &&
                  format(selectedDate, "EEEE, MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Current Allocation */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
              Current Allocation
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold">
                  {order.veg_count}{" "}
                  <span className="text-muted-foreground font-medium">
                    Veg Meals
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm font-bold">
                  {order.nonveg_count}{" "}
                  <span className="text-muted-foreground font-medium">
                    Non-Veg Meals
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Meal Adjustment Steppers */}
          <div className="space-y-4 mb-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Adjust Meals
            </p>

            {/* Veg Stepper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">
                  Vegetarian
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    vegChange > 0
                      ? "text-emerald-600"
                      : vegChange < 0
                        ? "text-blue-600"
                        : "text-muted-foreground",
                  )}
                >
                  {order.veg_count} → {newVeg}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center border rounded-xl overflow-hidden h-12 transition-colors",
                  vegChange > 0
                    ? "bg-emerald-50 border-emerald-200"
                    : vegChange < 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-card border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    onVegChangeChange(
                      Math.min(order.veg_count, vegChange + 1),
                    )
                  }
                  disabled={vegChange >= order.veg_count}
                  className="h-full px-4 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-emerald-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-lg font-black text-emerald-700">
                  {newVeg}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onVegChangeChange(vegChange - 1)
                  }
                  disabled={vegChange <= -MAX_ADDITIONAL}
                  className="h-full px-4 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {vegChange > 0 && (
                <p className="text-[10px] font-bold text-emerald-600 pl-1">
                  -{vegChange} meal{vegChange > 1 ? "s" : ""} reduced
                </p>
              )}
              {vegChange < 0 && (
                <p className="text-[10px] font-bold text-blue-600 pl-1">
                  +{Math.abs(vegChange)} meal{Math.abs(vegChange) > 1 ? "s" : ""} added
                </p>
              )}
            </div>

            {/* Non-Veg Stepper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-700">
                  Non-Vegetarian
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    nonvegChange > 0
                      ? "text-orange-600"
                      : nonvegChange < 0
                        ? "text-blue-600"
                        : "text-muted-foreground",
                  )}
                >
                  {order.nonveg_count} → {newNonveg}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center border rounded-xl overflow-hidden h-12 transition-colors",
                  nonvegChange > 0
                    ? "bg-orange-50 border-orange-200"
                    : nonvegChange < 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-card border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    onNonvegChangeChange(
                      Math.min(order.nonveg_count, nonvegChange + 1),
                    )
                  }
                  disabled={nonvegChange >= order.nonveg_count}
                  className="h-full px-4 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-orange-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-lg font-black text-orange-700">
                  {newNonveg}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNonvegChangeChange(nonvegChange - 1)
                  }
                  disabled={nonvegChange <= -MAX_ADDITIONAL}
                  className="h-full px-4 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-orange-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {nonvegChange > 0 && (
                <p className="text-[10px] font-bold text-orange-600 pl-1">
                  -{nonvegChange} meal{nonvegChange > 1 ? "s" : ""} reduced
                </p>
              )}
              {nonvegChange < 0 && (
                <p className="text-[10px] font-bold text-blue-600 pl-1">
                  +{Math.abs(nonvegChange)} meal{Math.abs(nonvegChange) > 1 ? "s" : ""} added
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2 mb-6 relative z-10">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Reference Note (Optional)
            </label>
            <Textarea
              placeholder="e.g., Regional Holiday, Team Outing, Extra guests..."
              rows={1}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="rounded-2xl resize-none py-3 px-4 bg-secondary/20 border-border/40 focus:border-primary/50 font-bold text-xs"
            />
          </div>

          {/* Preview */}
          <AnimatePresence>
            {hasChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-6 relative z-10"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-secondary/20 border border-border/40">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">
                      New Total
                    </p>
                    <p className="text-xl font-black text-foreground">
                      {newVeg + newNonveg} Meals
                    </p>
                  </div>
                  {isReduction && (
                    <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/80 mb-1">
                        Projected Credit
                      </p>
                      <p className="text-xl font-black text-emerald-600 flex items-baseline gap-0.5">
                        <span className="text-xs">₹</span>
                        {modificationAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                  {isAddition && (
                    <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/80 mb-1">
                        Additional Charge
                      </p>
                      <p className="text-xl font-black text-amber-600 flex items-baseline gap-0.5">
                        <span className="text-xs">₹</span>
                        {Math.abs(modificationAmount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                    Adjustment will reflect in your final invoice. Modification
                    locks once the day cycle starts.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="sm:justify-between sm:gap-4 relative z-10 border-t border-border/40 pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-secondary/80"
            >
              Discard
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isPending || !hasChange}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-8 shadow-xl shadow-primary/20 font-black text-[10px] tracking-widest active:scale-95 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  PROCESSING...
                </>
              ) : (
                "APPLY MODIFICATION"
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
