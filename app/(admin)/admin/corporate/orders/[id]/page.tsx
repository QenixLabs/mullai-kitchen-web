'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, ClipboardList, FileText, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Can } from '@/components/Auth/can';
import {
  useAdminCorporateOrderDetail,
  useAdminCorporateOrderDailyOrders,
} from '@/api/hooks/useAdminCorporate';
import { UpdateStatusDialog } from '@/components/admin/corporate/UpdateStatusDialog';
import type { CorporateOrderStatus } from '@/api/types/corporate.types';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  pending_payment: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
};

export default function CorporateOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: detailData, isLoading } = useAdminCorporateOrderDetail(id);
  const { data: dailyOrdersData } = useAdminCorporateOrderDailyOrders(id, { page: 1, limit: 20 });

  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  if (isLoading) return <div className="flex justify-center py-8 text-muted-foreground">Loading order...</div>;
  if (!detailData) return <div className="flex justify-center py-8 text-muted-foreground">Order not found</div>;

  const order = detailData.order;
  const modifications = detailData.modifications ?? [];
  const invoices = detailData.invoices ?? [];
  const dailyOrders = dailyOrdersData?.data ?? [];
  const dailyOrdersTotalPages = dailyOrdersData?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/corporate/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Corporate Order Details</h1>
          <p className="text-sm text-muted-foreground">{order.order_id} - {order.company_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Info</CardTitle>
            <Badge variant={statusVariant[order.status] || 'secondary'}>
              {order.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Order ID:</span> <span className="font-medium ml-1">{order.order_id}</span></div>
            <div><span className="text-muted-foreground">Company:</span> <span className="font-medium ml-1">{order.company_name}</span></div>
            <div><span className="text-muted-foreground">Outlet:</span> <span className="font-medium ml-1">{order.outlet_name}</span></div>
            <div><span className="text-muted-foreground">Headcount:</span> <span className="font-medium ml-1">{order.headcount}</span></div>
            <div><span className="text-muted-foreground">Start Date:</span> <span className="font-medium ml-1">{new Date(order.start_date).toLocaleDateString()}</span></div>
            <div><span className="text-muted-foreground">End Date:</span> <span className="font-medium ml-1">{new Date(order.end_date).toLocaleDateString()}</span></div>
            <div><span className="text-muted-foreground">Veg:</span> <span className="font-medium ml-1">{order.veg_count}</span></div>
            <div><span className="text-muted-foreground">Non-veg:</span> <span className="font-medium ml-1">{order.nonveg_count}</span></div>
            <div><span className="text-muted-foreground">Proforma Amount:</span> <span className="font-medium ml-1">₹{order.proforma_amount.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Modifications:</span> <span className="font-medium ml-1">₹{order.total_modification_amount.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Final Amount:</span> <span className="font-medium ml-1">₹{order.final_amount.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Payment Status:</span> <span className="font-medium ml-1">{order.payment_status.replace(/\b\w/g, (l) => l.toUpperCase())}</span></div>
          </div>
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Delivery Address:</span>{' '}
            <span className="font-medium ml-1">
              {order.delivery_address.address_line}, {order.delivery_address.area}, {order.delivery_address.city} - {order.delivery_address.pincode}
            </span>
          </div>
          <div className="mt-1 text-sm">
            <span className="text-muted-foreground">Meal Types:</span> <span className="font-medium ml-1">{order.meal_types.join(', ')}</span>
          </div>
          <div className="mt-1 text-sm">
            <span className="text-muted-foreground">Selected Days:</span> <span className="font-medium ml-1">{order.selected_days.join(', ')}</span>
          </div>
        </CardContent>
      </Card>

      <Can permission="corporate:modify">
        <div className="flex gap-3">
          {(order.status === 'active' || order.status === 'pending_payment' || order.status === 'draft') && (
            <Button variant="outline" onClick={() => setShowUpdateStatusDialog(true)}>
              <Edit3 className="mr-2 h-4 w-4" />Update Status
            </Button>
          )}
        </div>
      </Can>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="rounded-full bg-muted/60 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Info className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="modifications" className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ClipboardList className="h-4 w-4" />
            Modifications
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="daily-orders" className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CalendarDays className="h-4 w-4" />
            Daily Orders
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
          <DailyOrdersTab dailyOrders={dailyOrders} totalPages={dailyOrdersTotalPages} orderId={id} />
        </TabsContent>
      </Tabs>

      <UpdateStatusDialog
        orderId={id}
        currentStatus={order.status as CorporateOrderStatus}
        open={showUpdateStatusDialog}
        onOpenChange={setShowUpdateStatusDialog}
      />
    </div>
  );
}

function OverviewTab({ order }: { order: NonNullable<ReturnType<typeof useAdminCorporateOrderDetail>['data']>['order'] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Address:</span> <span className="font-medium">{order.delivery_address.address_line}</span></p>
          <p><span className="text-muted-foreground">Area:</span> <span className="font-medium">{order.delivery_address.area}</span></p>
          {order.delivery_address.landmark && <p><span className="text-muted-foreground">Landmark:</span> <span className="font-medium">{order.delivery_address.landmark}</span></p>}
          <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{order.delivery_address.city}</span></p>
          <p><span className="text-muted-foreground">State:</span> <span className="font-medium">{order.delivery_address.state}</span></p>
          <p><span className="text-muted-foreground">Pincode:</span> <span className="font-medium">{order.delivery_address.pincode}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Total Delivery Days:</span> <span className="font-medium">{order.total_delivery_days}</span></p>
          <p><span className="text-muted-foreground">Billing Cycle:</span> <span className="font-medium">{order.billing_cycle_days} days</span></p>
          <p><span className="text-muted-foreground">Meal Types:</span> <span className="font-medium">{order.meal_types.join(', ')}</span></p>
          <p><span className="text-muted-foreground">Selected Days:</span> <span className="font-medium">{order.selected_days.join(', ')}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Pricing Breakdown</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Veg Price/Meal:</span> <span className="font-medium">₹{order.veg_price_per_meal}</span></p>
          <p><span className="text-muted-foreground">Non-veg Price/Meal:</span> <span className="font-medium">₹{order.nonveg_price_per_meal}</span></p>
          <p><span className="text-muted-foreground">Delivery Charge/Day:</span> <span className="font-medium">₹{order.delivery_charge_per_day}</span></p>
          <p><span className="text-muted-foreground">Tax Rate:</span> <span className="font-medium">{(order.tax_rate * 100).toFixed(0)}%</span></p>
          <p><span className="text-muted-foreground">Proforma Amount:</span> <span className="font-medium">₹{order.proforma_amount.toLocaleString()}</span></p>
          <p><span className="text-muted-foreground">Modifications:</span> <span className="font-medium">₹{order.total_modification_amount.toLocaleString()}</span></p>
          <p><span className="text-muted-foreground">Final Amount:</span> <span className="font-medium">₹{order.final_amount.toLocaleString()}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}

function ModificationsTab({ modifications }: { modifications: { _id: string; modification_date: string; veg_change: number; nonveg_change: number; reason?: string; modification_amount: number; status: string }[] }) {
  if (!modifications.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No modifications found</div>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Veg Change</th>
            <th className="px-4 py-3 text-left font-medium">Non-veg Change</th>
            <th className="px-4 py-3 text-left font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium">Reason</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {modifications.map((m) => (
            <tr key={m._id} className="border-t">
              <td className="px-4 py-3">{new Date(m.modification_date).toLocaleDateString()}</td>
              <td className="px-4 py-3">{m.veg_change}</td>
              <td className="px-4 py-3">{m.nonveg_change}</td>
              <td className="px-4 py-3">₹{m.modification_amount.toLocaleString()}</td>
              <td className="px-4 py-3">{m.reason || '-'}</td>
              <td className="px-4 py-3">{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoicesTab({ invoices }: { invoices: { _id: string; invoice_number: string; type: string; billing_period_start?: string; billing_period_end?: string; grand_total: number; status: string; paid_at?: string; due_date?: string }[] }) {
  if (!invoices.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No invoices found</div>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Invoice #</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Period</th>
            <th className="px-4 py-3 text-left font-medium">Grand Total</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} className="border-t">
              <td className="px-4 py-3 font-medium">{inv.invoice_number}</td>
              <td className="px-4 py-3">{inv.type.replace(/\b\w/g, (l) => l.toUpperCase())}</td>
              <td className="px-4 py-3">
                {inv.billing_period_start && inv.billing_period_end
                  ? `${new Date(inv.billing_period_start).toLocaleDateString()} - ${new Date(inv.billing_period_end).toLocaleDateString()}`
                  : '-'}
              </td>
              <td className="px-4 py-3">₹{inv.grand_total.toLocaleString()}</td>
              <td className="px-4 py-3">{inv.status.replace(/\b\w/g, (l) => l.toUpperCase())}</td>
              <td className="px-4 py-3">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyOrdersTab({ dailyOrders, totalPages, orderId }: { dailyOrders: { _id: string; date: string; veg_count: number; nonveg_count: number; total_meals: number; status: string; notes?: string }[]; totalPages: number; orderId: string }) {
  const [page, setPage] = useState(1);
  const { data } = useAdminCorporateOrderDailyOrders(orderId, { page, limit: 20 });
  const orders = data?.data ?? dailyOrders;
  const pages = data?.totalPages ?? totalPages;

  if (!orders.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No daily orders found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Veg</th>
              <th className="px-4 py-3 text-left font-medium">Non-veg</th>
              <th className="px-4 py-3 text-left font-medium">Total Meals</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="px-4 py-3">{new Date(d.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{d.veg_count}</td>
                <td className="px-4 py-3">{d.nonveg_count}</td>
                <td className="px-4 py-3">{d.total_meals}</td>
                <td className="px-4 py-3">{d.status.replace(/\b\w/g, (l) => l.toUpperCase())}</td>
                <td className="px-4 py-3">{d.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
