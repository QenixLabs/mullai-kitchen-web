"use client";

import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors,
} from "react-hook-form";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

export interface QuantitySectionProps {
  headcount: number;
  vegCount: number;
  nonvegCount: number;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  register: UseFormRegister<CreateCorporateOrderFormData>;
  setValue: UseFormSetValue<CreateCorporateOrderFormData>;
  trigger: UseFormTrigger<CreateCorporateOrderFormData>;
}

export function QuantitySection({
  headcount,
  vegCount,
  nonvegCount,
  errors,
  register,
  setValue,
  trigger,
}: QuantitySectionProps) {
  const total = vegCount + nonvegCount;
  const isMatch = headcount > 0 && total === headcount;
  const isOver = total > headcount;

  return (
    <div className="relative rounded-2xl bg-card border border-border shadow-sm">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Users className="h-5 w-5 text-primary" />
            Quantity
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Specify the number of people and the veg/non-veg meal split.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headcount">Total Headcount</Label>
          <Input
            id="headcount"
            type="number"
            min={1}
            placeholder="e.g., 10"
            {...register("headcount", { valueAsNumber: true })}
          />
          {errors.headcount && (
            <p className="text-sm text-destructive">{errors.headcount.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="veg_count">Vegetarian Meals</Label>
            <Input
              id="veg_count"
              type="number"
              min={0}
              max={headcount || undefined}
              placeholder="e.g., 6"
              {...register("veg_count", { valueAsNumber: true })}
            />
            {errors.veg_count && (
              <p className="text-sm text-destructive">
                {errors.veg_count.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nonveg_count">Non-Vegetarian Meals</Label>
            <Input
              id="nonveg_count"
              type="number"
              min={0}
              max={headcount || undefined}
              placeholder="e.g., 4"
              {...register("nonveg_count", { valueAsNumber: true })}
            />
            {errors.nonveg_count && (
              <p className="text-sm text-destructive">
                {errors.nonveg_count.message}
              </p>
            )}
          </div>
        </div>

        {/* Headcount validation indicator */}
        {headcount > 0 && (
          <div
            className={`rounded-xl p-4 flex items-center justify-between text-sm ${
              isMatch
                ? "bg-success/5 text-success border border-success/20"
                : isOver
                  ? "bg-destructive/5 text-destructive border border-destructive/20"
                  : "bg-warning/5 text-warning border border-warning/20"
            }`}
          >
            <span>
              Veg ({vegCount}) + Non-veg ({nonvegCount}) = {total} /{" "}
              {headcount}
            </span>
            {isMatch ? (
              <Badge className="bg-success/10 text-success hover:bg-success/10 border-success/20">
                Match
              </Badge>
            ) : (
              <Badge variant="destructive">Mismatch</Badge>
            )}
          </div>
        )}

        {/* Quick split buttons */}
        {headcount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick Split</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("veg_count", headcount);
                  setValue("nonveg_count", 0);
                  trigger(["veg_count", "nonveg_count"]);
                }}
              >
                All Veg ({headcount}V / 0NV)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("veg_count", 0);
                  setValue("nonveg_count", headcount);
                  trigger(["veg_count", "nonveg_count"]);
                }}
              >
                All Non-veg (0V / {headcount}NV)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const veg = Math.ceil(headcount / 2);
                  setValue("veg_count", veg);
                  setValue("nonveg_count", headcount - veg);
                  trigger(["veg_count", "nonveg_count"]);
                }}
              >
                50-50 ({Math.ceil(headcount / 2)}V /{" "}
                {headcount - Math.ceil(headcount / 2)}NV)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const veg = Math.ceil(headcount * 0.6);
                  setValue("veg_count", veg);
                  setValue("nonveg_count", headcount - veg);
                  trigger(["veg_count", "nonveg_count"]);
                }}
              >
                60-40 ({Math.ceil(headcount * 0.6)}V /{" "}
                {headcount - Math.ceil(headcount * 0.6)}NV)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const veg = Math.ceil(headcount * 0.7);
                  setValue("veg_count", veg);
                  setValue("nonveg_count", headcount - veg);
                  trigger(["veg_count", "nonveg_count"]);
                }}
              >
                70-30 ({Math.ceil(headcount * 0.7)}V /{" "}
                {headcount - Math.ceil(headcount * 0.7)}NV)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
