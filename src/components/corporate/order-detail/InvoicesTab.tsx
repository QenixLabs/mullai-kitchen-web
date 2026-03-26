"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  IndianRupee, 
  FileText, 
  PlusCircle, 
  Loader2, 
  Download, 
  Receipt,
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ICorporateOrder, ICorporateInvoice } from "@/api/types/corporate.types";

interface InvoicesTabProps {
  order: ICorporateOrder;
  proformaInvoice: ICorporateInvoice | undefined;
  finalInvoice: ICorporateInvoice | undefined;
  hasFinalInvoice: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  onGenerateFinalInvoice: () => void;
  isGeneratingFinal: boolean;
}

function InvoiceDisplay({
  invoice,
  label,
}: {
  invoice: ICorporateInvoice;
  label: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 overflow-hidden w-full"
    >
      <div className="bg-secondary/30 px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Receipt className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black uppercase tracking-tight truncate">{label} Record</h3>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground truncate">
              {invoice.invoice_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <Badge
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
              invoice.status === "paid" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}
          >
            {invoice.status ?? "Pending"}
          </Badge>
          <Button variant="outline" size="sm" className="rounded-xl h-9 w-9 p-0 border-border/60 hover:bg-primary/5 hover:text-primary transition-colors">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="min-w-[700px] px-6 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[50%]">Description</th>
                  <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Qty</th>
                  <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Unit Price</th>
                  <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {invoice.line_items.map((item, i) => (
                  <tr key={i} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 text-sm font-bold text-foreground/80">{item.description}</td>
                    <td className="py-4 text-right text-sm font-mono font-bold px-2">{item.quantity}</td>
                    <td className="py-4 text-right text-sm font-mono font-bold px-2 whitespace-nowrap">
                      <span className="text-[10px] mr-1 font-sans font-normal opacity-50">₹</span>
                      {item.unit_price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 text-right text-sm font-black text-foreground whitespace-nowrap">
                      <span className="text-[10px] mr-1 font-sans font-normal opacity-50">₹</span>
                      {item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modern Centered Summary Bar */}
      <div className="px-6 sm:px-8 py-10 bg-secondary/10 border-t border-border/40 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            {/* Context Info */}
            <div className="hidden lg:flex flex-col gap-2 max-w-[280px]">
               <div className="flex items-center gap-2 text-primary">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Financial Summary</span>
               </div>
               <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic">
                  This summary includes all meal adjustments, taxations, and cycle offsets calculated for the current billing cycle.
               </p>
            </div>

            {/* Price Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Net Value</p>
                 <p className="text-xl font-black font-mono">₹ {invoice.subtotal.toLocaleString("en-IN")}</p>
              </div>

              {invoice.total_reduction > 0 && (
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Savings Offset</p>
                   <div className="flex items-baseline gap-1 text-emerald-600">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <p className="text-xl font-black font-mono">- ₹ {invoice.total_reduction.toLocaleString("en-IN")}</p>
                   </div>
                </div>
              )}

              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Tax & Levies</p>
                 <p className="text-xl font-black font-mono">₹ {invoice.tax_amount.toLocaleString("en-IN")}</p>
              </div>

              {/* High prominence Payable Amount */}
              <div className="sm:col-span-1 lg:col-span-1 p-5 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Payable</p>
                 <div className="text-2xl font-black flex items-baseline gap-1">
                    <span className="text-sm font-sans">₹</span>
                    {invoice.grand_total.toLocaleString("en-IN")}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function InvoicesTab({
  proformaInvoice,
  finalInvoice,
  hasFinalInvoice,
  isCompleted,
  isCancelled,
  onGenerateFinalInvoice,
  isGeneratingFinal,
}: InvoicesTabProps) {
  const canGenerateFinal =
    (isCompleted || isCancelled) && !hasFinalInvoice;

  const [activeSubTab, setActiveSubTab] = useState<string>(
    hasFinalInvoice ? "final" : "proforma"
  );

  return (
    <div className="space-y-8 w-full overflow-hidden">
       {/* Actions & Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-xl font-black">Financial Records</h2>
                <p className="text-xs font-bold text-muted-foreground mt-0.5">Track your proforma and end-of-cycle final invoices.</p>
             </div>
          </div>

          {canGenerateFinal && (
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 shadow-xl shadow-primary/20 font-black transition-all active:scale-95 whitespace-nowrap w-fit"
              onClick={onGenerateFinalInvoice}
              disabled={isGeneratingFinal}
            >
              {isGeneratingFinal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              GENERATE FINAL SETTLEMENT
            </Button>
          )}
       </div>

       {/* Custom In-Tab Navigation */}
       <div className="flex items-center gap-2 p-1.5 rounded-[1.5rem] bg-secondary/40 border border-border/50 w-fit max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab("proforma")}
            className={cn(
              "relative px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap",
              activeSubTab === "proforma" ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeSubTab === "proforma" && (
              <motion.div
                layoutId="invoice-subtab-indicator"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Proforma Details</span>
          </button>
          
          {hasFinalInvoice && (
            <button
               onClick={() => setActiveSubTab("final")}
               className={cn(
               "relative px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap",
               activeSubTab === "final" ? "text-white" : "text-muted-foreground hover:text-foreground"
               )}
            >
               {activeSubTab === "final" && (
               <motion.div
                  layoutId="invoice-subtab-indicator"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
               />
               )}
               <span className="relative z-10">Final Settlement</span>
            </button>
          )}
       </div>

       <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeSubTab === "proforma" ? (
              proformaInvoice ? (
                <InvoiceDisplay
                  invoice={proformaInvoice}
                  label="Proforma"
                />
              ) : (
                <div className="p-20 rounded-4xl bg-secondary/20 border-2 border-dashed border-border/40 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground">No proforma invoice available for this cycle.</p>
                </div>
              )
            ) : (
                finalInvoice ? (
                  <InvoiceDisplay invoice={finalInvoice} label="Final" />
                ) : (
                  <div className="p-20 rounded-4xl bg-secondary/20 border-2 border-dashed border-border/40 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">The final settlement invoice hasn't been generated yet.</p>
                  </div>
                )
            )}
          </motion.div>
       </AnimatePresence>
    </div>
  );
}
