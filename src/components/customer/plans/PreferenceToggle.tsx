"use client";

import { Leaf, Drumstick } from "lucide-react";

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
    <div
      className={cn(
        "inline-flex rounded-xl bg-gray-100 p-1.5 gap-1.5 transition-all duration-300",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <button
        type="button"
        onClick={() => onChange("VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
          value === "VEG"
            ? "bg-white text-[#FF6B35] shadow-md"
            : "text-gray-600 hover:text-gray-900",
          disabled && "pointer-events-none",
        )}
      >
        <Leaf className="w-4 h-4" strokeWidth={2.5} />
        <span>Veg</span>
        <span className="text-xs text-gray-400">₹{vegPrice}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("NON_VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
          value === "NON_VEG"
            ? "bg-white text-[#FF6B35] shadow-md"
            : "text-gray-600 hover:text-gray-900",
          disabled && "pointer-events-none",
        )}
      >
        <Drumstick className="w-4 h-4" strokeWidth={2.5} />
        <span>Non-Veg</span>
        <span className="text-xs text-gray-400">₹{nonvegPrice}</span>
      </button>
    </div>
  );
}
