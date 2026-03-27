"use client";

import { cn } from "@/lib/utils";

interface QuickSplitButtonsProps {
  headcount: number;
  onSplit: (vegCount: number, nonvegCount: number) => void;
  activeSplit?: string;
}

const SPLITS = [
  { id: "all-veg", label: "All Veg", getCounts: (h: number) => [h, 0] },
  { id: "all-nonveg", label: "All Non-veg", getCounts: (h: number) => [0, h] },
  { id: "50-50", label: "50-50 Split", getCounts: (h: number) => [Math.ceil(h / 2), Math.floor(h / 2)] },
  { id: "60-40", label: "60-40", getCounts: (h: number) => [Math.ceil(h * 0.6), Math.floor(h * 0.4)] },
  { id: "70-30", label: "70-30", getCounts: (h: number) => [Math.ceil(h * 0.7), Math.floor(h * 0.3)] },
] as const;

export function QuickSplitButtons({ headcount, onSplit, activeSplit }: QuickSplitButtonsProps) {
  if (headcount <= 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {SPLITS.map((split) => {
        const [veg, nonveg] = split.getCounts(headcount);
        const isActive = activeSplit === split.id;
        return (
          <button
            key={split.id}
            type="button"
            onClick={() => onSplit(veg, nonveg)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-foreground border-transparent hover:bg-muted/80"
            )}
          >
            {split.label}
          </button>
        );
      })}
    </div>
  );
}
