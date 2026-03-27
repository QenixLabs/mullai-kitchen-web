"use client";

import { Users, MessageSquare, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuickSplitButtons } from "./QuickSplitButtons";
import { cn } from "@/lib/utils";
import type { UseFormRegister, UseFormSetValue, UseFormTrigger, FieldErrors } from "react-hook-form";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

interface Step3PreferencesProps {
  headcount: number;
  vegCount: number;
  nonvegCount: number;
  notes: string;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  register: UseFormRegister<CreateCorporateOrderFormData>;
  setValue: UseFormSetValue<CreateCorporateOrderFormData>;
  trigger: UseFormTrigger<CreateCorporateOrderFormData>;
}

export function Step3Preferences({
  headcount,
  vegCount,
  nonvegCount,
  notes,
  errors,
  register,
  setValue,
  trigger,
}: Step3PreferencesProps) {
  const total = vegCount + nonvegCount;
  const isMatch = headcount > 0 && total === headcount;
  const isOver = total > headcount;

  const handleSplit = (veg: number, nonveg: number) => {
    setValue("veg_count", veg);
    setValue("nonveg_count", nonveg);
    trigger(["veg_count", "nonveg_count"]);
  };

  // Determine active split based on current values
  const getActiveSplit = () => {
    if (vegCount === headcount && nonvegCount === 0) return "all-veg";
    if (vegCount === 0 && nonvegCount === headcount) return "all-nonveg";
    if (vegCount === Math.ceil(headcount / 2) && nonvegCount === Math.floor(headcount / 2)) return "50-50";
    if (vegCount === Math.ceil(headcount * 0.6) && nonvegCount === Math.floor(headcount * 0.4)) return "60-40";
    if (vegCount === Math.ceil(headcount * 0.7) && nonvegCount === Math.floor(headcount * 0.3)) return "70-30";
    return undefined;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quantity Details */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#44151C]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Quantity Details</h3>
        </div>

        {/* Total Headcount */}
        <div className="space-y-2">
          <Label htmlFor="headcount" className="text-xs uppercase tracking-wider text-muted-foreground">
            Total Headcount
          </Label>
          <Input
            id="headcount"
            type="number"
            min={1}
            placeholder="12"
            className="text-base sm:text-lg"
            {...register("headcount", { valueAsNumber: true })}
          />
          {errors.headcount && (
            <p className="text-sm text-destructive">{errors.headcount.message}</p>
          )}
        </div>

        {/* Veg / Non-veg Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="veg_count" className="text-xs uppercase tracking-wider text-muted-foreground">
              Vegetarian Meals
            </Label>
            <Input
              id="veg_count"
              type="number"
              min={0}
              className={cn(
                "text-base sm:text-lg",
                vegCount > 0 && "bg-green-50 border-green-200 text-green-700"
              )}
              {...register("veg_count", { valueAsNumber: true })}
            />
            {errors.veg_count && (
              <p className="text-sm text-destructive">{errors.veg_count.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nonveg_count" className="text-xs uppercase tracking-wider text-muted-foreground">
              Non-Vegetarian Meals
            </Label>
            <Input
              id="nonveg_count"
              type="number"
              min={0}
              className={cn(
                "text-base sm:text-lg",
                nonvegCount > 0 && "bg-red-50 border-red-200 text-red-700"
              )}
              {...register("nonveg_count", { valueAsNumber: true })}
            />
            {errors.nonveg_count && (
              <p className="text-sm text-destructive">{errors.nonveg_count.message}</p>
            )}
          </div>
        </div>

        {/* Validation Badge */}
        {headcount > 0 && (
          <div className={cn(
            "flex items-center justify-between p-2.5 sm:p-3 rounded-lg border",
            isMatch
              ? "bg-green-50 border-green-200"
              : isOver
                ? "bg-red-50 border-red-200"
                : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-5 w-5 shrink-0",
                isMatch ? "text-green-600" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                isMatch ? "text-green-700" : "text-gray-600"
              )}>
                Veg ({vegCount}) + Non-veg ({nonvegCount}) = {total} / {headcount}
                {isMatch && " — Match"}
              </span>
            </div>
            {isMatch && (
              <span className="text-xs font-medium text-green-700 uppercase tracking-wider hidden sm:inline">
                Verified
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Split Options */}
      {headcount > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-sm font-medium">Quick Split Options</h4>
          <QuickSplitButtons
            headcount={headcount}
            onSplit={handleSplit}
            activeSplit={getActiveSplit()}
          />
        </div>
      )}

      {/* Special Instructions */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#44151C]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Special Instructions</h3>
        </div>
        <Textarea
          placeholder="Enter any dietary restrictions, allergies, or specific delivery handling instructions..."
          rows={3}
          className="min-h-20 sm:min-h-25"
          {...register("notes")}
        />
      </div>
    </div>
  );
}
