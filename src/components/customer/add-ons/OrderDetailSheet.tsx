"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AddOnOrderHistoryOrder } from "@/api/types/addons.types";
import {
  statusConfig,
  mealTypeLabel,
  normalizeStatus,
  formatDate,
  formatCurrency,
} from "@/lib/addon-utils";

const defaultImage = "/images/addon/add-on.png";

interface OrderDetailSheetProps {
  order: AddOnOrderHistoryOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const normalized = order ? normalizeStatus(order.status) : "PENDING";
  const config = statusConfig[normalized] ?? statusConfig.PENDING;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {order && (
        <SheetContent className="w-full max-w-96! px-5 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg">Order Details</SheetTitle>
          </SheetHeader>

          {/* Order ID + Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-sm text-muted-foreground">
                {order.order_id}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Placed: {formatDate(order.created_at)}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`${config.bg} ${config.text} border-0 text-xs font-medium`}
            >
              {config.label}
            </Badge>
          </div>

          <Separator className="mb-4" />

          {/* Delivery info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Date</span>
              <span className="font-medium">
                {formatDate(order.delivery_date)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meal Type</span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {mealTypeLabel[order.meal_type] ?? order.meal_type}
              </span>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Itemized list */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold">Items</h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <Image
                    src={item.image || defaultImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-foreground ml-2 whitespace-nowrap">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
