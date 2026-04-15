import type { AddOnOrderStatus, MealType } from "@/api/types/addons.types";

export const statusConfig: Record<AddOnOrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  CONFIRMED: { label: "Confirmed", bg: "bg-emerald-100", text: "text-emerald-700" },
  PREPARING: { label: "Preparing", bg: "bg-blue-100", text: "text-blue-700" },
  READY: { label: "Ready", bg: "bg-purple-100", text: "text-purple-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "bg-orange-100", text: "text-orange-700" },
  DELIVERED: { label: "Delivered", bg: "bg-gray-100", text: "text-gray-700" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" },
};

export const mealTypeLabel: Record<MealType, string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Dinner: "Dinner",
};

/** Normalize backend Title Case status to UPPERCASE for config lookup */
export function normalizeStatus(status: string): AddOnOrderStatus {
  return status.toUpperCase() as AddOnOrderStatus;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}
