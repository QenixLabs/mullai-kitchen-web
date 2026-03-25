"use client";

import { format } from "date-fns";
import { IndianRupee, CreditCard, Loader2, CalendarDays, UtensilsCrossed, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ICorporateOrder } from "@/api/types/corporate.types";

export function computeCredit(
  vegReduction: number,
  nonvegReduction: number,
  vegPrice: number,
  nonvegPrice: number,
  mealTypesCount: number
): number {
  return (
    vegReduction * vegPrice * mealTypesCount +
    nonvegReduction * nonvegPrice * mealTypesCount
  );
}

interface ModifyMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ICorporateOrder;
  selectedDate: Date | null;
  vegReduction: number;
  nonvegReduction: number;
  reason: string;
  onVegReductionChange: (val: number) => void;
  onNonvegReductionChange: (val: number) => void;
  onReasonChange: (val: string) => void;
  onTotalReductionChange: (total: number) => void;
  onSubmit: () => void;
  isPending: boolean;
  credit: number;
}

export function ModifyMealDialog({
  open,
  onOpenChange,
  order,
  selectedDate,
  vegReduction,
  nonvegReduction,
  reason,
  onVegReductionChange,
  onNonvegReductionChange,
  onReasonChange,
  onTotalReductionChange,
  onSubmit,
  isPending,
  credit,
}: ModifyMealDialogProps) {
  const totalReduction = vegReduction + nonvegReduction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Modify Meals
          </DialogTitle>
          <DialogDescription className="text-sm">
            Reduce meal quantities for this delivery date. Credits will reflect in the final invoice.
          </DialogDescription>
        </DialogHeader>

        {/* Date + allocation info strip */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">
              {selectedDate && format(selectedDate, "EEE, MMM dd, yyyy")}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-success font-medium">{order.veg_count}V</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-warning font-medium">{order.nonveg_count}NV</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-bold">{order.headcount} total</span>
          </div>
        </div>

        <div className="space-y-5 py-2">
          {/* Total reduction input */}
          <div className="space-y-2">
            <Label htmlFor="total-reduction" className="text-sm font-semibold">
              Total meals to reduce
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="total-reduction"
                type="number"
                min={1}
                max={order.headcount}
                placeholder="e.g., 3"
                className="pl-10 h-11 rounded-xl text-lg font-semibold"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onTotalReductionChange(val);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-suggests proportional veg/non-veg split. Adjust manually below.
            </p>
          </div>

          {/* Veg / Non-veg split */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mod-veg" className="text-sm font-medium">
                Veg reduction
              </Label>
              <Input
                id="mod-veg"
                type="number"
                min={0}
                max={order.veg_count}
                value={vegReduction}
                onChange={(e) =>
                  onVegReductionChange(parseInt(e.target.value) || 0)
                }
                className="h-10 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Max: {order.veg_count}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mod-nonveg" className="text-sm font-medium">
                Non-veg reduction
              </Label>
              <Input
                id="mod-nonveg"
                type="number"
                min={0}
                max={order.nonveg_count}
                value={nonvegReduction}
                onChange={(e) =>
                  onNonvegReductionChange(parseInt(e.target.value) || 0)
                }
                className="h-10 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Max: {order.nonveg_count}
              </p>
            </div>
          </div>

          {/* After-modification preview */}
          {totalReduction > 0 && (
            <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                After modification
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-semibold">
                    {order.veg_count - vegReduction} Veg
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-warning" />
                  <span className="text-warning font-semibold">
                    {order.nonveg_count - nonvegReduction} Non-veg
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="font-bold">{order.headcount - totalReduction} total</span>
                </div>
              </div>
            </div>
          )}

          {/* Credit display */}
          {totalReduction > 0 && (
            <div
              className={cn(
                "rounded-xl p-4 border transition-all",
                "bg-success/5 border-success/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <CreditCard className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-success/80 font-medium">Estimated Credit</p>
                    <p className="text-xl font-bold text-success flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {credit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/10 border-success/20">
                  {totalReduction} meal{totalReduction > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="mod-reason" className="text-sm font-medium">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="mod-reason"
              placeholder="e.g., Team offsite, holiday, etc."
              rows={2}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-10 px-5"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending || totalReduction === 0}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl h-10 px-5 shadow-md shadow-primary/20 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Confirm Modification"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
