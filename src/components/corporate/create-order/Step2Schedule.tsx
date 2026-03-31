"use client";

import { CalendarDays, UtensilsCrossed, Calendar } from "lucide-react";
import { Controller } from "react-hook-form";
import { format, addDays, startOfDay } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { DaySelector } from "./DaySelector";
import { MealTypeCard } from "./MealTypeCard";
import type { Control, FieldErrors } from "react-hook-form";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

interface Step2ScheduleProps {
  selectedDays: string[];
  mealTypes: string[];
  startDate: string;
  endDate: string;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  control: Control<CreateCorporateOrderFormData>;
  onDayToggle: (day: string, checked: boolean) => void;
  onMealToggle: (meal: string, checked: boolean) => void;
}

export function Step2Schedule({
  selectedDays,
  mealTypes,
  startDate,
  endDate,
  errors,
  control,
  onDayToggle,
  onMealToggle,
}: Step2ScheduleProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Delivery Days */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#44151C]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Select Delivery Days</h3>
        </div>
        <DaySelector
          selectedDays={selectedDays}
          onDayToggle={onDayToggle}
        />
        {errors.selected_days && (
          <p className="text-sm text-destructive">{errors.selected_days.message}</p>
        )}
      </div>

      {/* Meal Types */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-[#44151C]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Meal Types</h3>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <MealTypeCard
              key={meal}
              type={meal as "Breakfast" | "Lunch" | "Dinner"}
              selected={mealTypes.includes(meal)}
              onToggle={(checked) => onMealToggle(meal, checked)}
            />
          ))}
        </div>
        {errors.meal_types && (
          <p className="text-sm text-destructive">{errors.meal_types.message}</p>
        )}
      </div>

      {/* Start Date and Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#44151C]" />
            <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Start Date</h3>
          </div>
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
            <p className="text-sm text-destructive">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">End Date</h3>
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
            <p className="text-sm text-destructive">{errors.end_date.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}