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
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 border-2 font-bold bg-background",
          value === "VEG"
            ? "border-primary shadow-sm"
            : "border-border hover:border-border",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
        )}
      >
        <div className="w-3 h-3 rounded-full bg-success" />
        <span className="text-foreground text-sm">Veg (₹{vegPrice}/meal)</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("NON_VEG")}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 border-2 font-bold bg-background",
          value === "NON_VEG"
            ? "border-primary shadow-sm"
            : "border-border hover:border-border",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
        )}
      >
        <div className="w-3 h-3 rounded-full bg-destructive" />
        <span className="text-foreground text-sm">
          Non-Veg (₹{nonvegPrice}/meal)
        </span>
      </button>
    </div>
  );
}
