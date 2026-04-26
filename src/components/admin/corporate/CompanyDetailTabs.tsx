'use client';

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
  Briefcase,
  Eye,
  Search,
  ClipboardList,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  useAdminCorporateCompanyDetail,
  useAdminCorporateCompanyOrders,
  useAdminCorporateCompanyInvoices,
} from '@/api/hooks/useAdminCorporate';
import type { ICorporateOrder, ICorporateInvoice } from '@/api/types/corporate.types';

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

export function CompanyDetailTabs({ companyId }: CompanyDetailTabsProps) {
  const { data: company, isLoading } = useAdminCorporateCompanyDetail(companyId);
  const { data: ordersData, isLoading: ordersLoading } =
    useAdminCorporateCompanyOrders(companyId, { page: 1, limit: 10 });
  const { data: invoicesData, isLoading: invoicesLoading } =
    useAdminCorporateCompanyInvoices(companyId, { page: 1, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Company not found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          The company you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/admin/corporate/companies">
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
      </div>
    );
  }

  const active = company.active_orders_count > 0;

  return (
    <div className="space-y-8">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/admin/corporate/companies">
            <ArrowLeft className="h-4 w-4" />
            Companies
          </Link>
        </Button>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={company.company_name} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {company.company_name}
              </h1>
              <StatusBadge active={active} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {company.gst_number || 'No GST'}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
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
            <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="rounded-lg bg-muted/40 p-1 h-auto gap-1">
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

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Company Info */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-primary" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field label="Company Name" value={company.company_name} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GST Number" value={company.gst_number} mono />
                  <Field label="PAN Number" value={company.pan_number} mono />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Active Orders</span>
                  <Badge
                    variant={active ? 'default' : 'secondary'}
                    className={cn(
                      active && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                  >
                    {company.active_orders_count}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Delegate */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Delegate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
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
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="border-border/60 shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Street Address" value={company.billing_address?.street_address} />
                  <Field label="City" value={company.billing_address?.city} />
                  <Field label="Pincode" value={company.billing_address?.pincode} mono />
                  <Field label="Area / Landmark" value={company.billing_address?.area_landmark} />
                  <Field label="State / Country" value={company.billing_address?.state_country} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Company Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : !ordersData?.orders?.length ? (
                <EmptyState icon={<Package className="h-6 w-6" />} title="No orders" description="This company has no corporate orders yet." />
              ) : (
                <div className="rounded-xl border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Order ID</TableHead>
                        <TableHead>Outlet</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-14 text-right">View</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.orders.map((order: ICorporateOrder) => (
                        <TableRow key={order._id} className="group transition-colors hover:bg-primary/[0.03]">
                          <TableCell className="font-medium">{order.order_id}</TableCell>
                          <TableCell>{order.outlet_name}</TableCell>
                          <TableCell>
                            <StatusPill className={orderStatusVariant[order.status]}>
                              {order.status.replace(/_/g, ' ')}
                            </StatusPill>
                          </TableCell>
                          <TableCell>
                            <StatusPill className={paymentStatusVariant[order.payment_status]}>
                              {order.payment_status}
                            </StatusPill>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            Rs. {order.final_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <Link href={`/admin/corporate/orders/${order._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {ordersData && ordersData.totalPages > 1 && (
                <p className="mt-3 text-xs text-muted-foreground text-right">
                  Showing {ordersData.orders.length} of {ordersData.total} orders
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Company Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : !invoicesData?.invoices?.length ? (
                <EmptyState icon={<FileText className="h-6 w-6" />} title="No invoices" description="This company has no invoices yet." />
              ) : (
                <div className="rounded-xl border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="w-14 text-right">View</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesData.invoices.map((invoice: ICorporateInvoice) => (
                        <TableRow key={invoice._id} className="group transition-colors hover:bg-primary/[0.03]">
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {invoice.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusPill className={invoiceStatusVariant[invoice.status]}>
                              {invoice.status}
                            </StatusPill>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            Rs. {invoice.grand_total?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {invoice.due_date
                              ? new Date(invoice.due_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <Link href={`/admin/corporate/invoices/${invoice._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {invoicesData && invoicesData.totalPages > 1 && (
                <p className="mt-3 text-xs text-muted-foreground text-right">
                  Showing {invoicesData.invoices.length} of {invoicesData.total} invoices
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const sizeClasses = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-xs';
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold',
        sizeClasses,
      )}
    >
      {initials || <Building2 className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />}
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
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <p className={cn('text-sm font-medium text-foreground', mono && 'font-mono')}>{value || '-'}</p>
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
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
}
