"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface DurationOption {
  value: 15 | 30;
  label: string;
  discount?: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { value: 15, label: "15 Days" },
  { value: 30, label: "30 Days", discount: "SAVE 15%" },
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
    <div className="grid grid-cols-2 gap-4">
      {DURATION_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center justify-center p-5 rounded-2xl bg-white transition-all duration-500 border-2",
            value === option.value
              ? "border-[#FF6B35] shadow-[0_4px_20px_rgba(255,107,53,0.2)]"
              : "border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#FF6B35]/30 hover:shadow-[0_4px_20px_rgba(255,107,53,0.1)] hover:-translate-y-0.5",
            disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
          )}
        >
          {option.discount && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35]/10 text-[#FF6B35]">
              {option.discount}
            </span>
          )}
          <span
            className={cn(
              "text-2xl font-bold mb-1 transition-colors duration-300",
              value === option.value ? "text-[#FF6B35]" : "text-gray-900",
            )}
          >
            {option.value}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Days
          </span>
          {value === option.value && (
            <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] shadow-md">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
