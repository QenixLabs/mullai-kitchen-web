"use client";

import { cn } from "@/lib/utils";

interface PreferenceToggleProps {
  value: "VEG" | "NON_VEG" | null;
  onChange: (value: "VEG" | "NON_VEG") => void;
  vegPrice: number;
  nonvegPrice: number;
  disabled?: boolean;
}

export function PreferenceToggle({
  value,
  onChange,
  vegPrice,
  nonvegPrice,
  disabled = false,
}: PreferenceToggleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange("VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 border-2 font-bold",
          value === "VEG"
            ? "border-[#FF6B35] bg-white ring-1 ring-[#FF6B35]"
            : "border-gray-50 bg-[#F8FAFC] hover:border-gray-200",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-50",
        )}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-gray-900">Veg (₹{vegPrice}/meal)</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("NON_VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 border-2 font-bold",
          value === "NON_VEG"
            ? "border-[#FF6B35] bg-white ring-1 ring-[#FF6B35]"
            : "border-gray-50 bg-[#F8FAFC] hover:border-gray-200",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-50",
        )}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-gray-900">Non-Veg (₹{nonvegPrice}/meal)</span>
      </button>
    </div>
  );
}
