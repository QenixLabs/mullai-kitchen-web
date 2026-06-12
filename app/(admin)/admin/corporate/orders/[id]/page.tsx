'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  ClipboardList,
  FileText,
  CalendarDays,
  Info,
  Building2,
  Users,
  Salad,
  Drumstick,
  MapPin,
  Eye,
  Package,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import {
  useAdminCorporateOrderDetail,
  useAdminCorporateOrderModifications,
  useAdminCorporateOrderInvoices,
  useAdminCorporateOrderDailyOrders,
  useGeneratePaymentLink,
} from '@/api/hooks/useAdminCorporate';
import { UpdateStatusDialog } from '@/components/admin/corporate/UpdateStatusDialog';
import type { CorporateOrderStatus, ICorporateInvoice } from '@/api/types/corporate.types';
import { cn } from '@/lib/utils';

const orderStatusClass: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground border-secondary/30',
  pending_payment: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const paymentStatusClass: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const dailyStatusClass: Record<string, string> = {
  planned: 'bg-secondary text-secondary-foreground border-secondary/30',
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-info/10 text-info border-info/20',
  preparing: 'bg-primary/10 text-primary border-primary/20',
  ready: 'bg-success/10 text-success border-success/20',
  out_for_delivery: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const invoiceStatusClass: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const modStatusClass: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  applied: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CorporateOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading } = useAdminCorporateOrderDetail(id);
  const { data: modificationsData } = useAdminCorporateOrderModifications(id);
  const { data: invoicesData } = useAdminCorporateOrderInvoices(id);
  const { data: dailyOrdersData } = useAdminCorporateOrderDailyOrders(id, { page: 1, limit: 20 });

  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Order not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The order you are looking for does not exist or has been removed.
            </p>
          </div>
          <Button className="mt-3" size="sm" asChild>
            <Link href="/admin/corporate/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const modifications = modificationsData?.data ?? [];
  const invoices = invoicesData?.data ?? [];
  const dailyOrders = dailyOrdersData?.data ?? [];
  const dailyOrdersTotalPages = dailyOrdersData?.totalPages ?? 1;

  const startDate = new Date(order.start_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endDate = new Date(order.end_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const canModify =
    order.status === 'active' || order.status === 'pending_payment' || order.status === 'draft';

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6">
        {/* Back link */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/admin/corporate/orders">
              <ArrowLeft className="h-4 w-4" />
              Orders
            </Link>
          </Button>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold uppercase text-primary ring-1 ring-primary/15">
              {getInitials(order.company_name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {order.company_name}
                </h1>
                <StatusPill className={orderStatusClass[order.status]}>
                  {order.status.replace(/_/g, ' ')}
                </StatusPill>
                <StatusPill className={paymentStatusClass[order.payment_status]}>
                  {order.payment_status}
                </StatusPill>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                  {order.order_id}
                </code>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {order.outlet_name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {startDate} – {endDate}
                </span>
              </div>
            </div>
          </div>
          <Can permission="corporate:modify">
            {canModify && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setShowUpdateStatusDialog(true)}
              >
                <Edit3 className="h-4 w-4" />
                Update Status
              </Button>
            )}
          </Can>
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Headcount"
            value={`${order.headcount}`}
            sub="People served"
            tone="primary"
          />
          <StatCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Delivery Days"
            value={`${order.total_delivery_days}`}
            sub={`${order.billing_cycle_days}-day billing cycle`}
            tone="info"
          />
          <StatCard
            icon={<Salad className="h-4 w-4" />}
            label="Veg / Day"
            value={`${order.veg_count}`}
            sub={`₹${order.veg_price_per_meal}/meal`}
            tone="success"
          />
          <StatCard
            icon={<Drumstick className="h-4 w-4" />}
            label="Non-Veg / Day"
            value={`${order.nonveg_count}`}
            sub={`₹${order.nonveg_price_per_meal}/meal`}
            tone="destructive"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="h-auto flex-wrap gap-1 rounded-lg bg-muted/40 p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="modifications"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ClipboardList className="h-4 w-4" />
              Modifications
              {modifications.length > 0 && (
                <span className="ml-1 text-[10px] font-semibold tabular-nums opacity-80">
                  {modifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              Invoices
              {invoices.length > 0 && (
                <span className="ml-1 text-[10px] font-semibold tabular-nums opacity-80">
                  {invoices.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="daily-orders"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CalendarDays className="h-4 w-4" />
              Daily Orders
              {dailyOrdersData?.total ? (
                <span className="ml-1 text-[10px] font-semibold tabular-nums opacity-80">
                  {dailyOrdersData.total}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab order={order} />
          </TabsContent>

          <TabsContent value="modifications">
            <ModificationsTab modifications={modifications} />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesTab invoices={invoices} />
          </TabsContent>

          <TabsContent value="daily-orders">
            <DailyOrdersTab
              dailyOrders={dailyOrders}
              totalPages={dailyOrdersTotalPages}
              orderId={id}
            />
          </TabsContent>
        </Tabs>

        <UpdateStatusDialog
          orderId={id}
          currentStatus={order.status as CorporateOrderStatus}
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
        />
      </div>
    </TooltipProvider>
  );
}

function OverviewTab({
  order,
}: {
  order: NonNullable<ReturnType<typeof useAdminCorporateOrderDetail>['data']>;
}) {
  const proforma = order.proforma_amount;
  const mods = order.total_modification_amount;
  const final = order.final_amount;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard icon={<Package className="h-4 w-4" />} title="Order Summary">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Order ID" value={order.order_id} mono />
          <Field label="Company" value={order.company_name} />
          <Field label="Outlet" value={order.outlet_name} />
          <Field label="Headcount" value={`${order.headcount}`} />
          <Field label="Veg / Day" value={`${order.veg_count}`} />
          <Field label="Non-Veg / Day" value={`${order.nonveg_count}`} />
        </div>
      </SectionCard>

      <SectionCard icon={<CalendarDays className="h-4 w-4" />} title="Schedule">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Start Date"
            value={new Date(order.start_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <Field
            label="End Date"
            value={new Date(order.end_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <Field label="Total Delivery Days" value={`${order.total_delivery_days}`} />
          <Field label="Billing Cycle" value={`${order.billing_cycle_days} days`} />
        </div>
        <Separator />
        <Field label="Meal Types" value={order.meal_types.join(', ')} />
        <Field label="Selected Days" value={order.selected_days.join(', ')} />
      </SectionCard>

      <SectionCard icon={<MapPin className="h-4 w-4" />} title="Delivery Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address" value={order.delivery_address.address_line} />
          <Field label="Area" value={order.delivery_address.area} />
          {order.delivery_address.landmark && (
            <Field label="Landmark" value={order.delivery_address.landmark} />
          )}
          <Field label="City" value={order.delivery_address.city} />
          <Field label="State" value={order.delivery_address.state} />
          <Field label="Pincode" value={order.delivery_address.pincode} mono />
        </div>
      </SectionCard>

      <SectionCard icon={<FileText className="h-4 w-4" />} title="Pricing Breakdown">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Veg Price/Meal" value={`₹${order.veg_price_per_meal}`} />
          <Field label="Non-Veg Price/Meal" value={`₹${order.nonveg_price_per_meal}`} />
          <Field label="Delivery Charge/Day" value={`₹${order.delivery_charge_per_day}`} />
          <Field label="Tax Rate" value={`${(order.tax_rate * 100).toFixed(0)}%`} />
        </div>
        <Separator />
        <div className="space-y-2">
          <SummaryRow label="Proforma Amount" value={`₹${proforma.toLocaleString('en-IN')}`} />
          <SummaryRow
            label="Modifications"
            value={`${mods >= 0 ? '+' : ''}₹${mods.toLocaleString('en-IN')}`}
            tone={mods === 0 ? 'muted' : mods > 0 ? 'success' : 'destructive'}
          />
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <span className="text-sm font-semibold text-foreground">Final Amount</span>
            <span className="text-base font-bold tabular-nums text-primary">
              ₹{final.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ModificationsTab({
  modifications,
}: {
  modifications: {
    _id: string;
    modification_date: string;
    veg_change: number;
    nonveg_change: number;
    reason?: string;
    modification_amount: number;
    status: string;
  }[];
}) {
  if (!modifications.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <SubHeaderStrip icon={<ClipboardList className="h-3.5 w-3.5" />} title="Modifications" />
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No modifications"
            description="No modifications have been applied to this order."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <SubHeaderStrip icon={<ClipboardList className="h-3.5 w-3.5" />} title="Modifications" />
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
              <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Reason
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifications.map((m, idx) => {
              const isLast = idx === modifications.length - 1;
              return (
                <TableRow
                  key={m._id}
                  className={cn(
                    'group transition-colors hover:bg-accent/20',
                    !isLast && 'border-b border-border/50',
                  )}
                >
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(m.modification_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <DeltaChip value={m.veg_change} kind="veg" />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <DeltaChip value={m.nonveg_change} kind="nonveg" />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        m.modification_amount >= 0 ? 'text-foreground' : 'text-destructive',
                      )}
                    >
                      ₹{m.modification_amount.toLocaleString('en-IN')}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-[260px] px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    <span className="block truncate" title={m.reason || ''}>
                      {m.reason || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill className={modStatusClass[m.status]}>{m.status}</StatusPill>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InvoicesTab({ invoices }: { invoices: ICorporateInvoice[] }) {
  const generatePaymentLinkMutation = useGeneratePaymentLink();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  if (!invoices.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <SubHeaderStrip icon={<FileText className="h-3.5 w-3.5" />} title="Invoices" />
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No invoices"
            description="No invoices have been generated for this order yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <SubHeaderStrip icon={<FileText className="h-3.5 w-3.5" />} title="Invoices" />
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-background hover:bg-background">
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Invoice #
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                Period
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Due Date
              </TableHead>
              <TableHead className="h-10 w-16 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv, idx) => {
              const isLast = idx === invoices.length - 1;
              return (
                <TableRow
                  key={inv._id}
                  className={cn(
                    'group transition-colors hover:bg-accent/20',
                    !isLast && 'border-b border-border/50',
                  )}
                >
                  <TableCell className="px-4 py-3">
                    <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                      {inv.invoice_number}
                    </code>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {inv.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 lg:table-cell">
                    {inv.billing_period_start && inv.billing_period_end ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>
                          {new Date(inv.billing_period_start).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          –{' '}
                          {new Date(inv.billing_period_end).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      ₹{inv.grand_total.toLocaleString('en-IN')}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill className={invoiceStatusClass[inv.status]}>
                      {inv.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href={`/admin/corporate/invoices/${inv._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">View invoice</p>
                        </TooltipContent>
                      </Tooltip>
                      {['pending', 'overdue'].includes(inv.status) && (
                        <Can permission="corporate:invoice">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setGeneratingId(inv._id);
                                  generatePaymentLinkMutation.mutate(inv._id);
                                }}
                                disabled={generatePaymentLinkMutation.isPending && generatingId === inv._id}
                              >
                                <Link2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">Generate payment link</p>
                            </TooltipContent>
                          </Tooltip>
                        </Can>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DailyOrdersTab({
  dailyOrders,
  totalPages,
  orderId,
}: {
  dailyOrders: {
    _id: string;
    date: string;
    veg_count: number;
    nonveg_count: number;
    total_meals: number;
    status: string;
    notes?: string;
  }[];
  totalPages: number;
  orderId: string;
}) {
  const [page, setPage] = useState(1);
  const { data } = useAdminCorporateOrderDailyOrders(orderId, { page, limit: 20 });
  const orders = data?.data ?? dailyOrders;
  const pages = data?.totalPages ?? totalPages;

  if (!orders.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <SubHeaderStrip icon={<CalendarDays className="h-3.5 w-3.5" />} title="Daily Orders" />
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No daily orders"
            description="Daily delivery records for this order have not been generated yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <SubHeaderStrip icon={<CalendarDays className="h-3.5 w-3.5" />} title="Daily Orders" />
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-background hover:bg-background">
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Veg
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Non-Veg
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((d, idx) => {
              const isLast = idx === orders.length - 1;
              return (
                <TableRow
                  key={d._id}
                  className={cn(
                    'group transition-colors hover:bg-accent/20',
                    !isLast && 'border-b border-border/50',
                  )}
                >
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(d.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {d.veg_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-success ring-1 ring-success/20">
                        <Salad className="h-3 w-3" />
                        {d.veg_count}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground tabular-nums">0</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {d.nonveg_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-rose-600 ring-1 ring-rose-100">
                        <Drumstick className="h-3 w-3" />
                        {d.nonveg_count}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground tabular-nums">0</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {d.total_meals}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill className={dailyStatusClass[d.status]}>
                      {d.status.replace(/_/g, ' ')}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="hidden max-w-[240px] px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    <span className="block truncate" title={d.notes || ''}>
                      {d.notes || '—'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              Page <span className="font-semibold text-foreground">{page}</span> of{' '}
              <span className="font-semibold text-foreground">{pages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'info' | 'success' | 'destructive';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    info: 'bg-info/15 text-info ring-info/20',
    success: 'bg-success/15 text-success ring-success/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
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
      <div className="flex items-center gap-2 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      <CardContent className="space-y-4 p-4">{children}</CardContent>
    </Card>
  );
}

function SubHeaderStrip({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        {icon}
      </span>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('text-sm font-medium text-foreground', mono && 'font-mono')}>
        {value || '—'}
      </p>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border/60" />;
}

function SummaryRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'muted' | 'success' | 'destructive';
}) {
  const toneClass = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    success: 'text-success',
    destructive: 'text-destructive',
  }[tone];

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold tabular-nums', toneClass)}>{value}</span>
    </div>
  );
}

function DeltaChip({ value, kind }: { value: number; kind: 'veg' | 'nonveg' }) {
  if (value === 0) {
    return <span className="text-sm text-muted-foreground tabular-nums">0</span>;
  }
  const positive = value > 0;
  const colorClass =
    kind === 'veg'
      ? 'bg-success/10 text-success ring-success/20'
      : 'bg-rose-50 text-rose-600 ring-rose-100';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ring-1',
        colorClass,
      )}
    >
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

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">{icon}</div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
