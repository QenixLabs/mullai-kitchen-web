import { CalendarClock, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StartDatePlaceholderProps {
  className?: string;
}

export function StartDatePlaceholder({ className }: StartDatePlaceholderProps) {
  return (
    <Card className={cn("border-gray-200 bg-white py-5 shadow-sm", className)}>
      <CardHeader className="space-y-3 px-5 pb-0 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          Step 2: Start Date
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">Start date picker is coming soon</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Coming soon in Phase 2: pick your preferred start date with day-wise availability and cut-off validation.
        </p>

        <div className="rounded-lg border border-dashed border-muted bg-muted p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
            Planned enhancements
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>Disable unavailable delivery dates automatically</li>
            <li>Show cut-off windows for next-day starts</li>
            <li>Preview delivery cadence before payment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
