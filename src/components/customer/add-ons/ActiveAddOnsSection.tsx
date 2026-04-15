"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, Clock } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useActiveAddOnOrders } from "@/api/hooks/useAddons";
import type { AddOnOrderStatus } from "@/api/types/addons.types";

interface ActiveAddOnsSectionProps {
  subscriptionId: string;
}

const statusConfig: Record<
  AddOnOrderStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  PREPARING: { label: "Preparing", bg: "bg-blue-100", text: "text-blue-700" },
  READY: { label: "Ready", bg: "bg-purple-100", text: "text-purple-700" },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  DELIVERED: { label: "Delivered", bg: "bg-gray-100", text: "text-gray-700" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" },
};

export function ActiveAddOnsSection({
  subscriptionId,
}: ActiveAddOnsSectionProps) {
  const { data, isLoading, error } = useActiveAddOnOrders(subscriptionId);
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Add-ons</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.orders.length === 0) {
    return null;
  }

  const activeOrders = data.orders.filter(
    (order) =>
      order.status !== "DELIVERED" &&
      order.status !== "CANCELLED"
  );

  const filteredOrders = activeOrders.filter((order) => {
    const orderDate = new Date(order.delivery_date).toISOString().split("T")[0];
    return orderDate === filterDate;
  });

  if (activeOrders.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Active Add-ons
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 w-fit">
          <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground"
          />
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <p className="text-sm text-muted-foreground">
            No active add-ons for {formatDate(filterDate)}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <Card
                key={order._id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(order.delivery_date)}
                      </p>
                      <p className="text-lg font-bold mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(status.bg, status.text, "text-xs")}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.item_id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Clock className="h-3 w-3" />
                    Order #{order.order_id.slice(-6)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
