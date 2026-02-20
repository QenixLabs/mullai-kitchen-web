"use client";

import { useState } from "react";
import {
  Leaf,
  Drumstick,
  CalendarDays,
  UtensilsCrossed,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  MapPin,
  Loader2,
  ChefHat,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

/** Maps a CustomPlanResponse to the PlanBrowseItem shape used by the intent store */
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full flex-1 transition-all duration-500",
            i < current
              ? "bg-[#FF6B35]"
              : i === current
                ? "bg-[#FF6B35]/60"
                : "bg-gray-200",
          )}
        />
      ))}
      <span className="text-xs text-gray-400 shrink-0">
        {current + 1}/{total}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CustomPlanBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the adapted PlanBrowseItem after successful creation */
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
      // Close the dialog FIRST, then reset, then navigate.
      // Calling handleReset() before onOpenChange(false) triggers a
      // re-render that races with the close signal and keeps the dialog open.
      onOpenChange(false);
      handleReset();
      onPlanCreated(adapted);
    } catch (err) {
      // Error is surfaced via createCustomPlan.isError / createCustomPlan.error
      console.error("Failed to create custom plan:", err);
    }
  }

  const mealColorMap: Record<
    MealType,
    { active: string; inactive: string; dot: string }
  > = {
    Breakfast: {
      active: "bg-amber-500 text-white border-amber-500 shadow-amber-200",
      inactive: "border-amber-200 text-amber-700 hover:bg-amber-50",
      dot: "bg-amber-500",
    },
    Lunch: {
      active: "bg-[#FF6B35] text-white border-[#FF6B35] shadow-orange-200",
      inactive: "border-orange-200 text-orange-700 hover:bg-orange-50",
      dot: "bg-[#FF6B35]",
    },
    Dinner: {
      active: "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200",
      inactive: "border-indigo-200 text-indigo-700 hover:bg-indigo-50",
      dot: "bg-indigo-600",
    },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl border-0 p-0 shadow-2xl overflow-hidden">
        {/* Header banner */}
        <div className="relative bg-[#FF6B35] px-6 pt-6 pb-8">
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_70%_20%,white_1px,transparent_1px)] [background-size:20px_20px]" />
          <DialogHeader className="relative">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-black text-white leading-tight">
              Build Your Own Plan
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-0.5">
              Curated exactly for your taste and schedule.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-5">
          <StepIndicator current={step} total={STEP_COUNT} />

          {/* ── Step 0: Diet Preference ─────────────────────────────── */}
          {step === 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step 1
              </p>
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                What&apos;s your food preference?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(["VEG", "NON_VEG"] as DietPreference[]).map((pref) => {
                  const isVeg = pref === "VEG";
                  const isActive = preference === pref;
                  return (
                    <button
                      key={pref}
                      onClick={() => setPreference(pref)}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200",
                        isActive
                          ? isVeg
                            ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                            : "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                          isActive
                            ? isVeg
                              ? "bg-green-500"
                              : "bg-red-500"
                            : "bg-gray-100 group-hover:bg-gray-200",
                        )}
                      >
                        {isVeg ? (
                          <Leaf
                            className={cn(
                              "h-6 w-6 transition-colors",
                              isActive ? "text-white" : "text-gray-500",
                            )}
                          />
                        ) : (
                          <Drumstick
                            className={cn(
                              "h-6 w-6 transition-colors",
                              isActive ? "text-white" : "text-gray-500",
                            )}
                          />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          isActive
                            ? isVeg
                              ? "text-green-700"
                              : "text-red-600"
                            : "text-gray-700",
                        )}
                      >
                        {isVeg ? "Vegetarian" : "Non-Veg"}
                      </span>
                      {isActive && (
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full",
                            isVeg ? "bg-green-500" : "bg-red-500",
                          )}
                        >
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
            </div>
          )}

          {/* ── Step 1: Meal Types ──────────────────────────────────── */}
          {step === 1 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step 2
              </p>
              <h3 className="mb-1 text-lg font-bold text-gray-900">
                Which meals would you like?
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Select all that apply.
              </p>
              <div className="flex flex-col gap-3">
                {MEAL_TYPES.map((meal) => {
                  const isActive = meals.has(meal);
                  const colors = mealColorMap[meal];
                  return (
                    <button
                      key={meal}
                      onClick={() => toggleMeal(meal)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 transition-all duration-200",
                        isActive
                          ? `${colors.active} shadow-md`
                          : `${colors.inactive} bg-white`,
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isActive ? "bg-white/25" : "bg-gray-100",
                        )}
                      >
                        <UtensilsCrossed
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-white" : "text-gray-500",
                          )}
                        />
                      </span>
                      <span className="flex-1 text-left text-sm font-semibold">
                        {meal}
                      </span>
                      {isActive && (
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Duration & Start Date ──────────────────────── */}
          {step === 2 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step 3
              </p>
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Duration & start date
              </h3>

              {/* Days */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Number of days
              </p>
              <div className="mb-5 grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={cn(
                      "flex flex-col items-center rounded-xl border-2 py-3 text-sm font-bold transition-all duration-200",
                      days === d
                        ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35] shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <span className="text-base font-black">{d}</span>
                    <span className="text-[10px] font-medium text-gray-400">
                      days
                    </span>
                  </button>
                ))}
              </div>

              {/* Start Date */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Start date
              </p>
              <div className="relative">
                <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  min={minDate}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border-2 bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-700 outline-none transition-all duration-200",
                    startDate
                      ? "border-[#FF6B35]"
                      : "border-gray-200 focus:border-[#FF6B35]",
                  )}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Address ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step 4
              </p>
              <h3 className="mb-1 text-lg font-bold text-gray-900">
                Delivery address
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Where should we deliver?
              </p>

              {addressesQuery.isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35]" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-8 text-center">
                  <MapPin className="h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    No saved addresses yet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Please add an address from your profile first.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {addresses.map((addr) => {
                    const isActive = addressId === addr._id;
                    return (
                      <button
                        key={addr._id}
                        onClick={() => setAddressId(addr._id)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                          isActive
                            ? "border-[#FF6B35] bg-orange-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            isActive ? "bg-[#FF6B35]" : "bg-gray-100",
                          )}
                        >
                          <MapPin
                            className={cn(
                              "h-4 w-4",
                              isActive ? "text-white" : "text-gray-400",
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                isActive
                                  ? "bg-orange-200 text-orange-700"
                                  : "bg-gray-100 text-gray-500",
                              )}
                            >
                              {addr.type}
                            </span>
                            {addr.is_default && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 wrap-break-word text-sm font-medium text-gray-800">
                            {addr.full_address}
                          </p>
                          <p className="text-xs text-gray-500">
                            {addr.area}, {addr.city} – {addr.pincode}
                          </p>
                        </div>
                        {isActive && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]">
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

              {/* Error */}
              {createCustomPlan.isError && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
                  {createCustomPlan.error instanceof Error
                    ? createCustomPlan.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────── */}
          <div className="mt-6 flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                onClick={() => setStep((s) => s - 1)}
                disabled={createCustomPlan.isPending}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            )}

            {step < STEP_COUNT - 1 ? (
              <Button
                className={cn(
                  "h-11 flex-1 rounded-xl font-bold text-white shadow-md transition-all duration-300",
                  "bg-[#FF6B35]",
                  "hover:bg-[#E85A25] hover:shadow-lg hover:shadow-orange-200/50",
                  "active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                )}
                disabled={!canAdvance}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className={cn(
                  "h-11 flex-1 rounded-xl font-bold text-white shadow-md transition-all duration-300",
                  "bg-[#FF6B35]",
                  "hover:bg-[#E85A25] hover:shadow-lg hover:shadow-orange-200/50",
                  "active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                )}
                disabled={
                  !canAdvance ||
                  createCustomPlan.isPending ||
                  addresses.length === 0
                }
                onClick={handleSubmit}
              >
                {createCustomPlan.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Confirm Plan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
