"use client";

import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { 
  IndianRupee, 
  CreditCard, 
  Loader2, 
  CalendarDays, 
  UtensilsCrossed, 
  Users,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onTotalChangeChange,
  onSubmit,
  isPending,
  modificationAmount,
}: ModifyMealDialogProps) {
  const totalChange = vegChange + nonvegChange;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card rounded-4xl border border-border/50 shadow-2xl p-8 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          <DialogHeader className="mb-8 text-left relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
               </div>
               <DialogTitle className="text-xl font-black uppercase tracking-tight">Modify Daily Allotment</DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              Adjusting the count for a single day cycle. Changes will be balanced and reflected in your final settlement.
            </DialogDescription>
          </DialogHeader>

          {/* Date & Core Info */}
          <div className="p-5 rounded-3xl bg-secondary/40 border border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center border border-border/50 shadow-sm">
                <span className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-0.5">
                  {selectedDate && format(selectedDate, "MMM")}
                </span>
                <span className="text-base font-black leading-none text-primary">
                  {selectedDate && format(selectedDate, "dd")}
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary/60">Selected Cycle</p>
                <p className="text-sm font-black text-foreground">
                  {selectedDate && format(selectedDate, "EEEE, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
                  {order.veg_count} VEG
               </div>
               <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 text-[10px] font-black border border-orange-500/20">
                  {order.nonveg_count} NON-VEG
               </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Main Reduction Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label htmlFor="total-reduction" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                     Meal Count Change
                  </Label>
                  <div className="relative group">
                     <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input
                        id="total-reduction"
                        type="number"
                        min={1}
                        max={order.headcount}
                        placeholder="0"
                        className="pl-12 h-14 rounded-2xl text-lg font-black bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                        onChange={(e) => {
                           const val = parseInt(e.target.value) || 0;
                           onTotalChangeChange(val);
                        }}
                     />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground/60 italic ml-1">
                     * Values will be split proportionally across Veg & Non-Veg.
                  </p>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="mod-reason" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                     Reference Note (Optional)
                  </Label>
                  <Textarea
                     id="mod-reason"
                     placeholder="e.g., Regional Holiday, Team Outing..."
                     rows={1}
                     value={reason}
                     onChange={(e) => onReasonChange(e.target.value)}
                     className="h-14 rounded-2xl resize-none py-4 px-5 bg-secondary/20 border-border/40 focus:border-primary/50 font-bold text-xs"
                  />
               </div>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mod-veg" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Veg Change</Label>
                <div className="relative">
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 uppercase">MAX {order.veg_count}</div>
                   <Input
                     id="mod-veg"
                     type="number"
                     min={0}
                     max={order.veg_count}
                     value={vegChange}
                     onChange={(e) => onVegChangeChange(parseInt(e.target.value) || 0)}
                     className="h-12 rounded-2xl font-black text-emerald-600 bg-emerald-500/5 border-emerald-500/10 focus:ring-emerald-500/10"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mod-nonveg" className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-1">Non-Veg Change</Label>
                <div className="relative">
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 uppercase">MAX {order.nonveg_count}</div>
                   <Input
                     id="mod-nonveg"
                     type="number"
                     min={0}
                     max={order.nonveg_count}
                     value={nonvegChange}
                     onChange={(e) => onNonvegChangeChange(parseInt(e.target.value) || 0)}
                     className="h-12 rounded-2xl font-black text-orange-600 bg-orange-500/5 border-orange-500/10 focus:ring-orange-500/10"
                   />
                </div>
              </div>
            </div>

            <AnimatePresence>
               {totalChange !== 0 && (
                  <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="space-y-6 pt-4"
                  >
                     {/* Preview Stats */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-secondary/20 border border-border/40 flex items-center justify-between">
                           <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">Cycle New Total</p>
                              <p className="text-xl font-black text-foreground">{order.headcount + totalChange} Meals</p>
                           </div>
                           <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                        <div className={cn(
                           "p-4 rounded-3xl flex flex-col items-end",
                           modificationAmount < 0
                              ? "bg-emerald-500/5 border border-emerald-500/20"
                              : "bg-amber-500/5 border border-amber-500/20"
                        )}>
                           <p className={cn(
                              "text-[9px] font-black uppercase tracking-widest mb-1",
                              modificationAmount < 0
                                 ? "text-emerald-600/80"
                                 : "text-amber-600/80"
                           )}>
                              {modificationAmount < 0 ? "Projected Credit" : "Additional Charge"}
                           </p>
                           <p className={cn(
                              "text-xl font-black flex items-baseline gap-0.5",
                              modificationAmount < 0
                                 ? "text-emerald-600"
                                 : "text-amber-600"
                           )}>
                              <span className="text-xs">₹</span>
                              {Math.abs(modificationAmount).toLocaleString("en-IN")}
                           </p>
                        </div>
                     </div>

                     <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">
                           Note: Adjustments will be reflected in your virtual wallet and used for the final invoice generation. Modification is locked once the day cycle starts.
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>

          <DialogFooter className="mt-10 sm:justify-between sm:gap-4 relative z-10 border-t border-border/40 pt-8">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-secondary/80"
            >
              Discard Changes
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isPending || totalChange === 0}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 shadow-xl shadow-primary/20 font-black text-[10px] tracking-widest active:scale-95 transition-all"
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
