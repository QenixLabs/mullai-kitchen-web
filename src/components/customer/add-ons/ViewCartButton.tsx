"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCartButtonProps {
  itemCount: number;
  onClick: () => void;
  disabled?: boolean;
}

export function ViewCartButton({
  itemCount,
  onClick,
  disabled = false,
}: ViewCartButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || itemCount === 0}
      className={cn(
        "relative gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
        itemCount > 0
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          : "bg-muted text-muted-foreground cursor-not-allowed"
      )}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>View Cart</span>
      {itemCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary px-1.5">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
