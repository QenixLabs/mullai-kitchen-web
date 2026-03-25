import { addWeeks, addDays, parseISO, format } from "date-fns";

// ===========================================
// Pricing Constants
// ===========================================

export const DEFAULT_VEG_PRICE = 120;
export const DEFAULT_NONVEG_PRICE = 150;
export const DEFAULT_DELIVERY_CHARGE = 50;
export const DEFAULT_TAX_RATE = 0.05; // 5%

// ===========================================
// Types
// ===========================================

export interface PricingBreakdown {
  vegMeals: number;
  nonvegMeals: number;
  vegAmount: number;
  nonvegAmount: number;
  deliveryTotal: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
}

// ===========================================
// Pricing Functions
// ===========================================

/**
 * Counts the number of delivery days between start and end dates
 * based on the selected weekdays.
 */
export function computeDeliveryDays(
  selectedDays: string[],
  startDate: string,
  durationWeeks: number,
): number {
  const start = parseISO(startDate);
  const endDate = addDays(addWeeks(start, durationWeeks), -1);
  const current = new Date(start);
  let count = 0;

  while (current <= endDate) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "long" });
    if (selectedDays.includes(dayName)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Computes the end date given a start date and duration in weeks.
 * Returns null if inputs are invalid.
 */
export function computeEndDate(
  startDate: string,
  durationWeeks: number,
): string | null {
  if (!startDate || durationWeeks <= 0) return null;

  try {
    const start = parseISO(startDate);
    if (isNaN(start.getTime())) return null;

    const endDate = addDays(addWeeks(start, durationWeeks), -1);
    return format(endDate, "yyyy-MM-dd");
  } catch {
    return null;
  }
}

/**
 * Computes the full pricing breakdown for a corporate order.
 */
export function computePricing(params: {
  vegCount: number;
  nonvegCount: number;
  mealTypesCount: number;
  totalDeliveryDays: number;
}): PricingBreakdown {
  const { vegCount, nonvegCount, mealTypesCount, totalDeliveryDays } = params;

  const vegMeals = vegCount * totalDeliveryDays;
  const nonvegMeals = nonvegCount * totalDeliveryDays;

  const vegAmount = vegMeals * DEFAULT_VEG_PRICE;
  const nonvegAmount = nonvegMeals * DEFAULT_NONVEG_PRICE;

  const deliveryTotal = totalDeliveryDays * DEFAULT_DELIVERY_CHARGE;

  const subtotal = vegAmount + nonvegAmount + deliveryTotal;
  const tax = subtotal * DEFAULT_TAX_RATE;
  const grandTotal = subtotal + tax;

  return {
    vegMeals,
    nonvegMeals,
    vegAmount,
    nonvegAmount,
    deliveryTotal,
    subtotal,
    tax,
    grandTotal,
  };
}
