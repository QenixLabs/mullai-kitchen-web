import { format, startOfDay, addDays } from "date-fns";
import { generateDeliveryDates } from "./dates";
import type {
  ICorporateOrder,
  ICorporateOrderModification,
  ICorporateInvoice,
  ICorporateInvoiceLineItem,
} from "@/api/types/corporate.types";

/**
 * Compute the billing cycle end date.
 */
export function computeBillingCycleEnd(
  currentBillingStart: string,
  cycleDays: number,
): Date {
  return startOfDay(addDays(new Date(currentBillingStart), cycleDays));
}

/**
 * Check if the current billing cycle has completed.
 * Returns true if today is on or after the cycle end date.
 */
export function isBillingCycleComplete(
  currentBillingStart: string,
  cycleDays: number,
): boolean {
  const cycleEnd = computeBillingCycleEnd(currentBillingStart, cycleDays);
  const today = startOfDay(new Date());
  return today >= cycleEnd;
}

/**
 * Get the number of days remaining in the current billing cycle.
 * Returns 0 if the cycle has already completed.
 */
export function getDaysRemaining(
  currentBillingStart: string,
  cycleDays: number,
): number {
  const cycleEnd = computeBillingCycleEnd(currentBillingStart, cycleDays);
  const today = startOfDay(new Date());
  const diffMs = cycleEnd.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get a formatted display date for when the billing cycle ends.
 */
export function getCycleEndDisplayDate(
  currentBillingStart: string,
  cycleDays: number,
): string {
  const cycleEnd = computeBillingCycleEnd(currentBillingStart, cycleDays);
  return format(cycleEnd, "MMM dd, yyyy");
}

/**
 * Compute a real-time proforma invoice from order data + modifications.
 * Filters to approved + pending modifications.
 * Returns a synthetic ICorporateInvoice object.
 */
export function computeRealtimeProforma(
  order: ICorporateOrder,
  modifications: ICorporateOrderModification[],
): ICorporateInvoice {
  const cycleEnd = computeBillingCycleEnd(
    order.current_billing_start,
    order.billing_cycle_days,
  );

  // Delivery dates within this billing cycle
  const cycleDeliveryDates = generateDeliveryDates(
    order.current_billing_start,
    format(cycleEnd, "yyyy-MM-dd"),
    order.selected_days,
  );
  const deliveryDaysInCycle = cycleDeliveryDates.length;

  const mealsPerDay = order.meal_types.length;

  // Line items
  const vegQty = order.veg_count * mealsPerDay * deliveryDaysInCycle;
  const nonvegQty = order.nonveg_count * mealsPerDay * deliveryDaysInCycle;
  const vegAmount = vegQty * order.veg_price_per_meal;
  const nonvegAmount = nonvegQty * order.nonveg_price_per_meal;
  const deliveryAmount = deliveryDaysInCycle * order.delivery_charge_per_day;

  const lineItems: ICorporateInvoiceLineItem[] = [
    {
      description: `Veg Meals (${order.veg_count} pax, ${mealsPerDay} meal${mealsPerDay > 1 ? "s" : ""}/day)`,
      quantity: vegQty,
      unit_price: order.veg_price_per_meal,
      amount: vegAmount,
    },
    {
      description: `Non-Veg Meals (${order.nonveg_count} pax, ${mealsPerDay} meal${mealsPerDay > 1 ? "s" : ""}/day)`,
      quantity: nonvegQty,
      unit_price: order.nonveg_price_per_meal,
      amount: nonvegAmount,
    },
    {
      description: "Delivery Charges",
      quantity: deliveryDaysInCycle,
      unit_price: order.delivery_charge_per_day,
      amount: deliveryAmount,
    },
  ];

  // Filter to approved + pending modifications
  const activeMods = modifications.filter(
    (m) => m.status === "approved" || m.status === "pending",
  );

  const modificationsTable = activeMods.map((m) => ({
    date: m.modification_date,
    veg_change: m.veg_change,
    nonveg_change: m.nonveg_change,
    modification_amount: m.modification_amount,
  }));

  const subtotal = vegAmount + nonvegAmount + deliveryAmount;
  const totalModification = modificationsTable.reduce(
    (sum, m) => sum + m.modification_amount,
    0,
  );
  const taxableAmount = subtotal - totalModification;
  const taxAmount = Math.round(taxableAmount * (order.tax_rate / 100));
  const grandTotal = taxableAmount + taxAmount;

  return {
    _id: `proforma-live-${order._id}`,
    invoice_number: `PRO-LIVE-${order.order_id}`,
    corporate_order_id: order._id,
    company_name: order.company_name,
    outlet_name: order.outlet_name,
    type: "proforma",
    billing_period_start: order.current_billing_start,
    billing_period_end: format(cycleEnd, "yyyy-MM-dd"),
    line_items: lineItems,
    modifications: modificationsTable,
    subtotal,
    total_modification: totalModification,
    total_amount: subtotal - totalModification,
    tax_amount: taxAmount,
    grand_total: grandTotal,
    status: "pending",
    created_at: order.created_at,
  };
}
