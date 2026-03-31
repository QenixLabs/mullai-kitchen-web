"use client";

import type { FieldErrors, Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

export const DAYS_OF_WEEK = [
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
  { value: "Sunday", label: "Sun" },
] as const;

export const MEAL_TYPES = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
] as const;

export interface ScheduleSectionProps {
  selectedDays: string[];
  mealTypes: string[];
  startDate: string;
  endDate: string;
  totalDeliveryDays: number;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  control: Control<CreateCorporateOrderFormData>;
  onDayToggle: (day: string, checked: boolean) => void;
  onMealToggle: (meal: string, checked: boolean) => void;
}

export function ScheduleSection({
  selectedDays,
  mealTypes,
  startDate,
  endDate,
  totalDeliveryDays,
  errors,
  control,
  onDayToggle,
  onMealToggle,
}: ScheduleSectionProps) {
  return (
    <div className="relative rounded-2xl bg-card border border-border shadow-sm">
      <div className="p-6 space-y-8">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CalendarDays className="h-5 w-5 text-primary" />
            Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose delivery days, meal types, and the order duration.
          </p>
        </div>

        {/* Day Selector */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Delivery Days</Label>
          <p className="text-sm text-muted-foreground">
            Select the days of the week for meal delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                className={`flex items-center gap-2 px-4 py-3 rounded-md border cursor-pointer transition-all ${
                  selectedDays.includes(day.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-accent"
                }`}
              >
                <Checkbox
                  checked={selectedDays.includes(day.value)}
                  onCheckedChange={(checked) =>
                    onDayToggle(day.value, !!checked)
                  }
                  className={
                    selectedDays.includes(day.value)
                      ? "data-[state=checked]:bg-primary-foreground data-[state=checked]:border-primary-foreground data-[state=checked]:text-primary"
                      : ""
                  }
                />
                <span className="text-sm font-medium">{day.label}</span>
              </label>
            ))}
          </div>
          {errors.selected_days && (
            <p className="text-sm text-destructive">
              {errors.selected_days.message}
            </p>
          )}
        </div>

        <Separator />

        {/* Meal Type Selector */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Meal Types</Label>
          <p className="text-sm text-muted-foreground">
            Select which meals to include each delivery day.
          </p>
          <div className="flex flex-wrap gap-3">
            {MEAL_TYPES.map((meal) => (
              <label
                key={meal.value}
                className={`flex items-center gap-2 px-4 py-3 rounded-md border cursor-pointer transition-all ${
                  mealTypes.includes(meal.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-accent"
                }`}
              >
                <Checkbox
                  checked={mealTypes.includes(meal.value)}
                  onCheckedChange={(checked) =>
                    onMealToggle(meal.value, !!checked)
                  }
                  className={
                    mealTypes.includes(meal.value)
                      ? "data-[state=checked]:bg-primary-foreground data-[state=checked]:border-primary-foreground data-[state=checked]:text-primary"
                      : ""
                  }
                />
                <span className="text-sm font-medium">{meal.label}</span>
              </label>
            ))}
          </div>
          {errors.meal_types && (
            <p className="text-sm text-destructive">
              {errors.meal_types.message}
            </p>
          )}
        </div>

        <Separator />

        {/* Start Date and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Controller
              control={control}
              name="start_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  placeholder="Select start date"
                  minDate={addDays(startOfDay(new Date()), 1)}
                />
              )}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Controller
              control={control}
              name="end_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder="Select end date"
                  disabled={(date) => date < new Date(startDate)}
                />
              )}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Computed Schedule Info */}
        {(totalDeliveryDays > 0 || endDate) && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">
                {endDate
                  ? format(new Date(endDate), "MMM dd, yyyy")
                  : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total Delivery Days
              </span>
              <span className="font-medium">
                {totalDeliveryDays} days
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Meals per Delivery Day
              </span>
              <span className="font-medium">
                {mealTypes.length} meal(s)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
