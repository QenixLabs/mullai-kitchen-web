"use client";

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
    description: "Perfect for short commitment and trial",
    badge: "Standard",
    badgeType: "standard",
  },
  {
    value: 30,
    label: "30 Days",
    description: "Our most popular plan for long-term health",
    badge: "Save 15%",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {DURATION_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "relative flex flex-col rounded-xl transition-all duration-200 text-left overflow-hidden",
            value === option.value
              ? "border-2 border-primary shadow-lg"
              : "border border-gray-200 bg-white hover:border-gray-300 shadow-sm",
            disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
          )}
        >
          {/* Header with Label and Badge */}
          <div className="flex w-full items-center justify-between p-4 pb-3">
            <span
              className="text-xl font-bold text-primary"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {option.label}
            </span>
            {option.badge && (
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  option.badgeType === "discount"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {option.badge}
              </span>
            )}
          </div>

          {/* Divider Line */}
          <div
            className={cn(
              "w-full h-px",
              value === option.value ? "bg-primary/20" : "bg-gray-200",
            )}
          />

          {/* Description with background */}
          <div
            className={cn(
              "p-4 pt-3",
              value === option.value ? "bg-primary/5" : "bg-white",
            )}
          >
            <p
              className="text-sm text-gray-500 leading-snug"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {option.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
