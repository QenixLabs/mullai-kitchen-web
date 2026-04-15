"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealType } from "@/api/types/addons.types";

interface CartItemProps {
  item: {
    item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    meal_type: MealType;
    image?: string;
  };
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  maxQuantity?: number;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  maxQuantity = 10,
}: CartItemProps) {
  const handleIncrement = () => {
    if (item.quantity < maxQuantity) {
      onQuantityChange(item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-foreground truncate">{item.name}</h4>
            <Badge variant="outline" className="mt-1 text-xs">
              {item.meal_type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity and Price */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center rounded-full border border-border bg-muted/50">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-l-full transition-colors",
                item.quantity > 1
                  ? "hover:bg-muted text-foreground"
                  : "text-muted-foreground cursor-not-allowed"
              )}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={item.quantity >= maxQuantity}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-r-full transition-colors",
                item.quantity < maxQuantity
                  ? "hover:bg-muted text-foreground"
                  : "text-muted-foreground cursor-not-allowed"
              )}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {formatPrice(item.subtotal)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(item.unit_price)} each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
