'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Building2,
  Hash,
  CreditCard,
  CalendarDays,
  CheckCircle2,
  Package,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAdminCorporateInvoiceDetail } from '@/api/hooks/useAdminCorporate';

const statusClass: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export default function CorporateInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useAdminCorporateInvoiceDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Invoice not found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          The invoice you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/admin/corporate/invoices">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/admin/corporate/invoices">
            <ArrowLeft className="h-4 w-4" />
            Invoices
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {invoice.invoice_number}
            </h1>
            <StatusPill className={statusClass[invoice.status]}>
              {invoice.status}
            </StatusPill>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {invoice.company_name} · {invoice.outlet_name || 'No outlet'}
          </p>
          <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Grand Total</p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            ₹{invoice.grand_total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Hash className="h-4 w-4 text-primary" />}
          label="Invoice #"
          value={invoice.invoice_number}
        />
        <InfoCard
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Company"
          value={invoice.company_name}
        />
        <InfoCard
          icon={<Package className="h-4 w-4 text-primary" />}
          label="Type"
          value={invoice.type.replace(/\b\w/g, (l) => l.toUpperCase())}
        />
        <InfoCard
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          label="Payment Status"
          value={
            <StatusPill className={statusClass[invoice.status]}>
              {invoice.status}
            </StatusPill>
          }
        />
        {invoice.billing_period_start && invoice.billing_period_end && (
          <InfoCard
            icon={<CalendarDays className="h-4 w-4 text-primary" />}
            label="Billing Period"
            value={`${new Date(invoice.billing_period_start).toLocaleDateString('en-IN')} - ${new Date(invoice.billing_period_end).toLocaleDateString('en-IN')}`}
          />
        )}
        {invoice.cycle_number != null && (
          <InfoCard
            icon={<Hash className="h-4 w-4 text-primary" />}
            label="Cycle #"
            value={String(invoice.cycle_number)}
          />
        )}
        <InfoCard
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          label="Due Date"
          value={
            invoice.due_date
              ? new Date(invoice.due_date).toLocaleDateString('en-IN')
              : '-'
          }
        />
        {invoice.paid_at && (
          <InfoCard
            icon={<CheckCircle2 className="h-4 w-4 text-success" />}
            label="Paid At"
            value={new Date(invoice.paid_at).toLocaleDateString('en-IN')}
          />
        )}
        {invoice.payment_reference && (
          <InfoCard
            icon={<CreditCard className="h-4 w-4 text-primary" />}
            label="Payment Ref"
            value={invoice.payment_reference}
            mono
          />
        )}
      </div>

      {/* Pricing Breakdown */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Pricing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">₹{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.total_modification > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Modifications</span>
              <span className="font-medium tabular-nums">₹{invoice.total_modification.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium tabular-nums">₹{invoice.tax_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Grand Total</span>
            <span className="font-bold text-lg tabular-nums">
              ₹{invoice.grand_total.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {invoice.line_items.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.line_items.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className="group transition-colors hover:bg-primary/[0.03]"
                    >
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        ₹{item.unit_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        ₹{item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modifications */}
      {invoice.modifications.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Veg Change</TableHead>
                    <TableHead className="text-right">Non-veg Change</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.modifications.map((m, idx) => (
                    <TableRow
                      key={idx}
                      className="group transition-colors hover:bg-primary/[0.03]"
                    >
                      <TableCell>
                        {new Date(m.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{m.veg_change}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.nonveg_change}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        ₹{m.modification_amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        className,
      )}
    >
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
            {label}
          </p>
          <div
            className={cn(
              'text-sm font-medium text-foreground truncate',
              mono && 'font-mono',
            )}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
