import { format, parseISO } from "date-fns";

/**
 * Formats a date string into a human-readable format.
 * Example: "2026-03-25" -> "Mar 25, 2026"
 */
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM dd, yyyy");
}
