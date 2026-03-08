import { FaCalendar, FaPiggyBank } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface OptOutSummaryProps {
  optOutDates: Date[];
  optOutDiscount: number;
  perDayPrice: number;
  maxOptOutDays: number;
  onClear: () => void;
  onModify: () => void;
}

export function OptOutSummary({
  optOutDates,
  optOutDiscount,
  perDayPrice,
  maxOptOutDays,
  onClear,
  onModify,
}: OptOutSummaryProps) {
  const sortedDates = [...optOutDates].sort((a, b) => a.getTime() - b.getTime());

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FaPiggyBank className="h-4 w-4 text-primary" />
          Skip Delivery Days
        </label>
        <span className="text-xs text-muted-foreground">
          Max {maxOptOutDays} days (50% of subscription)
        </span>
      </div>

      {optOutDates.length === 0 ? (
        // Empty state
        <button
          type="button"
          onClick={onModify}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FaCalendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Select days to skip</p>
              <p className="text-xs text-gray-500">
                Save ₹{perDayPrice.toFixed(0)} per day you opt out
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            Optional
          </Badge>
        </button>
      ) : (
        // Summary state
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FaPiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  ₹{optOutDiscount.toFixed(0)} savings
                </p>
                <p className="text-xs text-muted-foreground">
                  {optOutDates.length} day{optOutDates.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={onModify}
                className="text-xs font-medium text-primary hover:underline"
              >
                Modify
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortedDates.slice(0, 5).map((date, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="rounded-lg bg-white text-primary border-primary/20"
              >
                {format(date, "MMM d")}
              </Badge>
            ))}
            {sortedDates.length > 5 && (
              <Badge
                variant="secondary"
                className="rounded-lg bg-white text-muted-foreground border-border"
              >
                +{sortedDates.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
