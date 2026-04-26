"use client";

import { useState } from "react";
import {
  FaBuilding,
  FaCalendarDay,
  FaCheck,
  FaCircleNotch,
  FaExternalLinkAlt,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

import { MissedReasonDialog } from "@/components/delivery/MissedReasonDialog";
import { Button } from "@/components/ui/button";
import { useUpdateStop } from "@/api/hooks/useDeliveryRoutes";
import type {
  DeliveryOrderLine,
  DeliveryOrderType,
  DeliveryRouteStatus,
  DeliveryStop,
} from "@/api/types/delivery.types";
import { cn } from "@/lib/utils";

interface StopCardProps {
  stop: DeliveryStop;
  routeId: string;
  routeStatus: DeliveryRouteStatus;
}

/** Visual ring + accent per stop rollup status. */
const STOP_RING: Record<DeliveryStop["status"], string> = {
  pending: "ring-1 ring-border",
  mixed: "ring-2 ring-amber-400",
  all_delivered: "ring-2 ring-green-500",
  all_missed: "ring-2 ring-destructive",
};

const STOP_HEADER_ICON: Record<DeliveryStop["status"], React.ReactNode> = {
  pending: null,
  mixed: <FaCircleNotch className="text-amber-500" aria-hidden />,
  all_delivered: <FaCheck className="text-green-600" aria-hidden />,
  all_missed: <FaTimes className="text-destructive" aria-hidden />,
};

const ORDER_TYPE_ICON: Record<DeliveryOrderType, React.ReactNode> = {
  daily: <FaCalendarDay aria-hidden />,
  addon: <FaPlus aria-hidden />,
  corporate: <FaBuilding aria-hidden />,
};

const ORDER_TYPE_LABEL: Record<DeliveryOrderType, string> = {
  daily: "Daily",
  addon: "Add-on",
  corporate: "Corporate",
};

export function StopCard({ stop, routeId, routeStatus }: StopCardProps) {
  const updateStop = useUpdateStop();

  // Track which order row is currently driving the missed-reason dialog.
  const [missedTarget, setMissedTarget] = useState<DeliveryOrderLine | null>(
    null,
  );

  const isPendingForOrder = (orderId: string) =>
    updateStop.isPending && updateStop.variables?.orderId === orderId;

  const handleDelivered = (order: DeliveryOrderLine) => {
    if (updateStop.isPending) return;
    updateStop.mutate({
      routeId,
      orderType: order.type,
      orderId: order.order_id,
      body: { status: "delivered" },
    });
  };

  const handleMissedSubmit = (reason: string) => {
    if (!missedTarget) return;
    updateStop.mutate(
      {
        routeId,
        orderType: missedTarget.type,
        orderId: missedTarget.order_id,
        body: { status: "missed", failure_reason: reason },
      },
      {
        onSuccess: () => setMissedTarget(null),
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm",
          STOP_RING[stop.status],
        )}
      >
        {/* Header: sequence + address + status icon */}
        <div className="flex items-start gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {stop.sequence}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p
              className="line-clamp-2 text-sm font-semibold text-foreground"
              title={stop.address_text}
            >
              {stop.address_text}
            </p>
          </div>
          {STOP_HEADER_ICON[stop.status] ? (
            <span className="mt-1 inline-flex size-6 items-center justify-center">
              {STOP_HEADER_ICON[stop.status]}
            </span>
          ) : null}
        </div>

        {/* Open in Google Maps */}
        <Button asChild variant="outline" size="sm" className="self-start">
          <a
            href={stop.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaExternalLinkAlt aria-hidden />
            <span>Open in Google Maps</span>
          </a>
        </Button>

        {/* Order rows */}
        <ul className="flex flex-col gap-2">
          {stop.orders.map((order) => (
            <OrderRow
              key={`${order.type}:${order.order_id}`}
              order={order}
              routeStatus={routeStatus}
              isPending={isPendingForOrder(order.order_id)}
              onDelivered={() => handleDelivered(order)}
              onMissed={() => setMissedTarget(order)}
            />
          ))}
        </ul>
      </div>

      <MissedReasonDialog
        open={Boolean(missedTarget)}
        onOpenChange={(open) => {
          if (!open) setMissedTarget(null);
        }}
        onSubmit={handleMissedSubmit}
        isPending={
          updateStop.isPending &&
          updateStop.variables?.orderId === missedTarget?.order_id
        }
        orderLabel={missedTarget?.customer_name}
      />
    </>
  );
}

interface OrderRowProps {
  order: DeliveryOrderLine;
  routeStatus: DeliveryRouteStatus;
  isPending: boolean;
  onDelivered: () => void;
  onMissed: () => void;
}

function OrderRow({
  order,
  routeStatus,
  isPending,
  onDelivered,
  onMissed,
}: OrderRowProps) {
  const status = order.status?.toUpperCase() ?? "";
  const subline = order.type === "corporate" ? order.company_name : order.meal_type;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
      <div className="flex items-start gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {ORDER_TYPE_ICON[order.type]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {order.customer_name}
            </p>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {ORDER_TYPE_LABEL[order.type]}
            </span>
          </div>
          {(subline || order.items_summary) && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {[subline, order.items_summary].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <OrderActions
        status={status}
        orderType={order.type}
        routeStatus={routeStatus}
        isPending={isPending}
        onDelivered={onDelivered}
        onMissed={onMissed}
      />
    </li>
  );
}

interface OrderActionsProps {
  status: string;
  orderType: DeliveryOrderType;
  routeStatus: DeliveryRouteStatus;
  isPending: boolean;
  onDelivered: () => void;
  onMissed: () => void;
}

/**
 * Determine whether the Delivered/Missed action buttons should render for an
 * order. Add-on orders use a different lifecycle on the server: when a route
 * starts they flip to PREPARING (not OUT_FOR_DELIVERY), so we treat that as
 * an actionable state for add-ons specifically.
 */
function isOrderActionable(
  status: string,
  orderType: DeliveryOrderType,
  routeStatus: DeliveryRouteStatus,
): boolean {
  if (routeStatus !== "IN_PROGRESS") return false;
  if (status === "OUT_FOR_DELIVERY") return true;
  if (orderType === "addon" && status === "PREPARING") return true;
  return false;
}

function OrderActions({
  status,
  orderType,
  routeStatus,
  isPending,
  onDelivered,
  onMissed,
}: OrderActionsProps) {
  if (status === "DELIVERED") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
        <FaCheck aria-hidden />
        <span>Delivered</span>
      </div>
    );
  }

  if (status === "MISSED" || status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
        <FaTimes aria-hidden />
        <span>{status === "MISSED" ? "Missed" : "Cancelled"}</span>
      </div>
    );
  }

  if (isOrderActionable(status, orderType, routeStatus)) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onMissed}
          disabled={isPending}
        >
          <FaTimes aria-hidden />
          Missed
        </Button>
        <Button
          size="sm"
          className="bg-green-600 text-white hover:bg-green-600/90"
          onClick={onDelivered}
          disabled={isPending}
        >
          {isPending ? (
            <FaCircleNotch className="animate-spin" aria-hidden />
          ) : (
            <FaCheck aria-hidden />
          )}
          Delivered
        </Button>
      </div>
    );
  }

  // LOCKED, PREPARING, or any other state pre-route-start.
  return (
    <div className="text-xs font-semibold text-muted-foreground">
      Pending
    </div>
  );
}
