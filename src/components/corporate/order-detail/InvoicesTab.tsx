"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IndianRupee,
  FileText,
  ArrowDown,
  ArrowUp,
  Lock,
  ChevronDown,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ICorporateInvoice,
  ICorporateOrder,
  IAllInvoicesResponse,
} from "@/api/types/corporate.types";
import { format } from "date-fns";

// ─── Props ──────────────────────────────────────────────────────────────────

interface InvoicesTabProps {
  order: ICorporateOrder;
  invoiceData: IAllInvoicesResponse | undefined;
  isInvoicesLoading: boolean;
  isCancelled: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDateShort(dateStr: string) {
  return format(new Date(dateStr), "MMM dd, yyyy");
}

function getStatusConfig(status: string) {
  switch (status) {
    case "paid":
      return {
        label: "PAID",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
      };
    case "overdue":
      return {
        label: "OVERDUE",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: AlertCircle,
        iconClass: "text-red-500",
      };
    case "pending":
      return {
        label: "PENDING",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        iconClass: "text-amber-500",
      };
    case "cancelled":
      return {
        label: "CANCELLED",
        className: "bg-gray-50 text-gray-500 border-gray-200",
        icon: AlertCircle,
        iconClass: "text-gray-400",
      };
    default:
      return {
        label: status.toUpperCase(),
        className: "bg-gray-50 text-gray-600 border-gray-200",
        icon: Clock,
        iconClass: "text-gray-400",
      };
  }
}

// ─── Timeline Item Type ─────────────────────────────────────────────────────

type TimelineItem =
  | {
      type: "invoice";
      key: string;
      invoice: ICorporateInvoice;
      label: string;
      badge?: "proforma" | "cycle" | "final";
      liveBadge?: boolean;
      billingPeriod?: { start: string; end: string };
    }
  | {
      type: "locked";
      key: string;
      label: string;
      subtitle: string;
    };

// ─── Sub-components ─────────────────────────────────────────────────────────

function ModificationRow({
  mod,
}: {
  mod: {
    date: string;
    veg_change: number;
    nonveg_change: number;
    modification_amount: number;
  };
}) {
  const date = new Date(mod.date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const isCredit = mod.modification_amount > 0;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-3 text-sm text-foreground">{date}</td>
      <td className="py-3 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold",
            mod.veg_change > 0
              ? "text-emerald-600"
              : mod.veg_change < 0
                ? "text-amber-600"
                : "text-muted-foreground",
          )}
        >
          {mod.veg_change > 0 ? (
            <ArrowDown className="h-3 w-3" />
          ) : mod.veg_change < 0 ? (
            <ArrowUp className="h-3 w-3" />
          ) : null}
          {mod.veg_change === 0
            ? "0"
            : `${mod.veg_change > 0 ? "-" : "+"}${Math.abs(mod.veg_change)}`}
        </span>
      </td>
      <td className="py-3 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold",
            mod.nonveg_change > 0
              ? "text-emerald-600"
              : mod.nonveg_change < 0
                ? "text-amber-600"
                : "text-muted-foreground",
          )}
        >
          {mod.nonveg_change > 0 ? (
            <ArrowDown className="h-3 w-3" />
          ) : mod.nonveg_change < 0 ? (
            <ArrowUp className="h-3 w-3" />
          ) : null}
          {mod.nonveg_change === 0
            ? "0"
            : `${mod.nonveg_change > 0 ? "-" : "+"}${Math.abs(mod.nonveg_change)}`}
        </span>
      </td>
      <td
        className={cn(
          "py-3 text-right text-sm font-semibold",
          isCredit ? "text-emerald-600" : "text-amber-600",
        )}
      >
        {isCredit ? "-" : "+"}₹
        {Math.abs(mod.modification_amount).toLocaleString("en-IN")}
      </td>
    </tr>
  );
}

function InvoiceCard({
  invoice,
  order,
  label,
  badge,
  billingPeriod,
  liveBadge,
  isExpanded,
  onToggle,
}: {
  invoice: ICorporateInvoice;
  order: ICorporateOrder;
  label: string;
  badge?: "proforma" | "cycle" | "final";
  liveBadge?: boolean;
  billingPeriod?: { start: string; end: string };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;
  const hasModifications = invoice.modifications && invoice.modifications.length > 0;

  const getItemSubtitle = (
    item: ICorporateInvoice["line_items"][number],
  ) => {
    const desc = item.description.toLowerCase();
    if (
      desc.includes("veg") &&
      !desc.includes("delivery") &&
      !desc.includes("charge")
    ) {
      const persons = order.headcount;
      const mealsPerDay = order.meal_types.length || 1;
      const days = Math.round(item.quantity / (persons * mealsPerDay));
      return `${persons} Persons × ${mealsPerDay} Meals × ${days} Days`;
    }
    if (desc.includes("delivery") || desc.includes("charge")) {
      return `Logistics & Handling (${item.quantity} Days)`;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
      >
        {/* Icon */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            badge === "proforma"
              ? "bg-blue-50 text-blue-600"
              : badge === "final"
                ? "bg-purple-50 text-purple-600"
                : "bg-primary/10 text-primary",
          )}
        >
          <Receipt className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            {liveBadge && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                statusConfig.className,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
            {invoice.payment_link_url && invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
                <ExternalLink className="h-3 w-3" />
                Payment Link
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-semibold text-foreground truncate">
              {invoice.invoice_number}
            </p>
            {billingPeriod && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                • {formatDateShort(billingPeriod.start)} – {formatDateShort(billingPeriod.end)}
              </span>
            )}
          </div>
        </div>

        {/* Amount + Chevron */}
        <div className="text-right flex items-center gap-3 shrink-0">
          <div>
            <p className="text-lg font-bold text-foreground whitespace-nowrap">
              {formatCurrency(invoice.grand_total)}
            </p>
            {hasModifications && (
              <p className="text-[10px] text-amber-600 font-semibold uppercase">
                {invoice.modifications.length} adjustment{invoice.modifications.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* Billing Period (mobile) */}
              {billingPeriod && (
                <div className="sm:hidden px-5 py-3 bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateShort(billingPeriod.start)} – {formatDateShort(billingPeriod.end)}
                </div>
              )}

              {/* Two column layout: Line Items + Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Line Items */}
                <div className="lg:col-span-2 px-5 sm:px-6 py-5">
                  <div className="overflow-x-auto -mx-5 sm:mx-0">
                    <div className="min-w-[480px] px-5 sm:px-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[45%]">
                              Description
                            </th>
                            <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Qty
                            </th>
                            <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Price
                            </th>
                            <th className="text-right py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {invoice.line_items.map((item, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3.5 align-top">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-foreground">
                                    {item.description}
                                  </span>
                                  {(() => {
                                    const subtitle = getItemSubtitle(item);
                                    return subtitle ? (
                                      <span className="text-xs text-muted-foreground mt-0.5">
                                        {subtitle}
                                      </span>
                                    ) : null;
                                  })()}
                                </div>
                              </td>
                              <td className="py-3.5 text-center text-sm text-foreground">
                                {item.quantity}
                              </td>
                              <td className="py-3.5 text-center text-sm text-foreground whitespace-nowrap">
                                <span className="inline-flex items-center">
                                  <IndianRupee className="w-3 h-3 mr-0.5" />
                                  {item.unit_price.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="py-3.5 text-right text-sm font-semibold text-foreground whitespace-nowrap">
                                <span className="inline-flex items-center">
                                  <IndianRupee className="w-3 h-3 mr-0.5" />
                                  {item.amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Modifications */}
                  {hasModifications && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                        Day-wise Adjustments
                      </h4>
                      <div className="overflow-x-auto -mx-5 sm:mx-0">
                        <div className="min-w-[480px] px-5 sm:px-0">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border bg-muted/50">
                                <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Date
                                </th>
                                <th className="text-center py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Veg
                                </th>
                                <th className="text-center py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Non-Veg
                                </th>
                                <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {invoice.modifications.map((mod, i) => (
                                <ModificationRow key={i} mod={mod} />
                              ))}
                            </tbody>
                            {invoice.total_modification !== 0 && (
                              <tfoot>
                                <tr className="border-t border-border">
                                  <td colSpan={3} className="py-3 text-sm font-bold text-foreground text-right">
                                    Total Adjustment
                                  </td>
                                  <td
                                    className={cn(
                                      "py-3 text-right text-sm font-bold",
                                      invoice.total_modification > 0
                                        ? "text-emerald-600"
                                        : "text-amber-600",
                                    )}
                                  >
                                    {invoice.total_modification > 0 ? "-" : "+"}₹
                                    {Math.abs(invoice.total_modification).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Summary Sidebar */}
                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border">
                  <BillingSummary invoice={invoice} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BillingSummary({ invoice }: { invoice: ICorporateInvoice }) {
  const hasAdjustment = invoice.total_modification !== 0;
  const isCredit = invoice.total_modification > 0;
  const isPending = invoice.status === "pending" || invoice.status === "overdue";
  const hasPaymentLink = !!invoice.payment_link_url && isPending;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!invoice.payment_link_url) return;
    try {
      await navigator.clipboard.writeText(invoice.payment_link_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-5 sm:p-6 space-y-3">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
        Summary
      </h3>
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Net Value</span>
          <span className="text-sm font-semibold text-foreground flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
            {invoice.subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        {hasAdjustment && (
          <div className="flex justify-between items-center">
            <span className={cn("text-sm font-medium", isCredit ? "text-emerald-700" : "text-amber-700")}>
              {isCredit ? "Modifications Credit" : "Modifications Charge"}
            </span>
            <span className={cn("text-sm font-semibold", isCredit ? "text-emerald-700" : "text-amber-700")}>
              {isCredit ? "-" : "+"}₹{Math.abs(invoice.total_modification).toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tax & Levies (5%)</span>
          <span className="text-sm font-semibold text-foreground flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
            {invoice.tax_amount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className="pt-3 border-t border-border">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Payable
          </span>
          <span className="text-xl font-bold text-foreground flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {invoice.grand_total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Payment Link Info */}
      {hasPaymentLink && (
        <div className="pt-2 space-y-2">
          {invoice.payment_link_expires_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Link expires {formatDateShort(invoice.payment_link_expires_at)}</span>
            </div>
          )}
          {invoice.payment_link_status && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                invoice.payment_link_status === "active"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                {invoice.payment_link_status}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <a
              href={invoice.payment_link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-primary underline underline-offset-2 hover:text-primary/80 max-w-[180px]"
            >
              {invoice.payment_link_url}
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleCopyLink}
            >
              <Copy className="h-3 w-3" />
            </Button>
            {copied && <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>}
          </div>
        </div>
      )}

      {invoice.due_date && invoice.status !== "paid" && (
        <div className="pt-1 text-xs text-muted-foreground">
          Due by {formatDateShort(invoice.due_date)}
        </div>
      )}

      {/* CTA Button */}
      {hasPaymentLink ? (
        <a
          href={invoice.payment_link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            className="w-full h-10 rounded-full font-semibold text-sm mt-2 gap-2"
            style={{ backgroundColor: "#3D000C", color: "#FFFFFF" }}
          >
            <CreditCard className="h-4 w-4" />
            Pay Now
          </Button>
        </a>
      ) : invoice.status === "paid" ? (
        <Button
          className="w-full h-10 rounded-full font-semibold text-sm mt-2 gap-2"
          variant="outline"
          disabled
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Paid
        </Button>
      ) : (
        <Button
          className="w-full h-10 rounded-full font-semibold text-sm mt-2"
          style={{ backgroundColor: "#3D000C", color: "#FFFFFF" }}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Download PDF
        </Button>
      )}
    </div>
  );
}

function LockedInvoiceCard({ label, subtitle }: { label: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 overflow-hidden relative"
    >
      <div className="px-5 sm:px-6 py-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function InvoiceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner skeleton */}
      <Skeleton className="h-20 rounded-2xl" />
      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white border border-border shadow-sm p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Content ───────────────────────────────────────────────────────────

function InvoicesContent({
  order,
  invoiceData,
  isCancelled,
}: {
  order: ICorporateOrder;
  invoiceData: IAllInvoicesResponse | undefined;
  isCancelled?: boolean;
}) {
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Build timeline items
  const timelineItems: TimelineItem[] = [];

  if (invoiceData) {
    // Proforma
    if (invoiceData.proforma) {
      timelineItems.push({
        type: "invoice",
        key: invoiceData.proforma._id,
        invoice: invoiceData.proforma,
        label: "Proforma Invoice",
        badge: "proforma",
        liveBadge: !isCancelled && invoiceData.proforma.status === "pending",
        billingPeriod: {
          start: invoiceData.orderStartDate,
          end: invoiceData.orderEndDate,
        },
      });
    }

    // Cycle invoices
    invoiceData.cycles.forEach((cycle) => {
      timelineItems.push({
        type: "invoice",
        key: cycle._id,
        invoice: cycle,
        label: `Cycle Invoice #${cycle.cycle_number ?? "?"}`,
        badge: "cycle",
        billingPeriod: cycle.billing_period_start && cycle.billing_period_end
          ? { start: cycle.billing_period_start, end: cycle.billing_period_end }
          : undefined,
      });
    });

    // Locked future cycles
    if (!isCancelled) {
      const generatedCycleNumbers = new Set(
        invoiceData.cycles.map((c) => c.cycle_number ?? 0),
      );
      const totalExpected = invoiceData.totalExpectedCycles;
      for (let i = 1; i <= totalExpected; i++) {
        if (!generatedCycleNumbers.has(i) && i > (invoiceData.currentCycle?.number ?? 0)) {
          const cycleStart = new Date(invoiceData.orderStartDate);
          cycleStart.setDate(cycleStart.getDate() + (i - 1) * order.billing_cycle_days);
          const cycleEnd = new Date(cycleStart);
          cycleEnd.setDate(cycleEnd.getDate() + order.billing_cycle_days - 1);
          timelineItems.push({
            type: "locked",
            key: `locked-cycle-${i}`,
            label: `Cycle Invoice #${i}`,
            subtitle: `Available after ${formatDateShort(cycleEnd.toISOString())}`,
          });
        }
      }
    }

    // Note: The last CYCLE invoice serves as the final settlement
    // No separate FINAL invoice type - removed
  }

  return (
    <div className="space-y-6">
      {/* Current Billing Cycle Banner */}
      {invoiceData?.currentCycle && !isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-primary/[0.02] px-5 sm:px-6 py-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Cycle {invoiceData.currentCycle.number} of {invoiceData.totalExpectedCycles}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateShort(invoiceData.currentCycle.startDate)} –{" "}
                  {formatDateShort(invoiceData.currentCycle.endDate)}
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <p
                className={cn(
                  "text-sm font-bold",
                  invoiceData.currentCycle.daysRemaining <= 3
                    ? "text-amber-600"
                    : "text-foreground",
                )}
              >
                {invoiceData.currentCycle.isComplete
                  ? "Cycle complete"
                  : `${invoiceData.currentCycle.daysRemaining} day${invoiceData.currentCycle.daysRemaining !== 1 ? "s" : ""} remaining`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {timelineItems.map((item) => {
          if (item.type === "locked") {
            return (
              <LockedInvoiceCard
                key={item.key}
                label={item.label}
                subtitle={item.subtitle}
              />
            );
          }
          return (
            <InvoiceCard
              key={item.key}
              invoice={item.invoice}
              order={order}
              label={item.label}
              badge={item.badge}
              billingPeriod={item.billingPeriod}
              liveBadge={item.liveBadge}
              isExpanded={expandedInvoiceId === item.invoice._id}
              onToggle={() =>
                setExpandedInvoiceId((prev) =>
                  prev === item.invoice._id ? null : item.invoice._id,
                )
              }
            />
          );
        })}

        {timelineItems.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-sm font-semibold text-muted-foreground">
              No invoices yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Invoices will appear here once the order is processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main InvoicesTab ───────────────────────────────────────────────────────

export function InvoicesTab({
  order,
  invoiceData,
  isInvoicesLoading,
  isCancelled,
}: InvoicesTabProps) {
  if (isInvoicesLoading) {
    return <InvoiceLoadingSkeleton />;
  }

  return <InvoicesContent order={order} invoiceData={invoiceData} isCancelled={isCancelled} />;
}
