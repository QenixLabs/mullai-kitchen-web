"use client";

import { useState } from "react";
import {
  Leaf,
  Drumstick,
  CalendarDays,
  UtensilsCrossed,
  Check,
  MapPin,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCreateCustomPlan } from "@/api/hooks/useCustomPlans";
import { useAddresses } from "@/api/hooks/useOnboarding";
import type {
  CustomPlanResponse,
  PlanBrowseItem,
} from "@/api/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DietPreference = "VEG" | "NON_VEG";
type MealType = "Breakfast" | "Lunch" | "Dinner";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
const DURATION_OPTIONS = [7, 14, 28, 30];
const STEP_COUNT = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function adaptCustomPlan(cp: CustomPlanResponse): PlanBrowseItem {
  return {
    _id: cp._id,
    name: cp.name,
    description: cp.description,
    duration: `${cp.custom_days} days`,
    meals_included: cp.meals_included,
    price: cp.price,
    valid_from: cp.valid_from,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CustomPlanBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanCreated: (plan: PlanBrowseItem) => void;
  checkedPincode?: string | null;
}

export function CustomPlanBuilderDialog({
  open,
  onOpenChange,
  onPlanCreated,
  checkedPincode,
}: CustomPlanBuilderDialogProps) {
  const [step, setStep] = useState(0);

  // Form state
  const [preference, setPreference] = useState<DietPreference | null>(null);
  const [meals, setMeals] = useState<Set<MealType>>(new Set());
  const [days, setDays] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [addressId, setAddressId] = useState<string>("");

  const createCustomPlan = useCreateCustomPlan();
  const addressesQuery = useAddresses();
  const addresses = addressesQuery.data ?? [];

  // Derived
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const canAdvance = [
    preference !== null,
    meals.size > 0,
    days !== null && startDate !== "",
    addressId !== "",
  ][step];

  function toggleMeal(meal: MealType) {
    setMeals((prev) => {
      const next = new Set(prev);
      next.has(meal) ? next.delete(meal) : next.add(meal);
      return next;
    });
  }

  function handleReset() {
    setStep(0);
    setPreference(null);
    setMeals(new Set());
    setDays(null);
    setStartDate("");
    setAddressId("");
    createCustomPlan.reset();
  }

  function handleClose(open: boolean) {
    if (!open) handleReset();
    onOpenChange(open);
  }

  async function handleSubmit() {
    if (!preference || meals.size === 0 || !days || !startDate || !addressId)
      return;

    try {
      const result = await createCustomPlan.mutateAsync({
        custom_preference: preference,
        custom_meal_types: Array.from(meals),
        custom_days: days,
        start_date: startDate,
        address_id: addressId,
      });

      const adapted = adaptCustomPlan(result);
      onOpenChange(false);
      handleReset();
      onPlanCreated(adapted);
    } catch (err) {
      console.error("Failed to create custom plan:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] gap-0 border-0">
        {/* Progress Bar Container */}
        <div className="w-full bg-gray-100 h-1.5 flex gap-1 px-4 mt-4">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                i < step
                  ? "bg-[#FF6B35]"
                  : i === step
                    ? "bg-[#FF6B35]/50"
                    : "bg-gray-200",
              )}
            />
          ))}
        </div>

        {/* Unified Header */}
        <div className="px-6 pt-5 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Build Your Own Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 font-medium">
              Customize your meals, duration, and delivery details.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Dynamic Body Content */}
        <div className="px-6 py-4 min-h-[340px]">
          {/* STEP 1: Preference */}
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-gray-900">
                How would you like your meals?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreference("VEG")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white transition-all duration-500",
                    "border-2",
                    preference === "VEG"
                      ? "border-[#FF6B35] ring-2 ring-[#FF6B35] ring-offset-2 ring-offset-white shadow-[0_4px_20px_rgba(255,107,53,0.2),0_8px_40px_rgba(0,0,0,0.1)]"
                      : "border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-colors duration-300",
                      preference === "VEG"
                        ? "bg-[#FF6B35] text-white"
                        : "bg-green-50 text-green-600 group-hover:bg-green-100",
                    )}
                  >
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-gray-900">
                      Vegetarian
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Plant-based & dairy
                    </span>
                  </div>
                  {preference === "VEG" && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPreference("NON_VEG")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white transition-all duration-500",
                    "border-2",
                    preference === "NON_VEG"
                      ? "border-[#FF6B35] ring-2 ring-[#FF6B35] ring-offset-2 ring-offset-white shadow-[0_4px_20px_rgba(255,107,53,0.2),0_8px_40px_rgba(0,0,0,0.1)]"
                      : "border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-colors duration-300",
                      preference === "NON_VEG"
                        ? "bg-[#FF6B35] text-white"
                        : "bg-red-50 text-red-600 group-hover:bg-red-100",
                    )}
                  >
                    <Drumstick className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-gray-900">
                      Non-Vegetarian
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Includes meat
                    </span>
                  </div>
                  {preference === "NON_VEG" && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Meals */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Which meals should we include?
                </h3>
                <p className="text-sm text-gray-500">
                  Select all that apply for your deliveries.
                </p>
              </div>
              <div className="space-y-3">
                {MEAL_TYPES.map((meal) => {
                  const isSelected = meals.has(meal);
                  return (
                    <button
                      key={meal}
                      onClick={() => toggleMeal(meal)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-500 border-2",
                        isSelected
                          ? "border-[#FF6B35] bg-orange-50/50 shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)]"
                          : "border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#FF6B35]/30 hover:shadow-[0_4px_20px_rgba(255,107,53,0.1rem),0_8px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                            isSelected
                              ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8555] text-white shadow-md"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {meal}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-md">
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Duration & Date */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Plan Duration
                </h3>
                <div className="grid grid-cols-4 gap-2.5">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300",
                        days === d
                          ? "border-[#FF6B35] bg-[#FF6B35] text-white shadow-md ring-2 ring-[#FF6B35] ring-offset-2 ring-offset-white"
                          : "border-gray-100 bg-white text-gray-700 hover:border-[#FF6B35]/30 hover:bg-orange-50 hover:text-[#FF6B35] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]",
                      )}
                    >
                      <span className="text-xl font-bold">{d}</span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider mt-0.5",
                          days === d ? "text-white/90" : "text-gray-500",
                        )}
                      >
                        Days
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Start Date
                </h3>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    min={minDate}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-12 pr-4 rounded-xl border-2 bg-gray-50 text-gray-900 font-medium outline-none transition-all duration-300",
                      "placeholder:text-gray-400 focus:bg-white focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35]/20",
                      startDate && "border-[#FF6B35]/50 bg-white",
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Address */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delivery Address
                </h3>
                <p className="text-sm text-gray-500">
                  Select where we should deliver your meals.
                </p>
              </div>

              {addressesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-base text-gray-700 font-semibold">
                    No saved addresses
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please add an address in your profile first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = addressId === addr._id;
                    return (
                      <button
                        key={addr._id}
                        onClick={() => setAddressId(addr._id)}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 border-2 text-left group",
                          isSelected
                            ? "border-[#FF6B35] bg-orange-50/50 shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)] ring-1 ring-[#FF6B35]"
                            : "border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#FF6B35]/30 hover:shadow-[0_4px_20px_rgba(255,107,53,0.1rem),0_8px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 shrink-0 rounded-xl flex justify-center items-center transition-colors",
                            isSelected
                              ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8555] text-white shadow-md"
                              : "bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-[#FF6B35]",
                          )}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-bold text-gray-900 capitalize">
                              {addr.type}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35]/10 text-[#FF6B35] shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-medium break-words leading-relaxed">
                            {addr.full_address}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5 font-medium break-words">
                            {addr.area}, {addr.city} {addr.pincode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-md shrink-0 mt-2">
                            <Check
                              className="h-3 w-3 text-white"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {createCustomPlan.isError && (
                <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm font-medium border border-red-200">
                  {createCustomPlan.error instanceof Error
                    ? createCustomPlan.error.message
                    : "An error occurred. Please try again."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:px-6 sm:py-5 bg-gray-50 flex items-center gap-3 w-full border-t border-gray-100 rounded-b-3xl">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={createCustomPlan.isPending}
              className={cn(
                "h-11 px-6 rounded-xl font-medium transition-all duration-300",
                "border-2 border-gray-200 bg-white text-gray-600",
                "hover:border-[#FF6B35]/30 hover:bg-orange-50 hover:text-[#FF6B35]",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-600",
              )}
            >
              Back
            </button>
          )}

          {step < STEP_COUNT - 1 ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
              className={cn(
                "flex-1 h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300",
                "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
                "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
                "active:scale-[0.98]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100",
              )}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !canAdvance ||
                createCustomPlan.isPending ||
                addresses.length === 0
              }
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
                "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
                "active:scale-[0.98]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100",
              )}
            >
              {createCustomPlan.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Confirm & Checkout
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
