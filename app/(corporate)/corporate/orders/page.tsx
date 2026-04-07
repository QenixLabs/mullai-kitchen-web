"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusCircle,
  ClipboardList,
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
import { useCurrentUser } from "@/hooks/useUserStore";
import { OrderCard, OrderCardSkeleton } from "@/components/corporate/OrderCard";
import { OrdersFilterTabs } from "@/components/corporate/OrdersFilterTabs";
import { NewOrderCycleCard } from "@/components/corporate/NewOrderCycleCard";

const ORDERS_PER_PAGE = 3;
const ORDERS_FIRST_PAGE = 2; // First page has create card + 2 orders

function OrdersPageContent() {
  const router = useRouter();
  const user = useCurrentUser();
  const searchParams = useSearchParams();

  // Read initial status from URL query params (e.g., ?status=active)
  const initialStatus = searchParams.get("status") || "all";

  // Fetch all orders
  const { data: orders, isLoading, error, refetch } = useCorporateOrders();

  // Filter state
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    let result = orders ?? [];

    // Filter by status
    if (activeStatus !== "all") {
      result = result.filter((order) => order.status === activeStatus);
    }

    return result;
  }, [orders, activeStatus]);

  // Pagination - first page shows 2 orders (plus create card = 3 total), other pages show 3 orders
  const totalOrderPages = Math.max(1, Math.ceil((filteredOrders.length - ORDERS_FIRST_PAGE) / ORDERS_PER_PAGE) + 1);
  const paginatedOrders = useMemo(() => {
    if (currentPage === 1) {
      // First page: show first 2 orders
      return filteredOrders.slice(0, ORDERS_FIRST_PAGE);
    }
    // Other pages: show 3 orders, offset by the 2 shown on first page
    const start = ORDERS_FIRST_PAGE + (currentPage - 2) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Calculate counts for filter tabs
  const counts = useMemo(() => {
    const all = orders?.length ?? 0;
    const active = orders?.filter((o) => o.status === "active").length ?? 0;
    const pendingPayment = orders?.filter((o) => o.status === "pending_payment").length ?? 0;
    const processing = orders?.filter((o) => o.status === "draft").length ?? 0;
    const completed = orders?.filter((o) => o.status === "completed").length ?? 0;
    return { all, active, pendingPayment, processing, completed };
  }, [orders]);

  const handleStatusChange = useCallback((status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]" style={{ fontFamily: "Inter, sans-serif" }}>
              Orders Management
            </h1>
            <p className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>
              Manage your corporate orders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              onClick={() => router.push("/corporate/create-order")}
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:px-6"
            >
              Create New Order
            </Button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm relative">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user?.name ?? "Profile"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name
                    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                    : "U"}
                </div>
              )}
            </div>
          </div>
        </div>
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
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]" style={{ fontFamily: "Inter, sans-serif" }}>
              Orders Management
            </h1>
            <p className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>
              Manage your corporate orders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              onClick={() => router.push("/corporate/create-order")}
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:px-6"
            >
              Create New Order
            </Button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm relative">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user?.name ?? "Profile"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name
                    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                    : "U"}
                </div>
              )}
            </div>
          </div>
        </div>
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
            className="gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
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

    if (totalOrderPages <= 7) {
      for (let i = 1; i <= totalOrderPages; i++) {
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
    const end = Math.min(totalOrderPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalOrderPages - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
    pages.push(totalOrderPages);

    return pages;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]" style={{ fontFamily: "Inter, sans-serif" }}>
            Orders Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>
            Manage your corporate orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Button
            onClick={() => router.push("/corporate/create-order")}
            className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:px-6"
          >
            Create New Order
          </Button>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm relative">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user?.name ?? "Profile"}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {user?.name
                  ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                  : "U"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <OrdersFilterTabs
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
          counts={counts}
        />
      </div>

      {/* Orders grid or empty state */}
      {filteredOrders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Order Cycle Card - Always first, only on page 1 */}
            {currentPage === 1 && <NewOrderCycleCard />}

            {/* Order Cards */}
            {paginatedOrders.map((order) => (
              <OrderCard key={order._id} order={order} variant="full" />
            ))}
          </div>

          {/* Pagination */}
          {totalOrderPages > 1 && (
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
                        setCurrentPage((p) => Math.min(totalOrderPages, p + 1));
                      }}
                      className={cn(
                        currentPage === totalOrderPages &&
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
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 shadow-sm sm:py-20 lg:py-24">
          <div className="p-5 rounded-full bg-muted mb-6 text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
          </div>
            <h3 className="text-2xl font-bold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-8 text-center">
              Create your first bulk order to get started.
            </p>
            <Button
              onClick={() => router.push("/corporate/create-order")}
              size="lg"
              className="gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Order
            </Button>
          </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {/* Header Skeleton */}
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-10 w-64 mb-2 rounded-xl" />
              <Skeleton className="h-5 w-48 rounded-lg" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
