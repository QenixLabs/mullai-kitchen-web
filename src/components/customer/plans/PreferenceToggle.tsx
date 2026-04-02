"use client";

import { FaLeaf } from "react-icons/fa";
import { IoFastFood } from "react-icons/io5";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Veg Option */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange("VEG")}
        disabled={disabled}
        className={cn(
          "flex h-auto items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200",
          value === "VEG"
            ? "border-2 border-primary bg-white shadow-[0_4px_14px_rgba(37,10,17,0.08)]"
            : "border-[#E4DCE0] bg-[#F9F7F8] hover:border-[#D8CDD1] hover:bg-[#F9F7F8]",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
        )}
      >
        <div className="flex items-center gap-2">
          <FaLeaf className="h-4 w-4 text-[#1D8F4E]" />
          <span className="font-semibold text-[#1F7C47]">Veg</span>
        </div>
        <span className="text-xs font-semibold text-[#7A6F73]">₹{vegPrice} / meal</span>
      </Button>

      {/* Non-Veg Option */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange("NON_VEG")}
        disabled={disabled}
        className={cn(
          "flex h-auto items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200",
          value === "NON_VEG"
            ? "border-2 border-primary bg-white shadow-[0_4px_14px_rgba(37,10,17,0.08)]"
            : "border-[#E4DCE0] bg-[#F9F7F8] hover:border-[#D8CDD1] hover:bg-[#F9F7F8]",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
        )}
      >
        <div className="flex items-center gap-2">
          <IoFastFood className="h-4 w-4 text-[#A6323A]" />
          <span className="font-semibold text-[#3A1A21]">Non-Veg</span>
        </div>
        <span className="text-xs font-semibold text-[#7A6F73]">₹{nonvegPrice} / meal</span>
      </Button>
    </div>
  );
}
