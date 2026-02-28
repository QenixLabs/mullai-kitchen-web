"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface DurationOption {
  value: 15 | 30;
  label: string;
  description: string;
  badge?: string;
  badgeType?: "standard" | "discount";
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    value: 15,
    label: "15 Days",
    description: "Perfect for a short commitment and trial.",
    badge: "Standard",
    badgeType: "standard",
  },
  {
    value: 30,
    label: "30 Days",
    description: "Our most popular plan for long-term health.",
    badge: "SAVE 15%",
    badgeType: "discount",
  },
];

interface DurationSelectorProps {
  value: 15 | 30 | null;
  onChange: (value: 15 | 30) => void;
  disabled?: boolean;
}

export function DurationSelector({
  value,
  onChange,
  disabled = false,
}: DurationSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {DURATION_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-start p-6 rounded-lg bg-background transition-all duration-300 border-2 text-left",
            value === option.value
              ? "border-primary shadow-sm"
              : "border-border hover:border-border",
            disabled && "opacity-50 cursor-not-allowed hover:border-border",
          )}
        >
          <div className="flex w-full items-center justify-between mb-2.5">
            <span className="text-xl font-bold text-foreground">
              {option.label}
            </span>
            {option.badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  option.badgeType === "discount"
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {option.badge}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-56">
            {option.description}
          </p>

          {value === option.value && (
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg border-2 border-background">
              <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={4} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
