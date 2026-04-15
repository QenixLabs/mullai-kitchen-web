"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AddOnOrderHistoryOrder } from "@/api/types/addons.types";
import { statusConfig, mealTypeLabel, normalizeStatus, formatDate, formatCurrency } from "@/lib/addon-utils";

const defaultImage = "/images/addon/add-on.png";

interface OrderHistoryCardProps {
  order: AddOnOrderHistoryOrder;
  onViewDetails: (order: AddOnOrderHistoryOrder) => void;
}

export function OrderHistoryCard({ order, onViewDetails }: OrderHistoryCardProps) {
  const normalized = normalizeStatus(order.status);
  const config = statusConfig[normalized] ?? statusConfig.PENDING;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{order.order_id}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(order.delivery_date)}
          </p>
        </div>
        <Badge variant="secondary" className={`${config.bg} ${config.text} border-0 text-xs font-medium`}>
          {config.label}
        </Badge>
      </div>

      {/* Meal type */}
      <div className="mb-3">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {mealTypeLabel[order.meal_type] ?? order.meal_type}
        </span>
      </div>

      {/* Items preview with thumbnails */}
      <div className="space-y-2 mb-3">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={item.image || defaultImage}
                alt={item.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="text-foreground truncate">
                {item.name} × {item.quantity}
              </span>
              <span className="text-muted-foreground ml-2 whitespace-nowrap">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-muted-foreground">
            +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <p className="text-sm font-semibold text-foreground">
          Total: {formatCurrency(order.total_amount)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 text-xs"
          onClick={() => onViewDetails(order)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

export function OrderHistoryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full mb-3" />
      <div className="space-y-2 mb-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-24" />
      </div>
    </div>
  );
}
