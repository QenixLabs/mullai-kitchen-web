"use client";

import { useState } from "react";
import { IndianRupee, FileText, PlusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{label} Invoice</h3>
          <p className="text-sm text-muted-foreground">
            {invoice.invoice_number}
          </p>
        </div>
        <Badge
          variant={
            invoice.status === "paid"
              ? "default"
              : invoice.status === "overdue"
                ? "destructive"
                : "secondary"
          }
        >
          {invoice.status
            ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
            : "Pending"}
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
          {invoice.line_items.map((item, i) => (
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
            {invoice.subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        {invoice.total_reduction > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Modifications Credit</span>
            <span>
              - <IndianRupee className="h-3 w-3 inline" />
              {invoice.total_reduction.toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>
            <IndianRupee className="h-3 w-3 inline" />
            {invoice.tax_amount.toLocaleString("en-IN")}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Grand Total</span>
          <span className="text-primary">
            <IndianRupee className="h-4 w-4 inline" />
            {invoice.grand_total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
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
    <div className="relative rounded-2xl bg-card border border-border shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FileText className="h-5 w-5 text-primary" />
            Invoices
          </h2>
          {canGenerateFinal && (
            <Button
              className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-md shadow-primary/20"
              onClick={onGenerateFinalInvoice}
              disabled={isGeneratingFinal}
            >
              {isGeneratingFinal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Generate Final Invoice
            </Button>
          )}
        </div>

        {/* Sub-tabs for Proforma / Final */}
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="proforma">Proforma</TabsTrigger>
            {hasFinalInvoice && <TabsTrigger value="final">Final</TabsTrigger>}
          </TabsList>

          <TabsContent value="proforma">
            {proformaInvoice ? (
              <InvoiceDisplay
                invoice={proformaInvoice}
                label="Proforma"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No proforma invoice available yet.
              </div>
            )}
          </TabsContent>

          {hasFinalInvoice && (
            <TabsContent value="final">
              {finalInvoice ? (
                <InvoiceDisplay invoice={finalInvoice} label="Final" />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No final invoice available yet.
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
