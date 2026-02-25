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
            "relative flex flex-col items-start p-6 rounded-2xl bg-white transition-all duration-300 border-2 text-left",
            value === option.value
              ? "border-[#FF6B35] bg-white ring-1 ring-[#FF6B35]"
              : "border-gray-100 hover:border-gray-300",
            disabled && "opacity-50 cursor-not-allowed hover:border-gray-100",
          )}
        >
          <div className="flex w-full items-center justify-between mb-2">
            <span className="text-xl font-bold text-gray-900">
              {option.label}
            </span>
            {option.badge && (
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  option.badgeType === "discount"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {option.badge}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
            {option.description}
          </p>

          {value === option.value && (
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg border-2 border-white">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
