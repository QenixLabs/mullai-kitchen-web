'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  FileText,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Eye,
  ClipboardList,
  CalendarDays,
  Percent,
  Link2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import {
  useAdminCorporateCompanyDetail,
  useAdminCorporateCompanyOrders,
  useAdminCorporateCompanyInvoices,
  useUpdateCompanyServiceCharge,
  useGeneratePaymentLink,
} from '@/api/hooks/useAdminCorporate';
import type { ICorporateOrder, ICorporateInvoice } from '@/api/types/corporate.types';
import { Can } from '@/components/Auth/can';

interface CompanyDetailTabsProps {
  companyId: string;
}

const orderStatusVariant: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground border-secondary/30',
  pending_payment: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const paymentStatusVariant: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const invoiceStatusVariant: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CompanyDetailTabs({ companyId }: CompanyDetailTabsProps) {
  const { data: company, isLoading } = useAdminCorporateCompanyDetail(companyId);
  const { data: ordersData, isLoading: ordersLoading } =
    useAdminCorporateCompanyOrders(companyId, { page: 1, limit: 10 });
  const { data: invoicesData, isLoading: invoicesLoading } =
    useAdminCorporateCompanyInvoices(companyId, { page: 1, limit: 10 });
  const generatePaymentLinkMutation = useGeneratePaymentLink();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Company not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The company you are looking for does not exist or has been removed.
            </p>
          </div>
          <Button className="mt-3" size="sm" asChild>
            <Link href="/admin/corporate/companies">
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const active = company.active_orders_count > 0;

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
            <Link href="/admin/corporate/companies">
              <ArrowLeft className="h-4 w-4" />
              Companies
            </Link>
          </Button>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold uppercase text-primary ring-1 ring-primary/15">
              {getInitials(company.company_name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {company.company_name}
                </h1>
                <StatusBadge active={active} />
              </div>
              {company.gst_number && (
                <p className="mt-1">
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                    GST · {company.gst_number}
                  </code>
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {company.active_orders_count} active order
                  {company.active_orders_count !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {company.total_orders_count ?? 0} total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="h-auto gap-1 rounded-lg bg-muted/40 p-1">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="h-4 w-4" />
              Orders
              {ordersData?.total ? (
                <span className="ml-1 text-[10px] font-semibold tabular-nums opacity-80">
                  {ordersData.total}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="flex items-center gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              Invoices
              {invoicesData?.total ? (
                <span className="ml-1 text-[10px] font-semibold tabular-nums opacity-80">
                  {invoicesData.total}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Company Info */}
              <SectionCard
                icon={<Building2 className="h-4 w-4" />}
                title="Company Information"
              >
                <Field label="Company Name" value={company.company_name} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GST Number" value={company.gst_number} mono />
                  <Field label="PAN Number" value={company.pan_number} mono />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Active Orders</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ring-1',
                      active
                        ? 'bg-primary/10 text-primary ring-primary/15'
                        : 'bg-muted text-muted-foreground ring-border',
                    )}
                  >
                    {company.active_orders_count}
                  </span>
                </div>
              </SectionCard>

              {/* Delegate */}
              <SectionCard
                icon={<User className="h-4 w-4" />}
                title="Delegate Information"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name" value={company.delegate?.name} />
                  <Field label="Designation" value={company.delegate?.designation} />
                </div>
                <Field
                  label="Phone"
                  value={company.delegate?.phone}
                  icon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                />
                <Field
                  label="Email"
                  value={company.delegate?.email}
                  icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                />
              </SectionCard>

              {/* Service Charge Settings */}
              <ServiceChargeSettings company={company} />

              {/* Billing Address */}
              <div className="md:col-span-2">
                <SectionCard
                  icon={<MapPin className="h-4 w-4" />}
                  title="Billing Address"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Street Address" value={company.billing_address?.street_address} />
                    <Field label="City" value={company.billing_address?.city} />
                    <Field label="Pincode" value={company.billing_address?.pincode} mono />
                    <Field label="Area / Landmark" value={company.billing_address?.area_landmark} />
                    <Field label="State / Country" value={company.billing_address?.state_country} />
                  </div>
                </SectionCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="p-0">
                <SubHeaderStrip icon={<Package className="h-3.5 w-3.5" />} title="Company Orders" />
                {ordersLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                ) : !ordersData?.orders?.length ? (
                  <EmptyState
                    icon={<Package className="h-6 w-6" />}
                    title="No orders"
                    description="This company has no corporate orders yet."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Order ID
                        </TableHead>
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Outlet
                        </TableHead>
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                          Payment
                        </TableHead>
                        <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Amount
                        </TableHead>
                        <TableHead className="h-10 w-16 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.orders.map((order: ICorporateOrder, idx) => {
                        const isLast = idx === ordersData.orders.length - 1;
                        return (
                          <TableRow
                            key={order._id}
                            className={cn(
                              'group transition-colors hover:bg-accent/20',
                              !isLast && 'border-b border-border/50',
                            )}
                          >
                            <TableCell className="px-4 py-3">
                              <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                                {order.order_id}
                              </code>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                                <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="truncate">{order.outlet_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <StatusPill className={orderStatusVariant[order.status]}>
                                {order.status.replace(/_/g, ' ')}
                              </StatusPill>
                            </TableCell>
                            <TableCell className="hidden px-4 py-3 sm:table-cell">
                              <StatusPill className={paymentStatusVariant[order.payment_status]}>
                                {order.payment_status}
                              </StatusPill>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <span className="text-sm font-bold tabular-nums text-foreground">
                                ₹{order.final_amount?.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    asChild
                                  >
                                    <Link href={`/admin/corporate/orders/${order._id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">View order</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                {ordersData && ordersData.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                    <span>
                      Showing{' '}
                      <span className="font-semibold text-foreground">
                        {ordersData.orders.length}
                      </span>{' '}
                      of <span className="font-semibold text-foreground">{ordersData.total}</span>{' '}
                      orders
                    </span>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                      <Link href={`/admin/corporate/orders?company_id=${companyId}`}>
                        View all
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="p-0">
                <SubHeaderStrip icon={<FileText className="h-3.5 w-3.5" />} title="Company Invoices" />
                {invoicesLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                ) : !invoicesData?.invoices?.length ? (
                  <EmptyState
                    icon={<FileText className="h-6 w-6" />}
                    title="No invoices"
                    description="This company has no invoices yet."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Invoice #
                        </TableHead>
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Type
                        </TableHead>
                        <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Amount
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
                      {invoicesData.invoices.map((invoice: ICorporateInvoice, idx) => {
                        const isLast = idx === invoicesData.invoices.length - 1;
                        return (
                          <TableRow
                            key={invoice._id}
                            className={cn(
                              'group transition-colors hover:bg-accent/20',
                              !isLast && 'border-b border-border/50',
                            )}
                          >
                            <TableCell className="px-4 py-3">
                              <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                                {invoice.invoice_number}
                              </code>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge variant="outline" className="capitalize">
                                {invoice.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <StatusPill className={invoiceStatusVariant[invoice.status]}>
                                {invoice.status}
                              </StatusPill>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <span className="text-sm font-bold tabular-nums text-foreground">
                                ₹{invoice.grand_total?.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                              {invoice.due_date ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(invoice.due_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              ) : (
                                '—'
                              )}
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
                                      <Link href={`/admin/corporate/invoices/${invoice._id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">View invoice</p>
                                  </TooltipContent>
                                </Tooltip>
                                {['pending', 'overdue'].includes(invoice.status) && (
                                  <Can permission="corporate:invoice">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                                          onClick={() => {
                                            setGeneratingId(invoice._id);
                                            generatePaymentLinkMutation.mutate(invoice._id);
                                          }}
                                          disabled={generatePaymentLinkMutation.isPending && generatingId === invoice._id}
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
                )}
                {invoicesData && invoicesData.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                    <span>
                      Showing{' '}
                      <span className="font-semibold text-foreground">
                        {invoicesData.invoices.length}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-foreground">{invoicesData.total}</span>{' '}
                      invoices
                    </span>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                      <Link href={`/admin/corporate/invoices?company_id=${companyId}`}>
                        View all
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function ServiceChargeSettings({
  company,
}: {
  company: {
    _id: string;
    service_charge_enabled: boolean;
    service_charge_percentage: number;
  };
}) {
  const updateServiceCharge = useUpdateCompanyServiceCharge();
  const [enabled, setEnabled] = useState(company.service_charge_enabled);
  const [percentage, setPercentage] = useState(
    company.service_charge_percentage?.toString() || '0',
  );

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      updateServiceCharge.mutate({
        id: company._id,
        data: { service_charge_enabled: false },
      });
    }
  };

  const handleSave = () => {
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return;
    }
    updateServiceCharge.mutate({
      id: company._id,
      data: {
        service_charge_enabled: enabled,
        service_charge_percentage: pct,
      },
    });
  };

  return (
    <div className="md:col-span-2">
      <SectionCard icon={<Percent className="h-4 w-4" />} title="Service Charge Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Enable Service Charge</p>
              <p className="text-xs text-muted-foreground">
                Apply service charge to this company&apos;s orders
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={updateServiceCharge.isPending}
            />
          </div>

          {enabled && (
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Service Charge Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    disabled={updateServiceCharge.isPending}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={updateServiceCharge.isPending}
                size="sm"
                className="mb-0.5"
              >
                {updateServiceCharge.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
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

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inactive
    </span>
  );
}

function Field({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <p className={cn('text-sm font-medium text-foreground', mono && 'font-mono')}>
          {value || '—'}
        </p>
      </div>
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
