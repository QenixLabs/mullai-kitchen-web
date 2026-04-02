"use client";

import { FaCalendarAlt } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    description: "Standard commitment. Perfect for maintaining routines.",
    badge: "",
    badgeType: "standard",
  },
  {
    value: 30,
    label: "30 Days",
    description: "Full monthly cycle. Best value for dedicated athletes.",
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
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "relative flex h-auto flex-col rounded-2xl border p-5 text-left transition-all duration-200",
            value === option.value
              ? "border-2 border-primary bg-white shadow-[0_6px_16px_rgba(37,10,17,0.08)]"
              : option.value === 30
                ? "border-[#E6DFE2] bg-[#F8F2F3] hover:border-[#D7CBD0] hover:bg-[#F8F2F3]"
                : "border-[#E6DFE2] bg-[#F9F7F8] hover:border-[#D7CBD0] hover:bg-[#F9F7F8]",
            disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-md bg-[#EFE8EB] p-2 text-primary">
              <FaCalendarAlt className="h-3.5 w-3.5" />
            </div>
            {option.badge && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                  option.badgeType === "discount"
                    ? "bg-[#16A34A] text-white"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {option.badge}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p
              className="text-[18px] font-bold leading-none text-[#321118]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {option.label}
            </p>
            <p
              className="mt-2 text-sm leading-snug text-[#7A7074]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {option.description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
}
