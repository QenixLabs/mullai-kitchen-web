import { cn } from "@/lib/utils";
import type { PaymentMethod } from "../_hooks/types";

interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function PaymentOption({
  label,
  subtitle,
  icon,
  badge,
  selected,
  disabled = false,
  onClick,
}: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
        disabled
          ? "cursor-not-allowed opacity-50"
          : selected
            ? "border-border bg-muted/60"
            : "border-gray-200 bg-white hover:border-border",
      )}
    >
      {/* Radio circle */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className="flex shrink-0 items-center justify-center">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {badge}
    </button>
  );
}
