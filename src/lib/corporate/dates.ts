import { startOfDay, parseISO } from "date-fns";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Generates an array of delivery dates between start and end dates
 * that fall on the selected weekdays.
 */
export function generateDeliveryDates(
  startDate: string,
  endDate: string,
  selectedDays: string[],
): Date[] {
  const dates: Date[] = [];
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));
  const current = new Date(start);

  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    if (selectedDays.includes(dayName)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
