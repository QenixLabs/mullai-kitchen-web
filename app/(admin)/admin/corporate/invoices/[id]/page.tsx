'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Building2, CalendarDays, Hash, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminCorporateInvoiceDetail } from '@/api/hooks/useAdminCorporate';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  paid: 'default',
  pending: 'secondary',
  overdue: 'destructive',
  cancelled: 'outline',
};

export default function CorporateInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useAdminCorporateInvoiceDetail(id);

  if (isLoading) return <div className="flex justify-center py-8 text-muted-foreground">Loading invoice...</div>;
  if (!invoice) return <div className="flex justify-center py-8 text-muted-foreground">Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/corporate/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoice Details</h1>
          <p className="text-sm text-muted-foreground">{invoice.invoice_number} - {invoice.company_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Info</CardTitle>
            <Badge variant={statusVariant[invoice.status] || 'secondary'}>
              {invoice.status.replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Invoice #:</span> <span className="font-medium ml-1">{invoice.invoice_number}</span></div>
            <div><span className="text-muted-foreground">Company:</span> <span className="font-medium ml-1">{invoice.company_name}</span></div>
            <div><span className="text-muted-foreground">Outlet:</span> <span className="font-medium ml-1">{invoice.outlet_name || '-'}</span></div>
            <div><span className="text-muted-foreground">Type:</span> <span className="font-medium ml-1">{invoice.type.replace(/\b\w/g, (l: string) => l.toUpperCase())}</span></div>
            {invoice.billing_period_start && invoice.billing_period_end && (
              <div><span className="text-muted-foreground">Billing Period:</span> <span className="font-medium ml-1">{new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}</span></div>
            )}
            {invoice.cycle_number && (
              <div><span className="text-muted-foreground">Cycle #:</span> <span className="font-medium ml-1">{invoice.cycle_number}</span></div>
            )}
            <div><span className="text-muted-foreground">Due Date:</span> <span className="font-medium ml-1">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</span></div>
            <div><span className="text-muted-foreground">Paid At:</span> <span className="font-medium ml-1">{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : '-'}</span></div>
            {invoice.payment_reference && (
              <div><span className="text-muted-foreground">Payment Ref:</span> <span className="font-medium ml-1">{invoice.payment_reference}</span></div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing Breakdown</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span></div>
          {invoice.total_modification > 0 && (
            <div className="flex justify-between"><span className="text-muted-foreground">Modifications</span><span className="font-medium">₹{invoice.total_modification.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">₹{invoice.tax_amount.toLocaleString()}</span></div>
          <div className="flex justify-between border-t pt-2 mt-2"><span className="font-medium">Grand Total</span><span className="font-bold">₹{invoice.grand_total.toLocaleString()}</span></div>
        </CardContent>
      </Card>

      {invoice.line_items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Quantity</th>
                    <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item: { description: string; quantity: number; unit_price: number; amount: number }, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₹{item.unit_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {invoice.modifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Modifications</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Veg Change</th>
                    <th className="px-4 py-3 text-right font-medium">Non-veg Change</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.modifications.map((m: { date: string; veg_change: number; nonveg_change: number; modification_amount: number }, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-3">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">{m.veg_change}</td>
                      <td className="px-4 py-3 text-right">{m.nonveg_change}</td>
                      <td className="px-4 py-3 text-right font-medium">₹{m.modification_amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
