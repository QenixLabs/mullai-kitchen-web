'use client';

import { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Inbox,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { Can } from '@/components/Auth/can';
import { useUserInvoices, useMarkInvoicePaid } from '@/api/hooks/useAdminUserFinancial';
import type {
  IndividualInvoiceStatus,
  CorporateInvoiceStatus,
  AdminIndividualInvoice,
  AdminCorporateInvoice,
} from '@/api/admin-user-financial.api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserInvoicesTabProps {
  userId: string;
  userRole: string;
}

const CUSTOMER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const CORPORATE_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CUSTOMER_BADGE_STYLES: Record<IndividualInvoiceStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  paid: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  failed: 'bg-red-500/15 text-red-600 border-red-500/20',
  refunded: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
};

const CORPORATE_BADGE_STYLES: Record<CorporateInvoiceStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  paid: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  overdue: 'bg-red-500/15 text-red-600 border-red-500/20',
  cancelled: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
};

function InvoiceSkeletonCard() {
  return (
    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function InvoiceSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <InvoiceSkeletonCard key={i} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-5 rounded-2xl bg-muted/60 mb-6">
        <Inbox className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No invoices found</h3>
      <p className="text-sm text-muted-foreground text-center">
        No invoices found for this user.
      </p>
    </div>
  );
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function isIndividualInvoice(invoice: AdminIndividualInvoice | AdminCorporateInvoice): invoice is AdminIndividualInvoice {
  return 'subscription_id' in invoice;
}

function MarkAsPaidButton({
  invoiceId,
  userId,
  isDisabled,
}: {
  invoiceId: string;
  userId: string;
  isDisabled: boolean;
}) {
  const markPaidMutation = useMarkInvoicePaid(userId);
  const [paymentRef, setPaymentRef] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isDisabled) return null;

  return (
    <Can permission="invoice:mark-paid">
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Paid
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Invoice as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this invoice as paid? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Payment Reference (optional)
            </label>
            <Input
              placeholder="Enter payment reference"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                markPaidMutation.mutate({
                  invoiceId,
                  data: { payment_reference: paymentRef || undefined },
                }, {
                  onSuccess: () => setDialogOpen(false),
                });
              }}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Can>
  );
}

export function UserInvoicesTab({ userId, userRole }: UserInvoicesTabProps) {
  const isCorporate = userRole === 'corporate';
  const statusOptions = isCorporate ? CORPORATE_STATUS_OPTIONS : CUSTOMER_STATUS_OPTIONS;
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useUserInvoices(userId, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit,
  });

  function getBadgeClasses(status: string): string {
    if (isCorporate) {
      return CORPORATE_BADGE_STYLES[status as CorporateInvoiceStatus] || '';
    }
    return CUSTOMER_BADGE_STYLES[status as IndividualInvoiceStatus] || '';
  }

  return (
    <Can
      permission="invoice:view:any"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-5 rounded-2xl bg-red-50 mb-6">
            <FileText className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view invoices.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Invoices</h3>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <InvoiceSkeletonGrid />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <FileText className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to Load</h3>
            <p className="text-sm text-muted-foreground text-center">
              Unable to fetch invoices. Please try again later.
            </p>
          </div>
        ) : !data || data.invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.invoices.map((invoice) => {
                if (isIndividualInvoice(invoice)) {
                  return (
                    <IndividualInvoiceCard
                      key={invoice._id}
                      invoice={invoice}
                      userId={userId}
                      badgeClasses={getBadgeClasses(invoice.status)}
                    />
                  );
                }
                return (
                  <CorporateInvoiceCard
                    key={invoice._id}
                    invoice={invoice}
                    userId={userId}
                    badgeClasses={getBadgeClasses(invoice.status)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Can>
  );
}

function IndividualInvoiceCard({
  invoice,
  userId,
  badgeClasses,
}: {
  invoice: AdminIndividualInvoice;
  userId: string;
  badgeClasses: string;
}) {
  const canMarkPaid = invoice.status === 'pending' || invoice.status === 'failed';

  return (
    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {invoice.invoice_number}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn('text-[11px] font-semibold px-2.5 py-0.5 shrink-0', badgeClasses)}
        >
          {getStatusLabel(invoice.status)}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div>Plan: <span className="text-foreground">{invoice.plan_name}</span></div>
        <div className="flex items-center gap-1">
          <IndianRupee className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">₹{invoice.amount.toLocaleString('en-IN')}</span>
        </div>
        {invoice.due_date && (
          <div>Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}</div>
        )}
        {invoice.paid_at && (
          <div>Paid: {format(new Date(invoice.paid_at), 'dd MMM yyyy')}</div>
        )}
      </div>

      {/* Mark as Paid */}
      {canMarkPaid && (
        <div className="pt-2 border-t border-border/40">
          <MarkAsPaidButton invoiceId={invoice._id} userId={userId} isDisabled={false} />
        </div>
      )}
    </div>
  );
}

function CorporateInvoiceCard({
  invoice,
  userId,
  badgeClasses,
}: {
  invoice: AdminCorporateInvoice;
  userId: string;
  badgeClasses: string;
}) {
  const canMarkPaid = invoice.status === 'pending' || invoice.status === 'overdue';

  return (
    <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {invoice.invoice_number}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
            {invoice.type === 'proforma' ? 'Proforma' : 'Cycle'}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-[11px] font-semibold px-2.5 py-0.5', badgeClasses)}
          >
            {getStatusLabel(invoice.status)}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div>Company: <span className="text-foreground">{invoice.company_name}</span></div>
        <div className="flex items-center gap-1">
          <IndianRupee className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">₹{invoice.grand_total.toLocaleString('en-IN')}</span>
        </div>
        {invoice.due_date && (
          <div>Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}</div>
        )}
      </div>

      {/* Mark as Paid */}
      {canMarkPaid && (
        <div className="pt-2 border-t border-border/40">
          <MarkAsPaidButton invoiceId={invoice._id} userId={userId} isDisabled={false} />
        </div>
      )}
    </div>
  );
}
