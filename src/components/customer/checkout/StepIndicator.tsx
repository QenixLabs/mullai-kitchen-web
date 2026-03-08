import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
}

export function StepIndicator({ step, label, active }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
          active
            ? "bg-primary text-white shadow-primary"
            : "border-2 border-gray-300 bg-white text-muted-foreground",
        )}
      >
        {step}
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
