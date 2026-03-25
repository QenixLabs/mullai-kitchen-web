"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useCorporateOrders } from "@/api/hooks/useCorporate";
import { CorporatePageHeader } from "@/components/corporate/CorporatePageHeader";
import { OrderCard, OrderCardSkeleton } from "@/components/corporate/OrderCard";
import { OrderFilters } from "@/components/corporate/OrderFilters";

const ORDERS_PER_PAGE = 6;

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial status from URL query params (e.g., ?status=active)
  const initialStatus = searchParams.get("status") || "all";
  const initialPayment = searchParams.get("payment");

  // Fetch all orders
  const { data: orders, isLoading, error, refetch } = useCorporateOrders();

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive initial activeStatus from payment param if status is "all"
  // (e.g., ?payment=pending,overdue could pre-filter to show orders needing attention)
  const effectiveActiveStatus = initialPayment && initialStatus === "all"
    ? activeStatus
    : activeStatus;

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    let result = orders ?? [];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) =>
        order.order_id.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (effectiveActiveStatus !== "all") {
      result = result.filter((order) => order.status === effectiveActiveStatus);
    }

    return result;
  }, [orders, searchQuery, effectiveActiveStatus]);

  // Client-side sorting
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];

    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "amount_high":
        sorted.sort((a, b) => b.final_amount - a.final_amount);
        break;
      case "amount_low":
        sorted.sort((a, b) => a.final_amount - b.final_amount);
        break;
    }

    return sorted;
  }, [filteredOrders, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return sortedOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [sortedOrders, currentPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CorporatePageHeader
          icon={ClipboardList}
          title="Orders"
          subtitle="Manage your corporate orders"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CorporatePageHeader
          icon={ClipboardList}
          title="Orders"
          subtitle="Manage your corporate orders"
        />
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Failed to Load Orders</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            {error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."}
          </p>
          <Button
            onClick={() => refetch()}
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
          >
            <RefreshCw className="h-5 w-5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Build pagination page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CorporatePageHeader
        icon={ClipboardList}
        title="Orders"
        subtitle="Manage your corporate orders"
        action={{
          label: "Create New Order",
          onClick: () => router.push("/corporate/create-order"),
          icon: PlusCircle,
        }}
      />

      {/* Filters */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        orders={orders ?? []}
      />

      {/* Orders grid or empty state */}
      {paginatedOrders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOrders.map((order) => (
              <OrderCard key={order._id} order={order} variant="full" />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="p-5 rounded-2xl bg-muted/50 mb-6 text-muted-foreground">
              <ClipboardList className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              {searchQuery
                ? "No orders match your search."
                : "Create your first bulk order to get started."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/corporate/create-order")}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
              >
                <PlusCircle className="h-5 w-5" />
                Create New Order
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-4 rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
