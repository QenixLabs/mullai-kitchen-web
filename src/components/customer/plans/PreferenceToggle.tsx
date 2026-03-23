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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Veg Option */}
      <button
        type="button"
        onClick={() => onChange("VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 border-2",
          value === "VEG"
            ? "border-emerald-500 bg-emerald-50/30 shadow-lg"
            : "border-gray-200 bg-white hover:border-gray-300 shadow-sm",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
        )}
      >
        {/* Veg Icon - Green Square with Circle inside */}
        <div className="relative flex items-center justify-center">
          <div className={cn(
            "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
            value === "VEG"
              ? "border-emerald-500 bg-white"
              : "border-emerald-500 bg-white"
          )}>
            {value === "VEG" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
          </div>
        </div>
        <span className="font-semibold text-emerald-600">Veg</span>
        <span className="text-gray-400 text-sm">(₹{vegPrice}/meal)</span>
      </button>

      {/* Non-Veg Option */}
      <button
        type="button"
        onClick={() => onChange("NON_VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 border-2",
          value === "NON_VEG"
            ? "border-red-500 bg-red-50/30 shadow-lg"
            : "border-gray-200 bg-white hover:border-gray-300 shadow-sm",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
        )}
      >
        {/* Non-Veg Icon - Red Square with Circle inside */}
        <div className="relative flex items-center justify-center">
          <div className={cn(
            "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
            value === "NON_VEG"
              ? "border-red-500 bg-white"
              : "border-red-500 bg-white"
          )}>
            {value === "NON_VEG" && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
          </div>
        </div>
        <span className="font-semibold text-red-600">Non-veg</span>
        <span className="text-gray-400 text-sm">(₹{nonvegPrice}/meal)</span>
      </button>
    </div>
  );
}
