"use client";

import { cn } from "@/lib/utils";
import { Check, CalendarClock, Calendar, CalendarRange } from "lucide-react";
import type { BillingCycleDays } from "@/lib/validations/corporate.schema";

interface BillingCycleCardProps {
  days: BillingCycleDays;
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

const CYCLE_CONFIG = {
  7: { label: "WEEKLY", description: "Every 7 days", icon: CalendarClock },
  30: { label: "MONTHLY", description: "Every 30 days", icon: Calendar },
  90: { label: "QUARTERLY", description: "Every 90 days", icon: CalendarRange },
} as const;

export function BillingCycleCard({ days, selected, onToggle }: BillingCycleCardProps) {
  const config = CYCLE_CONFIG[days];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      className={cn(
        "relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all",
        "min-w-22.5 sm:min-w-25 flex-1 sm:flex-none",
        selected
          ? "bg-card border-primary"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
        </div>
      )}
      <div className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
        selected ? "bg-primary/10" : "bg-muted"
      )}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", selected ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-semibold text-foreground">{config.label}</p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{config.description}</p>
      </div>
    </button>
  );
}
