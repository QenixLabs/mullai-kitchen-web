'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle } from 'lucide-react';
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
import { Can } from '@/components/Auth/can';
import type { ICorporateInvoice } from '@/api/types/corporate.types';

interface CorporateInvoiceTableProps {
  data: ICorporateInvoice[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onMarkPaid?: (id: string) => void;
  isMarkingPaid?: boolean;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'outline',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
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
  onPageChange,
  onMarkPaid,
  isMarkingPaid,
}: CorporateInvoiceTableProps) {
  const [markingId, setMarkingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading invoices...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No invoices found</div>;
  }

  const handleMarkPaid = (id: string) => {
    setMarkingId(id);
    onMarkPaid?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cycle #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.company_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{typeLabel[invoice.type] || invoice.type}</Badge>
                </TableCell>
                <TableCell>{invoice.cycle_number ?? '-'}</TableCell>
                <TableCell>Rs. {invoice.grand_total.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[invoice.status] || 'secondary'}>
                    {statusLabel[invoice.status] || invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/corporate/invoices/${invoice._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {invoice.status === 'pending' && (
                      <Can permission="corporate:invoice">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success"
                          onClick={() => handleMarkPaid(invoice._id)}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
