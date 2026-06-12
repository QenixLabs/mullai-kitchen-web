'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Building2,
  CreditCard,
  CalendarDays,
  CheckCircle2,
  Package,
  Search,
  Receipt,
  Wallet,
  Hash,
  ArrowUpRight,
  Clock,
  Leaf,
  Drumstick,
  AlertTriangle,
  Link2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  useAdminCorporateInvoiceDetail,
  useMarkInvoicePaid,
  useGeneratePaymentLink,
} from '@/api/hooks/useAdminCorporate';
import { Can } from '@/components/Auth/can';
import { MarkPaidDialog } from '@/components/admin/corporate/MarkPaidDialog';

const statusClass: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const typeClass: Record<string, string> = {
  proforma: 'bg-info/10 text-info border-info/20',
  cycle: 'bg-primary/10 text-primary border-primary/20',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function CorporateInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useAdminCorporateInvoiceDetail(id);
  const markPaidMutation = useMarkInvoicePaid();
  const generatePaymentLinkMutation = useGeneratePaymentLink();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Invoice not found</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                The invoice you are looking for does not exist or has been removed.
              </p>
            </div>
            <Button className="mt-4 gap-1.5" asChild>
              <Link href="/admin/corporate/invoices">
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = invoice.status === 'pending' || invoice.status === 'overdue';
  const isOverdue = invoice.status === 'overdue';
  const isPaid = invoice.status === 'paid';
  const billingPeriod =
    invoice.billing_period_start && invoice.billing_period_end
      ? `${formatShortDate(invoice.billing_period_start)} – ${formatShortDate(invoice.billing_period_end)}`
      : null;

  const handleDialogSubmit = (payload: { payment_reference?: string; paid_at?: string }) => {
    markPaidMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => setDialogOpen(false),
      },
    );
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6">
        <BackLink />

        {/* Hero */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary ring-1 ring-primary/15">
              {getInitials(invoice.company_name)}
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {invoice.company_name}
                </h1>
                <StatusPill className={statusClass[invoice.status]}>
                  {invoice.status}
                </StatusPill>
                <StatusPill className={typeClass[invoice.type] || 'bg-muted text-muted-foreground border-muted-foreground/20'}>
                  {invoice.type}
                </StatusPill>
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                    {invoice.invoice_number}
                  </code>
                </span>
                {invoice.outlet_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {invoice.outlet_name}
                  </span>
                )}
                {billingPeriod && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {billingPeriod}
                  </span>
                )}
                {invoice.cycle_number != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5" />
                    Cycle {invoice.cycle_number}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5" asChild>
              <Link href={`/admin/corporate/orders/${invoice.corporate_order_id}`}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                View Order
              </Link>
            </Button>
            {isPending && (
              <Can permission="corporate:invoice">
                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setDialogOpen(true)}
                  disabled={markPaidMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => generatePaymentLinkMutation.mutate(id)}
                  disabled={generatePaymentLinkMutation.isPending}
                >
                  <Link2 className="h-4 w-4" />
                  {generatePaymentLinkMutation.isPending ? 'Generating...' : 'Generate Payment Link'}
                </Button>
              </Can>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Receipt className="h-4 w-4" />}
            label="Subtotal"
            value={formatCurrency(invoice.subtotal)}
            sub={
              invoice.line_items.length > 0
                ? `${invoice.line_items.length} line item${invoice.line_items.length === 1 ? '' : 's'}`
                : 'Base amount'
            }
            tone="primary"
          />
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Modifications"
            value={formatCurrency(invoice.total_modification)}
            sub={
              invoice.modifications.length > 0
                ? `${invoice.modifications.length} change${invoice.modifications.length === 1 ? '' : 's'}`
                : 'No adjustments'
            }
            tone={invoice.total_modification > 0 ? 'warning' : 'muted'}
          />
          <StatCard
            icon={<Wallet className="h-4 w-4" />}
            label="Tax"
            value={formatCurrency(invoice.tax_amount)}
            sub="Applied to invoice"
            tone="info"
          />
          <StatCard
            icon={<CreditCard className="h-4 w-4" />}
            label="Grand Total"
            value={formatCurrency(invoice.grand_total)}
            sub={
              isPaid
                ? `Paid ${formatShortDate(invoice.paid_at)}`
                : invoice.due_date
                  ? `Due ${formatShortDate(invoice.due_date)}`
                  : 'Awaiting payment'
            }
            tone={isPaid ? 'success' : isOverdue ? 'destructive' : 'primary'}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Invoice Info */}
          <SectionCard
            icon={<FileText className="h-3.5 w-3.5" />}
            title="Invoice Details"
          >
            <Field label="Invoice #">
              <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                {invoice.invoice_number}
              </code>
            </Field>
            <Field label="Type">
              <span className="capitalize">{invoice.type}</span>
            </Field>
            {billingPeriod && (
              <Field label="Billing Period">
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {billingPeriod}
                </span>
              </Field>
            )}
            {invoice.cycle_number != null && (
              <Field label="Cycle Number">
                <span>#{invoice.cycle_number}</span>
              </Field>
            )}
            <Field label="Created">{formatDate(invoice.created_at)}</Field>
          </SectionCard>

          {/* Payment Info */}
          <SectionCard
            icon={<CreditCard className="h-3.5 w-3.5" />}
            title="Payment Status"
          >
            <Field label="Status">
              <StatusPill className={statusClass[invoice.status]}>
                {invoice.status}
              </StatusPill>
            </Field>
            {invoice.due_date && (
              <Field label="Due Date">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm',
                    isOverdue && 'text-destructive font-semibold',
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(invoice.due_date)}
                </span>
              </Field>
            )}
            {invoice.paid_at && (
              <Field label="Paid On">
                <span className="inline-flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {formatDate(invoice.paid_at)}
                </span>
              </Field>
            )}
            {invoice.payment_reference && (
              <Field label="Payment Ref">
                <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                  {invoice.payment_reference}
                </code>
              </Field>
            )}
            {invoice.payment_link_url && (
              <Field label="Payment Link">
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
                    onClick={() => handleCopyLink(invoice.payment_link_url!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {copied && <span className="text-[10px] text-success">Copied!</span>}
                </div>
              </Field>
            )}
            {invoice.payment_link_expires_at && (
              <Field label="Link Expires">
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(invoice.payment_link_expires_at)}
                </span>
              </Field>
            )}
            {invoice.payment_link_status && (
              <Field label="Link Status">
                <StatusPill className={invoice.payment_link_status === 'active' ? statusClass.pending : statusClass.paid}>
                  {invoice.payment_link_status}
                </StatusPill>
              </Field>
            )}
            {!invoice.paid_at && !invoice.payment_reference && !invoice.payment_link_url && (
              <p className="px-1 pb-1 text-xs text-muted-foreground">
                No payment recorded yet.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Line Items */}
        {invoice.line_items.length > 0 && (
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              <SubHeaderStrip
                icon={<Package className="h-3.5 w-3.5" />}
                title="Line Items"
                count={invoice.line_items.length}
              />
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Unit Price
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.line_items.map((item, idx) => {
                    const isLast = idx === invoice.line_items.length - 1;
                    return (
                      <TableRow
                        key={idx}
                        className={cn(
                          'group transition-colors hover:bg-accent/20',
                          !isLast && 'border-b border-border/50',
                        )}
                      >
                        <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
                          {item.quantity.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modifications */}
        {invoice.modifications.length > 0 && (
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              <SubHeaderStrip
                icon={<FileText className="h-3.5 w-3.5" />}
                title="Modifications"
                count={invoice.modifications.length}
              />
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Veg Δ
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Non-Veg Δ
                    </TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.modifications.map((m, idx) => {
                    const isLast = idx === invoice.modifications.length - 1;
                    return (
                      <TableRow
                        key={idx}
                        className={cn(
                          'group transition-colors hover:bg-accent/20',
                          !isLast && 'border-b border-border/50',
                        )}
                      >
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatShortDate(m.date)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DeltaChip value={m.veg_change} kind="veg" />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DeltaChip value={m.nonveg_change} kind="nonveg" />
                        </TableCell>
                        <TableCell
                          className={cn(
                            'px-4 py-3 text-right text-sm font-semibold tabular-nums',
                            m.modification_amount < 0
                              ? 'text-destructive'
                              : m.modification_amount > 0
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                          )}
                        >
                          {m.modification_amount > 0 ? '+' : ''}
                          {formatCurrency(m.modification_amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pricing Summary */}
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <SubHeaderStrip
              icon={<Receipt className="h-3.5 w-3.5" />}
              title="Pricing Summary"
            />
            <div className="space-y-2 px-4 py-4">
              <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
              {invoice.total_modification !== 0 && (
                <SummaryRow
                  label="Modifications"
                  value={`${invoice.total_modification > 0 ? '+' : ''}${formatCurrency(invoice.total_modification)}`}
                />
              )}
              <SummaryRow label="Tax" value={formatCurrency(invoice.tax_amount)} />
              <div className="my-1 h-px bg-border/60" />
              <SummaryRow
                label="Grand Total"
                value={formatCurrency(invoice.grand_total)}
                emphasis
              />
            </div>
          </CardContent>
        </Card>

        {!isPaid && (
          <Card className="border-border/70 bg-muted/20 shadow-sm">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1',
                  isOverdue
                    ? 'bg-destructive/10 text-destructive ring-destructive/20'
                    : 'bg-warning/15 text-warning ring-warning/20',
                )}
              >
                {isOverdue ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {isOverdue ? 'Payment overdue' : 'Awaiting payment'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.due_date
                    ? `Due on ${formatDate(invoice.due_date)}.`
                    : 'No due date set.'}
                </p>
              </div>
              <Can permission="corporate:invoice">
                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setDialogOpen(true)}
                  disabled={markPaidMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => generatePaymentLinkMutation.mutate(id)}
                  disabled={generatePaymentLinkMutation.isPending}
                >
                  <Link2 className="h-4 w-4" />
                  {generatePaymentLinkMutation.isPending ? 'Generating...' : 'Generate Payment Link'}
                </Button>
              </Can>
            </CardContent>
          </Card>
        )}

        <MarkPaidDialog
          invoiceId={id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleDialogSubmit}
          isSubmitting={markPaidMutation.isPending}
        />
      </div>
    </TooltipProvider>
  );
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 gap-1 text-muted-foreground hover:text-foreground"
      asChild
    >
      <Link href="/admin/corporate/invoices">
        <ArrowLeft className="h-4 w-4" />
        Invoices
      </Link>
    </Button>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    info: 'bg-info/15 text-info ring-info/20',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
              toneStyles[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <SubHeaderStrip icon={icon} title={title} />
        <div className="space-y-2 px-4 py-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function SubHeaderStrip({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-right text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md px-1.5 py-1',
        emphasis &&
          'rounded-lg border border-primary/20 bg-primary/5 px-3 py-2',
      )}
    >
      <span
        className={cn(
          'text-sm',
          emphasis ? 'font-bold text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          emphasis
            ? 'text-lg font-bold text-foreground'
            : 'text-sm font-semibold text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DeltaChip({ value, kind }: { value: number; kind: 'veg' | 'nonveg' }) {
  if (value === 0) {
    return <span className="text-sm text-muted-foreground tabular-nums">0</span>;
  }
  const positive = value > 0;
  const icon =
    kind === 'veg' ? <Leaf className="h-3 w-3" /> : <Drumstick className="h-3 w-3" />;
  const styles =
    kind === 'veg'
      ? 'bg-success/10 text-success ring-success/20'
      : 'bg-rose-50 text-rose-600 ring-rose-100';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ring-1',
        styles,
      )}
    >
      {icon}
      {positive ? '+' : ''}
      {value}
    </span>
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
