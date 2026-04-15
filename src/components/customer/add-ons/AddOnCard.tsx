"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AddOnItem } from "@/api/types/addons.types";

interface AddOnCardProps {
  item: AddOnItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  disabled?: boolean;
}

export function AddOnCard({
  item,
  quantity,
  onQuantityChange,
  onAddToCart,
  disabled = false,
}: AddOnCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleIncrement = () => {
    if (quantity < (item.max_quantity_per_order || 10)) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const defaultImage = "/images/addon/add-on.png";
  const imageUrl = item.image || defaultImage;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white transition-all duration-200",
        disabled && "opacity-60"
      )}
    >
      <CardContent className="p-0">
        {/* Image Container - Full width, no gaps, edge to edge */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />

          {/* Veg/Non-Veg Badge */}
          {item.is_veg !== undefined && (
            <div
              className={cn(
                "absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white shadow-sm",
                item.is_veg
                  ? "border-green-500 text-green-500"
                  : "border-red-500 text-red-500"
              )}
            >
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  item.is_veg ? "bg-green-500" : "bg-red-500"
                )}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 p-4 bg-white">
          {/* Name and Description */}
          <div className="space-y-1">
            <h3 className="font-semibold text-card-foreground line-clamp-1">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </span>
            {item.quantity && (
              <span className="text-xs text-muted-foreground">
                / {item.quantity}
              </span>
            )}
          </div>

          {/* Quantity Selector and Add Button */}
          <div className="flex items-center gap-3">
            {/* Quantity Controls */}
            <div className="flex items-center rounded-full border border-border bg-muted/50">
              <button
                onClick={handleDecrement}
                disabled={quantity === 0 || disabled}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-l-full transition-colors",
                  quantity > 0 && !disabled
                    ? "hover:bg-muted text-foreground"
                    : "text-muted-foreground cursor-not-allowed"
                )}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-8 w-10 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={
                  quantity >= (item.max_quantity_per_order || 10) || disabled
                }
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-r-full transition-colors",
                  quantity < (item.max_quantity_per_order || 10) && !disabled
                    ? "hover:bg-muted text-foreground"
                    : "text-muted-foreground cursor-not-allowed"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={quantity === 0 || disabled || isAdded}
              className={cn(
                "flex-1 rounded-full text-sm font-medium transition-all",
                isAdded
                  ? "bg-green-500 hover:bg-green-500"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isAdded ? (
                <>
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                "Add to Cart"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
