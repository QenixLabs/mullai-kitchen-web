'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  PackageCheck,
  Building2,
  Truck,
  Calendar,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  usePurchaseOrder,
  useUpdatePOStatus,
  useReceiveGoods,
} from '@/api/hooks/useInventory';
import type { GoodsReceiptItem } from '@/api/admin-inventory.api';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: po, isLoading, error } = usePurchaseOrder(id);
  const updateStatus = useUpdatePOStatus();
  const receiveGoods = useReceiveGoods();

  const [statusValue, setStatusValue] = useState('');
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiveItems, setReceiveItems] = useState<Record<string, { quantity_received: string; notes: string }>>({});

  const handleStatusChange = () => {
    if (!statusValue) return;
    updateStatus.mutate(
      { id, data: { status: statusValue } },
      { onSuccess: () => setStatusValue('') },
    );
  };

  const handleReceive = () => {
    if (!po?.items) return;
    const items: GoodsReceiptItem[] = po.items.map((item) => {
      const ingId = typeof item.ingredient_id === 'object' ? item.ingredient_id._id : item.ingredient_id;
      const received = receiveItems[ingId];
      return {
        ingredient_id: ingId,
        quantity_received: received ? Number(received.quantity_received) : item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        notes: received?.notes || undefined,
      };
    });
    receiveGoods.mutate(
      {
        id,
        data: {
          purchase_order_id: id,
          received_at: receiveDate,
          notes: receiveNotes || undefined,
          items,
        },
      },
      {
        onSuccess: () => {
          setReceiveOpen(false);
          setReceiveNotes('');
          setReceiveItems({});
        },
      },
    );
  };

  return (
    <Can
      permission="inventory:view"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <ClipboardList className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view purchase orders.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              PO Details
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              View purchase order, line items, and receive goods.
            </p>
          </div>

          <Link
            href="/admin/inventory/procurement"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Procurement
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : error || !po ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <ClipboardList className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">PO Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested purchase order could not be loaded.'}
            </p>
            <Link
              href="/admin/inventory/procurement"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Procurement
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                      {po._id.slice(-6).toUpperCase()}
                    </code>
                    <POStatusPill status={po.status} />
                  </div>
                  <h2 className="text-xl font-bold text-primary">
                    Purchase Order
                  </h2>
                </div>
                <Can permission="inventory:procurement">
                  <div className="flex items-center gap-2">
                    <Select value={statusValue} onValueChange={setStatusValue}>
                      <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-9"
                      disabled={!statusValue || updateStatus.isPending}
                      onClick={handleStatusChange}
                    >
                      {updateStatus.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                      Update
                    </Button>
                  </div>
                </Can>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <InfoItem icon={<Building2 className="h-4 w-4" />} label="Outlet" value={po.outlet_id && typeof po.outlet_id === 'object' ? (po.outlet_id as { name: string }).name : '—'} />
                <InfoItem icon={<Truck className="h-4 w-4" />} label="Supplier" value={po.supplier_id && typeof po.supplier_id === 'object' ? (po.supplier_id as { name: string }).name : '—'} />
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Order Date" value={po.order_date ? format(new Date(po.order_date), 'dd MMM yyyy') : '—'} />
                <InfoItem icon={<Calendar className="h-4 w-4" />} label="Expected Delivery" value={po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'dd MMM yyyy') : '—'} />
                <InfoItem icon={<Wallet className="h-4 w-4" />} label="Total Amount" value={formatCurrency(po.total_amount ?? 0)} />
                <InfoItem icon={<Wallet className="h-4 w-4" />} label="Tax" value={formatCurrency(po.tax_amount ?? 0)} />
              </div>

              {po.notes && (
                <div className="mt-4 rounded-xl bg-muted/30 border border-border/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm text-foreground">{po.notes}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-primary">Line Items</h3>
                </div>
                <Can permission="inventory:procurement">
                  {po.status !== 'COMPLETED' && po.status !== 'CANCELLED' && (
                    <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                      <DialogTrigger asChild>
                        <Button className="h-9 gap-1.5 rounded-full">
                          <PackageCheck className="h-4 w-4" />
                          Receive Goods
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <PackageCheck className="h-5 w-5 text-primary" />
                            Receive Goods
                          </DialogTitle>
                          <DialogDescription>
                            Record goods received for this purchase order. Adjust quantities if partial.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Received Date *</label>
                              <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} className="h-11" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</label>
                            <Textarea value={receiveNotes} onChange={(e) => setReceiveNotes(e.target.value)} placeholder="Optional receipt notes..." rows={2} />
                          </div>
                          <div className="space-y-3">
                            {po.items?.map((item) => {
                              const ingId = typeof item.ingredient_id === 'object' ? item.ingredient_id._id : item.ingredient_id;
                              const ingName = typeof item.ingredient_id === 'object' ? item.ingredient_id.name : '—';
                              const received = receiveItems[ingId];
                              return (
                                <div key={ingId} className="rounded-xl border border-border/40 p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">{ingName}</span>
                                    <span className="text-xs text-muted-foreground">Ordered: {item.quantity} {item.unit}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qty Received</label>
                                      <Input
                                        type="number"
                                        className="h-9 mt-1"
                                        value={received?.quantity_received ?? item.quantity}
                                        onChange={(e) => setReceiveItems((prev) => ({ ...prev, [ingId]: { ...prev[ingId], quantity_received: e.target.value } }))}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</label>
                                      <Input
                                        className="h-9 mt-1"
                                        value={received?.notes ?? ''}
                                        onChange={(e) => setReceiveItems((prev) => ({ ...prev, [ingId]: { ...prev[ingId], notes: e.target.value } }))}
                                        placeholder="Optional"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancel</Button>
                            <Button
                              onClick={handleReceive}
                              disabled={receiveGoods.isPending}
                            >
                              {receiveGoods.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Confirm Receipt
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </Can>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ingredient</TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quantity</TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unit</TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unit Price</TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items?.map((item, idx) => {
                    const isLast = idx === (po.items?.length ?? 0) - 1;
                    const ingName = typeof item.ingredient_id === 'object' ? item.ingredient_id.name : '—';
                    return (
                      <TableRow key={item._id} className={`group transition-colors hover:bg-accent/20 ${!isLast ? 'border-b border-border/50' : ''}`}>
                        <TableCell className="px-4 py-3 text-sm font-medium text-foreground">{ingName}</TableCell>
                        <TableCell className="px-4 py-3 text-sm tabular-nums text-foreground">{item.quantity}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">{item.unit}</TableCell>
                        <TableCell className="px-4 py-3 text-sm tabular-nums text-foreground">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(item.total_price)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">{item.notes || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </div>
    </Can>
  );
}

function POStatusPill({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'DRAFT') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />Draft</span>;
  }
  if (normalized === 'PUBLISHED') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info"><span className="h-1.5 w-1.5 rounded-full bg-info" />Published</span>;
  }
  if (normalized === 'IN_PROGRESS') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"><span className="h-1.5 w-1.5 rounded-full bg-warning" />In Progress</span>;
  }
  if (normalized === 'COMPLETED') {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Completed</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600"><span className="h-1.5 w-1.5 rounded-full bg-rose-600" />Cancelled</span>;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground flex items-center gap-2">{icon}{value}</p>
    </div>
  );
}
