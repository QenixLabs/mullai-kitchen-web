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

import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  Building2, 
  History, 
  CalendarDays, 
  FileCheck,
  LayoutDashboard
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
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "schedule", label: "Schedule", icon: CalendarDays },
  { value: "invoices", label: "Invoices", icon: FileCheck },
  { value: "modifications", label: "Modifications", icon: History },
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
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-32 sm:px-6 sm:pt-10 sm:pb-36 lg:px-8 lg:pt-12 lg:pb-40">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -ml-64 -mb-32" />
      </div>

      {/* Back button */}
      <motion.div 
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
      </motion.div>

      {/* Order Header */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 pb-8 border-b border-border/60"
      >
        <div className="flex items-start gap-6">
          <div className="hidden sm:flex items-center justify-center p-5 rounded-4xl bg-linear-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                {order.company_name}
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID:</span>
                <span className="text-xs font-mono font-bold">{order.order_id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                {order.outlet_name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span>Created {formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-secondary/50 backdrop-blur-sm rounded-3xl border border-border/40">
          <OrderStatusBadge status={order.status} className="h-10 px-5 text-sm" />
          <PaymentStatusBadge status={order.payment_status} className="h-10 px-5 text-sm" />
        </div>
      </motion.div>

      {/* Modern Custom Tab System */}
      <div className="relative mb-10">
        <div className="flex items-center gap-2 p-2 rounded-4xl bg-secondary/40 backdrop-blur-md border border-border/50 w-fit max-w-full overflow-x-auto no-scrollbar">
          {TABS_CONFIG.map((tab) => {
            if (tab.value === "schedule" && order.status !== "active") return null;
            const isActive = activeTab === tab.value;
            
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold rounded-[1.5rem] transition-all duration-300 whitespace-nowrap outline-none",
                  isActive ? "text-white" : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="detail-tab-indicator"
                    className="absolute inset-0 bg-primary rounded-[1.5rem] shadow-lg shadow-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={cn("relative z-10 h-4 w-4", isActive ? "text-white" : "text-primary/60")} />
                <span className="relative z-10">{tab.label}</span>
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
              proformaInvoice={proformaInvoice}
              finalInvoice={finalInvoice}
              hasFinalInvoice={hasFinalInvoice}
              isCompleted={isCompleted}
              isCancelled={isCancelled}
              onGenerateFinalInvoice={handleGenerateFinalInvoice}
              isGeneratingFinal={generateFinalMutation.isPending}
            />
          )}
          {activeTab === "modifications" && <ModificationsTab modifications={modsList} />}
        </motion.div>
      </AnimatePresence>


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
