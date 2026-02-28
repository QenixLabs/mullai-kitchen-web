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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-lg shadow-md gap-0 border-0">
        {/* Progress Bar Container */}
        <div className="w-full bg-gray-100 h-1.5 flex gap-1 px-4 mt-4">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                i < step
                  ? "bg-primary"
                  : i === step
                    ? "bg-primary/50"
                    : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Unified Header */}
        <div className="px-6 pt-5 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Build Your Own Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              Customize your meals, duration, and delivery details.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Dynamic Body Content */}
        <div className="px-6 py-4 min-h-80">
          {/* STEP 1: Preference */}
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-foreground">
                How would you like your meals?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreference("VEG")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-5 rounded-lg bg-white transition-all duration-500",
                    "border-2",
                    preference === "VEG"
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary shadow-lg"
                      : "border-border shadow-md hover:shadow-primary hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors duration-300",
                      preference === "VEG"
                        ? "bg-primary text-primary-foreground"
                        : "bg-green-50 text-green-600 group-hover:bg-green-100",
                    )}
                  >
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-foreground">
                      Vegetarian
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Plant-based & dairy
                    </span>
                  </div>
                  {preference === "VEG" && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPreference("NON_VEG")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-5 rounded-lg bg-white transition-all duration-500",
                    "border-2",
                    preference === "NON_VEG"
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary shadow-lg"
                      : "border-border shadow-md hover:shadow-primary hover:-translate-y-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors duration-300",
                      preference === "NON_VEG"
                        ? "bg-primary text-primary-foreground"
                        : "bg-red-50 text-red-600 group-hover:bg-red-100",
                    )}
                  >
                    <Drumstick className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-foreground">
                      Non-Vegetarian
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Includes meat
                    </span>
                  </div>
                  {preference === "NON_VEG" && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
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
                <h3 className="text-lg font-semibold text-foreground">
                  Which meals should we include?
                </h3>
                <p className="text-sm text-muted-foreground">
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
                        "w-full flex items-center justify-between p-4 rounded-lg transition-all duration-500 border-2",
                        isSelected
                          ? "border-primary bg-orange-50/50 shadow-primary shadow-lg"
                          : "border-border bg-white shadow-md hover:border-primary/30 hover:shadow-primary hover:-translate-y-0.5",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {meal}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
                          <Check
                            className="h-3 w-3 text-primary-foreground"
                            strokeWidth={3}
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-border" />
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
                <h3 className="text-sm font-medium text-muted-foreground">
                  Plan Duration
                </h3>
                <div className="grid grid-cols-4 gap-2.5">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-lg border-2 transition-all duration-300",
                        days === d
                          ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-accent hover:text-primary shadow-md",
                      )}
                    >
                      <span className="text-xl font-bold">{d}</span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider mt-0.5",
                          days === d ? "text-primary-foreground/90" : "text-muted-foreground",
                        )}
                      >
                        Days
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Start Date
                </h3>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    min={minDate}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-12 pr-4 rounded-lg border-2 bg-muted text-foreground font-medium outline-none transition-all duration-300",
                      "placeholder:text-muted-foreground focus:bg-background focus:border-primary focus:ring focus:ring-primary/20",
                      startDate && "border-primary/50 bg-background",
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
                <h3 className="text-lg font-semibold text-foreground">
                  Delivery Address
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select where we should deliver your meals.
                </p>
              </div>

              {addressesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-10 rounded-lg border-2 border-dashed border-border bg-muted">
                  <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-base text-foreground font-semibold">
                    No saved addresses
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please add an address in your profile first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = addressId === addr._id;
                    return (
                      <button
                        key={addr._id}
                        onClick={() => setAddressId(addr._id)}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-lg transition-all duration-500 border-2 text-left group",
                          isSelected
                            ? "border-primary bg-orange-50/50 shadow-primary shadow-lg ring-1 ring-primary"
                            : "border-border bg-background shadow-md hover:border-primary/30 hover:shadow-primary hover:-translate-y-0.5",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 shrink-0 rounded-lg flex justify-center items-center transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-primary",
                          )}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-bold text-foreground capitalize">
                              {addr.type}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium break-words leading-relaxed">
                            {addr.full_address}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1.5 font-medium break-words">
                            {addr.area}, {addr.city} {addr.pincode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md shrink-0 mt-2">
                            <Check
                              className="h-3 w-3 text-primary-foreground"
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
                <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm font-medium border border-red-200">
                  {createCustomPlan.error instanceof Error
                    ? createCustomPlan.error.message
                    : "An error occurred. Please try again."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:px-6 sm:py-5 bg-muted flex items-center gap-3 w-full border-t border-border rounded-b-3xl">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={createCustomPlan.isPending}
              className={cn(
                "h-11 px-6 rounded-lg font-medium transition-all duration-300",
                "border-2 border-border bg-background text-muted-foreground",
                "hover:border-primary/30 hover:bg-accent hover:text-primary",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-background disabled:hover:text-muted-foreground",
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
                "flex-1 h-11 rounded-lg font-semibold text-primary-foreground shadow-md transition-all duration-300",
                "bg-primary",
                "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
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
                "flex-1 h-11 rounded-lg font-semibold text-primary-foreground shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                "bg-primary",
                "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
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
