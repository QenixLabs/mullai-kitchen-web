'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { cn } from '@/lib/utils';
import type { ICorporateInvoice } from '@/api/types/corporate.types';

interface CorporateInvoiceTableProps {
  data: ICorporateInvoice[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onMarkPaid?: (id: string) => void;
  isMarkingPaid?: boolean;
}

const statusClass: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const typeLabel: Record<string, string> = {
  proforma: 'Proforma',
  cycle: 'Cycle',
};

export function CorporateInvoiceTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onMarkPaid,
  isMarkingPaid,
}: CorporateInvoiceTableProps) {
  const [markingId, setMarkingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No invoices found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">Try adjusting your search or filters.</p>
      </div>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total ?? data.length);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Invoice #</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead className="hidden xl:table-cell">Period</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Due Date</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invoice) => (
              <TableRow
                key={invoice._id}
                className="group transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell className="hidden md:table-cell">{invoice.company_name}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline" className="capitalize">
                    {typeLabel[invoice.type] || invoice.type}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                  {invoice.billing_period_start && invoice.billing_period_end
                    ? `${new Date(invoice.billing_period_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(invoice.billing_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
                    : '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right font-medium tabular-nums">
                  Rs. {invoice.grand_total.toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusPill className={statusClass[invoice.status]}>
                    {invoice.status}
                  </StatusPill>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
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
                    {['pending', 'overdue'].includes(invoice.status) && (
                      <Can permission="corporate:invoice">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success opacity-60 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setMarkingId(invoice._id);
                            onMarkPaid?.(invoice._id);
                          }}
                          disabled={isMarkingPaid && markingId === invoice._id}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </Can>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {start}–{end} of {total ?? data.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const near =
                Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
              if (!near) {
                if (p === page - 2 || p === page + 2)
                  return (
                    <span key={p} className="text-xs text-muted-foreground px-1">…</span>
                  );
                return null;
              }
              return (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'text-xs',
                    page === p &&
                      'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
