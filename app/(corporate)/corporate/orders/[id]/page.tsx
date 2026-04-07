"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCorporateOrder,
  useCorporateModifications,
  useModifyCorporateOrder,
  useCorporateAllInvoices,
  useCancelCorporateOrder,
} from "@/api/hooks/useCorporate";
import { modifyCorporateOrderSchema, type ModifyCorporateOrderFormData } from "@/lib/validations/corporate.schema";
import { OverviewTab } from "@/components/corporate/order-detail/OverviewTab";
import { ScheduleTab } from "@/components/corporate/order-detail/ScheduleTab";
import { InvoicesTab } from "@/components/corporate/order-detail/InvoicesTab";
import { ModificationsTab } from "@/components/corporate/order-detail/ModificationsTab";
import { ModifyMealDialog, computeModification } from "@/components/corporate/order-detail/ModifyMealDialog";
import { CancelOrderDialog } from "@/components/corporate/order-detail/CancelOrderDialog";
import { OrderDetailHeader } from "@/components/corporate/order-detail/OrderDetailHeader";
import { generateDeliveryDates } from "@/lib/corporate/dates";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrderModification } from "@/api/types/corporate.types";

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft
} from "lucide-react";



function OrderDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <Skeleton className="h-10 w-48 mb-6 rounded-full" />
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <Skeleton className="h-32 flex-1 rounded-[2.5rem]" />
        <Skeleton className="h-32 w-48 rounded-[2.5rem]" />
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-2xl mb-8" />
      <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
    </div>
  );
}

const TABS_CONFIG = [
  { value: "overview", label: "Overview" },
  { value: "schedule", label: "Schedule" },
  { value: "invoices", label: "Invoices" },
  { value: "modifications", label: "Modifications" },
];

function OrderDetailPage() {
    const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const orderId = params.id;

  // Tab state from URL
  const tabParam = searchParams.get("tab");
  const defaultTab =
    tabParam === "schedule"
      ? "schedule"
      : tabParam === "invoices"
        ? "invoices"
        : tabParam === "modifications"
          ? "modifications"
          : "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/corporate/orders/${orderId}?tab=${value}`, { scroll: false });
  };

  // Data fetching
  const { data: order, isLoading, error } = useCorporateOrder(orderId);
  const { data: modifications } = useCorporateModifications(orderId);
  const { data: allInvoices, isLoading: isInvoicesLoading } = useCorporateAllInvoices(orderId);

  // Mutations
  const modifyMutation = useModifyCorporateOrder(orderId);
  const cancelMutation = useCancelCorporateOrder(orderId);

  // State
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedModifyDate, setSelectedModifyDate] = useState<Date | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [modVegChange, setModVegChange] = useState(0);
  const [modNonvegChange, setModNonvegChange] = useState(0);
  const [modReason, setModReason] = useState("");

  const modsList = modifications ?? [];

  // Build a set of dates that already have modifications
  const modifiedDatesSet = useMemo(() => {
    const set = new Set<string>();
    modsList.forEach((m) => {
      if (m.status === "approved" || m.status === "pending") {
        set.add(m.modification_date);
      }
    });
    return set;
  }, [modsList]);

  // Delivery dates
  const deliveryDates = useMemo(() => {
    if (!order) return [];
    return generateDeliveryDates(order.start_date, order.end_date, order.selected_days);
  }, [order]);

  // Get modification for a specific date
  const getModificationForDate = (date: Date): ICorporateOrderModification | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return modsList.find((m) => m.modification_date === dateStr);
  };

  // Open modification dialog for a date
  const handleDateClick = (date: Date) => {
    if (!order) return;

    const today = startOfDay(new Date());
    if (isBefore(date, today)) return;

    const existingMod = getModificationForDate(date);
    if (existingMod) {
      toast.info("This date already has a modification", {
        description: `Veg: ${existingMod.veg_change >= 0 ? '+' : ''}${existingMod.veg_change}, Non-veg: ${existingMod.nonveg_change >= 0 ? '+' : ''}${existingMod.nonveg_change}`,
      });
      return;
    }

    setSelectedModifyDate(date);
    setModVegChange(0);
    setModNonvegChange(0);
    setModReason("");
    setModifyDialogOpen(true);
  };

  // Auto-suggest proportional split when total change changes
  const handleTotalChange = (totalChange: number) => {
    if (!order) return;
    const clampedTotal = Math.min(Math.max(totalChange, 0), order.veg_count + order.nonveg_count);

    if (clampedTotal === 0) {
      setModVegChange(0);
      setModNonvegChange(0);
      return;
    }

    const totalMeals = order.veg_count + order.nonveg_count;
    const vegRatio = order.veg_count / totalMeals;
    const suggestedVeg = Math.round(clampedTotal * vegRatio);
    const suggestedNonveg = clampedTotal - suggestedVeg;

    setModVegChange(suggestedVeg);
    setModNonvegChange(suggestedNonveg);
  };

  // Compute modification for the current modification form state
  const currentModification = useMemo(() => {
    if (!order) return 0;
    return computeModification(
      modVegChange,
      modNonvegChange,
      order.veg_price_per_meal,
      order.nonveg_price_per_meal,
      order.meal_types.length,
    );
  }, [modVegChange, modNonvegChange, order]);

  // Submit modification
  const handleSubmitModification = () => {
    if (!selectedModifyDate || !order) return;

    const formData: ModifyCorporateOrderFormData = {
      modification_date: format(selectedModifyDate, "yyyy-MM-dd"),
      veg_change: modVegChange,
      nonveg_change: modNonvegChange,
      reason: modReason || undefined,
    };

    const result = modifyCorporateOrderSchema.safeParse(formData);
    if (!result.success) {
      toast.error("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    // Only validate upper bound for reductions (positive change can't exceed base)
    if (modVegChange > order.veg_count || modNonvegChange > order.nonveg_count) {
      toast.error("Invalid modification", {
        description: "Reduction cannot exceed current meal allocation.",
      });
      return;
    }

    const isAddition = (modVegChange + modNonvegChange) < 0;
    const successDescription = isAddition
      ? `Meals added for ${format(selectedModifyDate, "MMM dd, yyyy")}. Additional: Rs. ${Math.abs(currentModification).toLocaleString("en-IN")}`
      : `Meals reduced for ${format(selectedModifyDate, "MMM dd, yyyy")}. Credit: Rs. ${currentModification.toLocaleString("en-IN")}`;

    modifyMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Modification submitted", {
          description: successDescription,
        });
        setModifyDialogOpen(false);
      },
      onError: (error: Error) => {
        toast.error("Modification failed", {
          description: error.message || "Please try again.",
        });
      },
    });
  };

  // Cancel order
  const handleCancelOrder = () => {
    cancelMutation.mutate(
      { reason: cancelReason || undefined },
      {
        onSuccess: () => {
          toast.success("Order cancelled", {
            description: "The order has been cancelled successfully.",
          });
          router.push("/corporate/orders");
        },
        onError: (error: Error) => {
          toast.error("Cancellation failed", {
            description: error.message || "Please try again.",
          });
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[600px]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-full bg-destructive/10 text-destructive mb-8"
        >
          <AlertTriangle className="h-12 w-12" />
        </motion.div>
        <h2 className="text-3xl font-black mb-3">Order Not Found</h2>
        <p className="text-muted-foreground mb-10 text-center max-w-md">
          {error instanceof Error
            ? error.message
            : "The requested order could not be loaded. It might have been deleted or the ID is incorrect."}
        </p>
        <Button
          onClick={() => router.push("/corporate/orders")}
          size="lg"
          className="rounded-full bg-primary px-8 h-12 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  return (
    <>
      {/* Header with Create New Order button and User Avatar */}
      <OrderDetailHeader />

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8 lg:pt-12 lg:pb-24">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-125 bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-125 bg-gold/5 rounded-full blur-[120px] -ml-64 -mb-32" />
      </div>

      {/* Back button */}
      {/* <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="group gap-2 mb-8 -ml-2 rounded-full hover:bg-primary/5 hover:text-primary transition-all pr-4"
          onClick={() => router.push("/corporate/orders")}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm">Back to Orders</span>
        </Button>
      </motion.div> */}

      {/* Order Header */}
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold mb-2 tracking-tight" style={{ color: '#44151C' }}>
            {order.company_name}
          </h1>
          <div className="flex items-center gap-2 text-[15px] font-medium text-gray-700">
            <span>Order ID: {order.order_id}</span>
            <span className="text-[#D4D4D4] text-[10px] mx-1">●</span>
            <span>Created: {format(new Date(order.created_at), "MMM dd, yyyy")}</span>
          </div>
        </div>

        {/* Status Badges - Pill Style */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white",
              order.status === "active"
                ? "bg-[#00990F]"
                : "bg-gray-100 text-gray-600"
            )}
          >
            ACTIVE
          </span>

          {order.payment_status === "pending" && (
            <span className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF962D] text-white">
              PENDING
            </span>
          )}
        </div>
      </motion.div>

      {/* Modern Tab System */}
      <div className="relative mb-8 border-b border-gray-200">
        <div className="flex items-center gap-10">
          {TABS_CONFIG.map((tab) => {
            if (tab.value === "schedule" && order.status !== "active") return null;
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "relative py-4 text-[15px] font-bold transition-colors"
                )}
                style={{ color: isActive ? '#44151C' : '#8D8D8D' }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="detail-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                    style={{ backgroundColor: '#44151C' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === "overview" && <OverviewTab order={order} />}
          {activeTab === "schedule" && order.status === "active" && (
            <ScheduleTab
              order={order}
              deliveryDates={deliveryDates}
              modifiedDatesSet={modifiedDatesSet}
              onDateClick={handleDateClick}
            />
          )}
          {activeTab === "invoices" && (
            <InvoicesTab
              order={order}
              invoiceData={allInvoices}
              isInvoicesLoading={isInvoicesLoading}
              isCancelled={isCancelled}
            />
          )}
          {activeTab === "modifications" && <ModificationsTab modifications={modsList} />}
        </motion.div>
      </AnimatePresence>


      {/* Dialogs */}
      {order && (
        <ModifyMealDialog
          open={modifyDialogOpen}
          onOpenChange={setModifyDialogOpen}
          order={order}
          selectedDate={selectedModifyDate}
          vegChange={modVegChange}
          nonvegChange={modNonvegChange}
          reason={modReason}
          onVegChangeChange={setModVegChange}
          onNonvegChangeChange={setModNonvegChange}
          onReasonChange={setModReason}
          onTotalChangeChange={handleTotalChange}
          onSubmit={handleSubmitModification}
          isPending={modifyMutation.isPending}
          modificationAmount={currentModification}
        />
      )}

      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={order.order_id}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleCancelOrder}
        isPending={cancelMutation.isPending}
      />
    </div>
    </>
  );
}

export default function OrderDetailPageWrapper() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailPage />
    </Suspense>
  );
}
