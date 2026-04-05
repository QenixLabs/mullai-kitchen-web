"use client";

import { cn } from "@/lib/utils";
import { Check, Sunrise, Sun, Moon } from "lucide-react";

interface MealTypeCardProps {
  type: "Breakfast" | "Lunch" | "Dinner";
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

const MEAL_CONFIG = {
  Breakfast: {
    label: "BREAKFAST",
    time: "7:00 AM - 8:30 AM",
    icon: Sunrise,
  },
  Lunch: {
    label: "LUNCH",
    time: "11:30 AM - 1:00 PM",
    icon: Sun,
  },
  Dinner: {
    label: "DINNER",
    time: "6:30 PM - 8:00 PM",
    icon: Moon,
  },
} as const;

export function MealTypeCard({ type, selected, onToggle }: MealTypeCardProps) {
  const config = MEAL_CONFIG[type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      className={cn(
        "relative flex w-full flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all sm:gap-3 sm:p-4",
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
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 hidden sm:block">Delivered</p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground">{config.time}</p>
      </div>
    </button>
  );
}
