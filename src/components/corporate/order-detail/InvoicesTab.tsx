"use client";

import { motion } from "motion/react";
import { IndianRupee, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ICorporateInvoice, ICorporateOrder } from "@/api/types/corporate.types";

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

function BillingSummary({ invoice }: { invoice: ICorporateInvoice }) {
  return (
    <div className="p-6 rounded-2xl bg-[#F8F2F3] border-0 shadow-sm">
      <h3 className="text-lg font-bold mb-6" style={{ color: '#3D000C' }}>Billing Summary</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: '#3D000C' }}>Net Value</span>
          <span className="text-sm font-semibold flex items-center" style={{ color: '#3D000C' }}>
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            {invoice.subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: '#3D000C' }}>Tax & Levies (5%)</span>
          <span className="text-sm font-semibold flex items-center" style={{ color: '#3D000C' }}>
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            {invoice.tax_amount.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#3D000C' }}>TOTAL<br/>PAYABLE</span>
            <span className="text-2xl font-bold flex items-center" style={{ color: '#3D000C' }}>
              <IndianRupee className="w-5 h-5 mr-1" />
              {invoice.grand_total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <div className="pt-4">
          <Button
            className="w-full h-12 rounded-full font-semibold transition-colors shadow-lg"
            style={{ backgroundColor: '#3D000C', color: '#FFFFFF' }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDisplay({ invoice, order }: { invoice: ICorporateInvoice; order: ICorporateOrder }) {
  const getItemSubtitle = (item: ICorporateInvoice['line_items'][number]) => {
    const desc = item.description.toLowerCase();
    if (desc.includes('veg') && !desc.includes('delivery') && !desc.includes('charge')) {
      const persons = order.headcount;
      const mealsPerDay = order.meal_types.length || 1;
      const days = Math.round(item.quantity / (persons * mealsPerDay));
      return `${persons} Persons x ${mealsPerDay} Meals x ${days} Days`;
    }
    if (desc.includes('delivery') || desc.includes('charge')) {
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
      <div className="px-6 sm:px-8 py-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Proforma Record
            </p>
            <h3 className="text-lg font-bold text-foreground tracking-tight truncate">
              {invoice.invoice_number}
            </h3>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="min-w-[500px] px-6 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[45%]">
                    Description
                  </th>
                  <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </th>
                  <th className="text-center py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoice.line_items.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 align-top">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
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
                    <td className="py-4 text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-center text-sm font-medium text-foreground whitespace-nowrap">
                      <span className="inline-flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" />
                        {item.unit_price.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-foreground whitespace-nowrap">
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
      </div>
    </motion.div>
  );
}

export function InvoicesTab({ order, proformaInvoice }: InvoicesTabProps) {
  if (!proformaInvoice) {
    return (
      <div className="w-full">
        <div className="p-16 rounded-2xl bg-muted/30 border border-dashed border-border text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No proforma invoice available for this order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceDisplay invoice={proformaInvoice} order={order} />
        </div>
        <div className="lg:col-span-1">
          <BillingSummary invoice={proformaInvoice} />
        </div>
      </div>
    </div>
  );
}
