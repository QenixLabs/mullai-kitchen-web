"use client";

import { FileText, Pencil, X, Loader2, PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OrderActionsBarProps {
  order: ICorporateOrder;
  hasFinalInvoice: boolean;
  onCancelClick: () => void;
  onModifyClick: () => void;
  onViewInvoicesClick: () => void;
  onGenerateFinalInvoice: () => void;
  isGeneratingFinal: boolean;
}

export function OrderActionsBar({
  order,
  hasFinalInvoice,
  onCancelClick,
  onModifyClick,
  onViewInvoicesClick,
  onGenerateFinalInvoice,
  isGeneratingFinal,
}: OrderActionsBarProps) {
  const { status } = order;
  const isActive = status === "active";
  const isPendingPayment = status === "pending_payment";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  // Cancelled orders show minimal bar
  if (isCancelled) {
    return (
      <div className="sticky bottom-0 z-40 mt-8 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Order {order.order_id} &middot;{" "}
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-40 mt-8 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: order info (hidden on mobile to save space) */}
        <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
          Order {order.order_id} &middot;{" "}
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile: show order status + more menu */}
          <div className="flex items-center gap-2 sm:hidden">
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Active actions */}
          {isActive && (
            <>
              <Button
                size="sm"
                className="gap-1.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-md shadow-primary/20 text-xs sm:text-sm"
                onClick={onModifyClick}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Modify Meals</span>
                <span className="sm:hidden">Modify</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs sm:text-sm"
                onClick={onViewInvoicesClick}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Invoices</span>
                <span className="sm:hidden">Invoices</span>
              </Button>

              {/* Desktop: Cancel button inline */}
              <div className="hidden sm:block">
                <Separator orientation="vertical" className="h-6 inline-block mx-1 align-middle" />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 rounded-xl text-xs sm:text-sm hidden sm:inline-flex"
                onClick={onCancelClick}
              >
                <X className="h-3.5 w-3.5" />
                Cancel Order
              </Button>

              {/* Mobile: Cancel in dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={onCancelClick}
                      className="text-destructive focus:text-destructive gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          {/* Pending Payment actions */}
          {isPendingPayment && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs sm:text-sm"
                onClick={onViewInvoicesClick}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Invoices</span>
                <span className="sm:hidden">Invoices</span>
              </Button>

              <div className="hidden sm:block">
                <Separator orientation="vertical" className="h-6 inline-block mx-1 align-middle" />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 rounded-xl text-xs sm:text-sm hidden sm:inline-flex"
                onClick={onCancelClick}
              >
                <X className="h-3.5 w-3.5" />
                Cancel Order
              </Button>

              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={onCancelClick}
                      className="text-destructive focus:text-destructive gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          {/* Completed actions */}
          {isCompleted && (
            <>
              {!hasFinalInvoice && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-md shadow-primary/20 text-xs sm:text-sm"
                  onClick={onGenerateFinalInvoice}
                  disabled={isGeneratingFinal}
                >
                  {isGeneratingFinal ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Generate Final Invoice</span>
                  <span className="sm:hidden">Final Invoice</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs sm:text-sm"
                onClick={onViewInvoicesClick}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Invoices</span>
                <span className="sm:hidden">Invoices</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
