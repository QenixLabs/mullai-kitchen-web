"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useCorporateOrder,
  useCorporateModifications,
  useModifyCorporateOrder,
  useCorporateInvoice,
  useCancelCorporateOrder,
  useGenerateFinalInvoice,
} from "@/api/hooks/useCorporate";
import { modifyCorporateOrderSchema, type ModifyCorporateOrderFormData } from "@/lib/validations/corporate.schema";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/corporate/PaymentStatusBadge";
import { OverviewTab } from "@/components/corporate/order-detail/OverviewTab";
import { ScheduleTab } from "@/components/corporate/order-detail/ScheduleTab";
import { InvoicesTab } from "@/components/corporate/order-detail/InvoicesTab";
import { ModificationsTab } from "@/components/corporate/order-detail/ModificationsTab";
import { OrderActionsBar } from "@/components/corporate/order-detail/OrderActionsBar";
import { ModifyMealDialog, computeCredit } from "@/components/corporate/order-detail/ModifyMealDialog";
import { CancelOrderDialog } from "@/components/corporate/order-detail/CancelOrderDialog";
import { generateDeliveryDates } from "@/lib/corporate/dates";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrderModification } from "@/api/types/corporate.types";

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <Skeleton className="h-8 w-32 mb-4 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl mb-6" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

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
  const { data: proformaInvoice } = useCorporateInvoice(orderId, "proforma");
  const { data: finalInvoice } = useCorporateInvoice(orderId, "final");

  // Mutations
  const modifyMutation = useModifyCorporateOrder(orderId);
  const cancelMutation = useCancelCorporateOrder(orderId);
  const generateFinalMutation = useGenerateFinalInvoice(orderId);

  // State
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedModifyDate, setSelectedModifyDate] = useState<Date | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [modVegReduction, setModVegReduction] = useState(0);
  const [modNonvegReduction, setModNonvegReduction] = useState(0);
  const [modReason, setModReason] = useState("");

  const modsList = modifications ?? [];
  const hasFinalInvoice = !!finalInvoice;

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
        description: `Veg: -${existingMod.veg_reduction}, Non-veg: -${existingMod.nonveg_reduction}`,
      });
      return;
    }

    setSelectedModifyDate(date);
    setModVegReduction(0);
    setModNonvegReduction(0);
    setModReason("");
    setModifyDialogOpen(true);
  };

  // Auto-suggest proportional split when total reduction changes
  const handleTotalReductionChange = (totalReduction: number) => {
    if (!order) return;
    const clampedTotal = Math.min(Math.max(totalReduction, 0), order.veg_count + order.nonveg_count);

    if (clampedTotal === 0) {
      setModVegReduction(0);
      setModNonvegReduction(0);
      return;
    }

    const totalMeals = order.veg_count + order.nonveg_count;
    const vegRatio = order.veg_count / totalMeals;
    const suggestedVeg = Math.round(clampedTotal * vegRatio);
    const suggestedNonveg = clampedTotal - suggestedVeg;

    setModVegReduction(suggestedVeg);
    setModNonvegReduction(suggestedNonveg);
  };

  // Compute credit for the current modification form state
  const currentCredit = useMemo(() => {
    if (!order) return 0;
    return computeCredit(
      modVegReduction,
      modNonvegReduction,
      order.veg_price_per_meal,
      order.nonveg_price_per_meal,
      order.meal_types.length
    );
  }, [modVegReduction, modNonvegReduction, order]);

  // Submit modification
  const handleSubmitModification = () => {
    if (!selectedModifyDate || !order) return;

    const formData: ModifyCorporateOrderFormData = {
      modification_date: format(selectedModifyDate, "yyyy-MM-dd"),
      veg_reduction: modVegReduction,
      nonveg_reduction: modNonvegReduction,
      reason: modReason || undefined,
    };

    const result = modifyCorporateOrderSchema.safeParse(formData);
    if (!result.success) {
      toast.error("Validation error", {
        description: result.error.issues[0].message,
      });
      return;
    }

    if (modVegReduction > order.veg_count || modNonvegReduction > order.nonveg_count) {
      toast.error("Invalid reduction", {
        description: "Reduction cannot exceed current meal allocation.",
      });
      return;
    }

    modifyMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Modification submitted", {
          description: `Meals reduced for ${format(selectedModifyDate, "MMM dd, yyyy")}. Credit: Rs. ${currentCredit.toLocaleString("en-IN")}`,
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

  // Generate final invoice
  const handleGenerateFinalInvoice = () => {
    generateFinalMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Final invoice generated", {
          description: "Your final invoice with all adjustments has been created.",
        });
      },
      onError: (error: Error) => {
        toast.error("Failed to generate invoice", {
          description: error.message || "Please try again.",
        });
      },
    });
  };

  // Navigate to invoices tab
  const handleViewInvoices = () => {
    setActiveTab("invoices");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate to schedule tab
  const handleModifyClick = () => {
    setActiveTab("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">
          {error instanceof Error
            ? error.message
            : "The requested order could not be loaded."}
        </p>
        <Button
          onClick={() => router.push("/corporate/orders")}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2 mb-6 -ml-2 hover:bg-primary/10 hover:text-primary"
        onClick={() => router.push("/corporate/orders")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Order {order.order_id}
          </h1>
          <p className="text-muted-foreground">
            {order.outlet_name} &middot; Created {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
          <PaymentStatusBadge status={order.payment_status} className="text-sm px-3 py-1" />
        </div>
      </div>

      {/* Tab bar */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {order.status === "active" && (
            <TabsTrigger value="schedule">Schedule & Calendar</TabsTrigger>
          )}
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="modifications">Modifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab order={order} />
        </TabsContent>

        {order.status === "active" && (
          <TabsContent value="schedule">
            <ScheduleTab
              order={order}
              deliveryDates={deliveryDates}
              modifiedDatesSet={modifiedDatesSet}
              onDateClick={handleDateClick}
            />
          </TabsContent>
        )}

        <TabsContent value="invoices">
          <InvoicesTab
            order={order}
            proformaInvoice={proformaInvoice}
            finalInvoice={finalInvoice}
            hasFinalInvoice={hasFinalInvoice}
            isCompleted={isCompleted}
            isCancelled={isCancelled}
            onGenerateFinalInvoice={handleGenerateFinalInvoice}
            isGeneratingFinal={generateFinalMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="modifications">
          <ModificationsTab modifications={modsList} />
        </TabsContent>
      </Tabs>

      {/* Sticky Actions Bar */}
      <OrderActionsBar
        order={order}
        hasFinalInvoice={hasFinalInvoice}
        onCancelClick={() => setCancelDialogOpen(true)}
        onModifyClick={handleModifyClick}
        onViewInvoicesClick={handleViewInvoices}
        onGenerateFinalInvoice={handleGenerateFinalInvoice}
        isGeneratingFinal={generateFinalMutation.isPending}
      />

      {/* Dialogs */}
      {order && (
        <ModifyMealDialog
          open={modifyDialogOpen}
          onOpenChange={setModifyDialogOpen}
          order={order}
          selectedDate={selectedModifyDate}
          vegReduction={modVegReduction}
          nonvegReduction={modNonvegReduction}
          reason={modReason}
          onVegReductionChange={setModVegReduction}
          onNonvegReductionChange={setModNonvegReduction}
          onReasonChange={setModReason}
          onTotalReductionChange={handleTotalReductionChange}
          onSubmit={handleSubmitModification}
          isPending={modifyMutation.isPending}
          credit={currentCredit}
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
  );
}

export default function OrderDetailPageWrapper() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailPage />
    </Suspense>
  );
}
