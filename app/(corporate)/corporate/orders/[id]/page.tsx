"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { format, isAfter, isBefore, parseISO, addDays, startOfDay } from "date-fns";
import {
  ArrowLeft,
  IndianRupee,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  FileText,
  X,
  Loader2,
  PlusCircle,
  History,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCorporateOrder,
  useCorporateModifications,
  useModifyCorporateOrder,
  useCorporateInvoice,
  useCancelCorporateOrder,
  useGenerateFinalInvoice,
} from "@/api/hooks/useCorporate";
import { modifyCorporateOrderSchema, type ModifyCorporateOrderFormData } from "@/lib/validations/corporate.schema";
import type {
  CorporateOrderStatus,
  CorporatePaymentStatus,
  ICorporateOrderModification,
} from "@/api/types/corporate.types";

// --- Helpers ---

const statusVariant: Record<CorporateOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  draft: "secondary",
  pending_payment: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

const statusLabel: Record<CorporateOrderStatus, string> = {
  active: "Active",
  draft: "Draft",
  pending_payment: "Pending Payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

const paymentStatusLabel: Record<CorporatePaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

const paymentStatusVariant: Record<CorporatePaymentStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateDeliveryDates(
  startDate: string,
  endDate: string,
  selectedDays: string[]
): Date[] {
  const dates: Date[] = [];
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));

  const current = new Date(start);
  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    if (selectedDays.includes(dayName)) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM dd, yyyy");
}

// --- Component ---

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

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
  const [showInvoice, setShowInvoice] = useState<"proforma" | "final" | null>(null);

  // Modification form state
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
    if (isBefore(date, today)) return; // Past dates can't be modified

    // Check if already modified
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
    const maxReduction = totalReduction;
    const clampedTotal = Math.min(Math.max(totalReduction, 0), order.veg_count + order.nonveg_count);

    if (clampedTotal === 0) {
      setModVegReduction(0);
      setModNonvegReduction(0);
      return;
    }

    // Proportional split
    const totalMeals = order.veg_count + order.nonveg_count;
    const vegRatio = order.veg_count / totalMeals;
    const suggestedVeg = Math.round(clampedTotal * vegRatio);
    const suggestedNonveg = clampedTotal - suggestedVeg;

    setModVegReduction(suggestedVeg);
    setModNonvegReduction(suggestedNonveg);
  };

  // Compute credit amount for modification
  const computeCredit = (): number => {
    if (!order) return 0;
    return (
      modVegReduction * order.veg_price_per_meal * order.meal_types.length +
      modNonvegReduction * order.nonveg_price_per_meal * order.meal_types.length
    );
  };

  // Submit modification
  const handleSubmitModification = () => {
    if (!selectedModifyDate || !order) return;

    // Validate
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

    // Check reduction doesn't exceed current allocation
    if (modVegReduction > order.veg_count || modNonvegReduction > order.nonveg_count) {
      toast.error("Invalid reduction", {
        description: "Reduction cannot exceed current meal allocation.",
      });
      return;
    }

    modifyMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Modification submitted", {
          description: `Meals reduced for ${format(selectedModifyDate, "MMM dd, yyyy")}. Credit: Rs. ${computeCredit()}`,
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
          router.push("/corporate");
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-sm mb-6" />
        <Skeleton className="h-96 w-full rounded-sm" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6 max-w-5xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-8">
          {error instanceof Error
            ? error.message
            : "The requested order could not be loaded."}
        </p>
        <Button onClick={() => router.push("/corporate")}>Back to Dashboard</Button>
      </div>
    );
  }

  const isActive = order.status === "active";
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";
  const canModify = isActive;
  const canCancel = isActive || order.status === "pending_payment";

  const selectedInvoice = showInvoice === "final" ? finalInvoice : showInvoice === "proforma" ? proformaInvoice : null;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2 mb-6"
        onClick={() => router.push("/corporate")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
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
          <Badge variant={statusVariant[order.status]} className="text-sm">
            {statusLabel[order.status]}
          </Badge>
          <Badge variant={paymentStatusVariant[order.payment_status]} className="text-sm">
            {paymentStatusLabel[order.payment_status]}
          </Badge>
        </div>
      </div>

      {/* Order Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Date Range
              </div>
              <p className="font-medium">
                {formatDate(order.start_date)} - {formatDate(order.end_date)}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.total_delivery_days} delivery days
              </p>
            </div>

            {/* Configuration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Schedule
              </div>
              <div className="flex flex-wrap gap-1">
                {order.selected_days.map((day) => (
                  <Badge key={day} variant="secondary" className="text-xs">
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {order.meal_types.map((meal) => (
                  <Badge key={meal} variant="outline" className="text-xs">
                    {meal}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Quantity
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{order.headcount}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{order.veg_count}</div>
                  <div className="text-xs text-muted-foreground">Veg</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{order.nonveg_count}</div>
                  <div className="text-xs text-muted-foreground">Non-veg</div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </div>
              <p className="text-sm font-medium">{order.delivery_address.address_line}</p>
              <p className="text-sm text-muted-foreground">
                {order.delivery_address.area}, {order.delivery_address.city},{" "}
                {order.delivery_address.state} - {order.delivery_address.pincode}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="h-4 w-4" />
                Pricing
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <div className="text-sm text-muted-foreground">Proforma</div>
                  <div className="text-lg font-bold flex items-center justify-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />
                    {order.proforma_amount.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-green-50 rounded-md p-3 text-center">
                  <div className="text-sm text-green-600">Reductions</div>
                  <div className="text-lg font-bold text-green-700 flex items-center justify-center gap-0.5">
                    - <IndianRupee className="h-3 w-3" />
                    {order.total_reduction_amount.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-md p-3 text-center">
                  <div className="text-sm text-primary/80">Final Amount</div>
                  <div className="text-lg font-bold text-primary flex items-center justify-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />
                    {order.final_amount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {isActive && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Delivery Calendar
            </CardTitle>
            <CardDescription>
              Click on a future delivery date to modify meal quantities. Dates with modifications are highlighted in green.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              numberOfMonths={2}
              defaultMonth={parseISO(order.start_date)}
              fromMonth={parseISO(order.start_date)}
              toMonth={parseISO(order.end_date)}
              modifiers={{
                deliveryDay: deliveryDates,
                modifiedDay: deliveryDates.filter((d) =>
                  modifiedDatesSet.has(format(d, "yyyy-MM-dd"))
                ),
                pastDay: deliveryDates.filter((d) => isBefore(d, startOfDay(new Date()))),
              }}
              modifiersClassNames={{
                deliveryDay:
                  "bg-primary/10 text-primary font-bold rounded-md",
                modifiedDay:
                  "bg-green-100 text-green-700 font-bold rounded-md ring-2 ring-green-400",
                pastDay: "text-muted-foreground/50 line-through",
              }}
              onDayClick={(date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isDelivery = deliveryDates.some(
                  (d) => format(d, "yyyy-MM-dd") === dateStr
                );
                if (isDelivery) {
                  handleDateClick(date);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Invoices Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowInvoice(showInvoice === "proforma" ? null : "proforma")}
            >
              <FileText className="h-4 w-4" />
              {showInvoice === "proforma" ? "Hide Proforma Invoice" : "View Proforma Invoice"}
            </Button>
            {hasFinalInvoice && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowInvoice(showInvoice === "final" ? null : "final")}
              >
                <FileText className="h-4 w-4" />
                {showInvoice === "final" ? "Hide Final Invoice" : "View Final Invoice"}
              </Button>
            )}
            {(isCompleted || isCancelled) && !hasFinalInvoice && (
              <Button
                variant="default"
                className="gap-2"
                onClick={handleGenerateFinalInvoice}
                disabled={generateFinalMutation.isPending}
              >
                {generateFinalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Generate Final Invoice
              </Button>
            )}
          </div>

          {/* Invoice Display */}
          {selectedInvoice && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {showInvoice === "proforma" ? "Proforma" : "Final"} Invoice
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedInvoice.status === "paid"
                      ? "default"
                      : selectedInvoice.status === "overdue"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {selectedInvoice.status.charAt(0).toUpperCase() +
                    selectedInvoice.status.slice(1)}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.line_items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <IndianRupee className="h-3 w-3 inline" />
                        {item.unit_price.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {item.amount.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-3 bg-muted/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    <IndianRupee className="h-3 w-3 inline" />
                    {selectedInvoice.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedInvoice.total_reduction > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Modifications Credit</span>
                    <span>
                      - <IndianRupee className="h-3 w-3 inline" />
                      {selectedInvoice.total_reduction.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>
                    <IndianRupee className="h-3 w-3 inline" />
                    {selectedInvoice.tax_amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    <IndianRupee className="h-4 w-4 inline" />
                    {selectedInvoice.grand_total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modifications History */}
      {modsList.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Modifications History
            </CardTitle>
            <CardDescription>
              {modsList.length} modification{modsList.length !== 1 ? "s" : ""} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Veg Reduction</TableHead>
                  <TableHead className="text-right">Non-veg Reduction</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modsList.map((mod) => (
                  <TableRow key={mod._id}>
                    <TableCell className="font-medium">
                      {formatDate(mod.modification_date)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      -{mod.veg_reduction}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      -{mod.nonveg_reduction}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <IndianRupee className="h-3 w-3 inline" />
                      {mod.credit_amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          mod.status === "approved"
                            ? "default"
                            : mod.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {mod.status.charAt(0).toUpperCase() + mod.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mod.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canCancel && (
        <div className="flex items-center gap-4 mb-6">
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <X className="h-4 w-4" />
                Cancel Entire Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The order {order.order_id} will be
                  permanently cancelled. Any meals already delivered will be billed
                  separately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Please provide a reason..."
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCancelReason("")}>
                  Keep Order
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelOrder}
                  disabled={cancelMutation.isPending}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel Order"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Modification Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Meals for {selectedModifyDate && format(selectedModifyDate, "MMM dd, yyyy")}</DialogTitle>
            <DialogDescription>
              Reduce meal quantities for this delivery date. The credit will be reflected in the final invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Allocation */}
            <div className="bg-muted/50 rounded-md p-4">
              <p className="text-sm font-medium mb-2">Current Allocation</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">{order.veg_count} Veg meals</span>
                <span className="text-orange-600">{order.nonveg_count} Non-veg meals</span>
                <span className="font-bold">{order.headcount} Total</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ({order.meal_types.length} meal type{order.meal_types.length > 1 ? "s" : ""} per day)
              </p>
            </div>

            {/* Total Reduction Input */}
            <div className="space-y-2">
              <Label htmlFor="total-reduction">Total meals to reduce</Label>
              <Input
                id="total-reduction"
                type="number"
                min={1}
                max={order.headcount}
                placeholder="e.g., 3"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleTotalReductionChange(val);
                }}
              />
              <p className="text-xs text-muted-foreground">
                System will auto-suggest proportional veg/non-veg split. You can adjust manually below.
              </p>
            </div>

            {/* Manual Override */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mod-veg">Veg reduction</Label>
                <Input
                  id="mod-veg"
                  type="number"
                  min={0}
                  max={order.veg_count}
                  value={modVegReduction}
                  onChange={(e) => setModVegReduction(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mod-nonveg">Non-veg reduction</Label>
                <Input
                  id="mod-nonveg"
                  type="number"
                  min={0}
                  max={order.nonveg_count}
                  value={modNonvegReduction}
                  onChange={(e) => setModNonvegReduction(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Credit Display */}
            {modVegReduction + modNonvegReduction > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Estimated Credit:{" "}
                    <strong className="text-lg">
                      <IndianRupee className="h-3 w-3 inline" />
                      {computeCredit().toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="mod-reason">Reason (optional)</Label>
              <Textarea
                id="mod-reason"
                placeholder="e.g., Team offsite, holiday, etc."
                rows={2}
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModifyDialogOpen(false)}
              disabled={modifyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitModification}
              disabled={
                modifyMutation.isPending ||
                modVegReduction + modNonvegReduction === 0
              }
              className="bg-primary hover:bg-primary/90"
            >
              {modifyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Confirm Modification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
