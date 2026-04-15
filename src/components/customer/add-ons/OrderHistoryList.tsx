"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderHistoryCard, OrderHistoryCardSkeleton } from "./OrderHistoryCard";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { useAddOnOrderHistory } from "@/api/hooks/useAddons";
import { FaClipboardList, FaExclamationCircle } from "react-icons/fa";
import type { AddOnOrderHistoryOrder } from "@/api/types/addons.types";

type OrderTab = "ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED";

const tabs: { key: OrderTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const tabStatusMap: Record<OrderTab, string | undefined> = {
  ALL: undefined,
  ACTIVE: "Pending,Confirmed,Preparing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const PAGE_SIZE = 10;

export function OrderHistoryList() {
  const [activeTab, setActiveTab] = useState<OrderTab>("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AddOnOrderHistoryOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const status = tabStatusMap[activeTab];
  const { data, isLoading, error } = useAddOnOrderHistory({ page, limit: PAGE_SIZE, status });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleTabChange = (tab: OrderTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleViewDetails = (order: AddOnOrderHistoryOrder) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  return (
    <div>
      {/* Tab filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderHistoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="py-16 text-center border-2 border-dashed border-destructive/30 rounded-2xl bg-destructive/5">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive inline-flex mb-4">
            <FaExclamationCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Orders</h3>
          <p className="text-muted-foreground max-w-md mx-auto px-4 mb-6">
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </p>
          <Button variant="outline" onClick={() => setActiveTab("ALL")}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <FaClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p className="text-muted-foreground mx-auto px-4">
            {activeTab === "ALL"
              ? "You haven't placed any add-on orders yet."
              : `No ${activeTab.toLowerCase()} orders found.`}
          </p>
        </div>
      )}

      {/* Order cards */}
      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderHistoryCard
                key={order._id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
