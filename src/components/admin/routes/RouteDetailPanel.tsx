'use client';

import { useCallback, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  User,
  PackageOpen,
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
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { BatchUpdateBar } from './BatchUpdateBar';
import { useAdminOrders, useUpdateOrderStatus } from '@/api/hooks/useAdminOrders';
import type { DeliveryRoute } from '@/api/admin-route.api';
import { cn } from '@/lib/utils';

interface RouteDetailPanelProps {
  route: DeliveryRoute;
  outletId: string;
}

type OrderSource = 'daily' | 'addon' | 'corporate';

function sourceMeta(source: OrderSource) {
  switch (source) {
    case 'corporate':
      return {
        label: 'Corporate',
        className: 'border-primary/20 bg-primary/10 text-primary',
      };
    case 'addon':
      return {
        label: 'Add-on',
        className: 'border-info/20 bg-info/10 text-info',
      };
    case 'daily':
    default:
      return {
        label: 'Daily',
        className: 'border-border/60 bg-muted text-muted-foreground',
      };
  }
}

function MetaChip({
  icon,
  label,
  value,
  tone = 'muted',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: 'muted' | 'primary' | 'success';
}) {
  const tones = {
    muted: 'bg-muted text-muted-foreground ring-border',
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/10 text-success ring-success/20',
  } as const;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-xs">
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded ring-1',
          tones[tone],
        )}
      >
        {icon}
      </span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

export function RouteDetailPanel({ route, outletId }: RouteDetailPanelProps) {
  const [selectedDaily, setSelectedDaily] = useState<string[]>([]);
  const [selectedAddon, setSelectedAddon] = useState<string[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<string[]>([]);

  const { data: ordersData, isLoading } = useAdminOrders({
    outlet_id: outletId,
    delivery_route_id: route._id,
    limit: 200,
  });

  const updateStatus = useUpdateOrderStatus();

  const orders = ordersData?.data || [];
  const totalSelected = selectedDaily.length + selectedAddon.length + selectedCorporate.length;
  const allSelected = orders.length > 0 && totalSelected === orders.length;
  const someSelected = totalSelected > 0 && !allSelected;

  const toggleSelect = useCallback((orderId: string, source: OrderSource) => {
    if (source === 'daily') {
      setSelectedDaily((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
      );
    } else if (source === 'addon') {
      setSelectedAddon((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
      );
    } else {
      setSelectedCorporate((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
      );
    }
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedDaily([]);
      setSelectedAddon([]);
      setSelectedCorporate([]);
    } else {
      setSelectedDaily(orders.filter((o) => o.source === 'daily').map((o) => o._id));
      setSelectedAddon(orders.filter((o) => o.source === 'addon').map((o) => o._id));
      setSelectedCorporate(orders.filter((o) => o.source === 'corporate').map((o) => o._id));
    }
  }, [orders, allSelected]);

  const clearSelection = useCallback(() => {
    setSelectedDaily([]);
    setSelectedAddon([]);
    setSelectedCorporate([]);
  }, []);

  const handleMarkDelivered = (orderId: string) => {
    updateStatus.mutate({ id: orderId, data: { status: 'delivered' } });
  };

  const getAddress = (order: (typeof orders)[0]): string => {
    if (order.full_address) return order.full_address;
    if (order.delivery_address) {
      return `${order.delivery_address.address_line}, ${order.delivery_address.area}`;
    }
    return '—';
  };

  const partner = route.assigned_partner;
  const partnerLabel = partner
    ? partner.vehicle_number
      ? `${partner.name} · ${partner.vehicle_number}`
      : partner.name
    : 'Unassigned';

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <MetaChip
            icon={<Truck className="h-3 w-3" />}
            label="Partner"
            value={partnerLabel}
            tone={partner ? 'primary' : 'muted'}
          />
          <MetaChip
            icon={<Package className="h-3 w-3" />}
            label="Orders"
            value={route.order_count}
            tone="muted"
          />
          <MetaChip
            icon={<CheckCircle2 className="h-3 w-3" />}
            label="Progress"
            value={`${route.completed_stops}/${route.order_count}`}
            tone={route.completed_stops === route.order_count && route.order_count > 0 ? 'success' : 'muted'}
          />
        </div>

        <BatchUpdateBar
          routeId={route._id}
          outletId={outletId}
          selectedDailyOrderIds={selectedDaily}
          selectedAddonOrderIds={selectedAddon}
          selectedCorporateOrderIds={selectedCorporate}
          onClearSelection={clearSelection}
        />

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Package className="h-3.5 w-3.5" />
                </span>
                <h4 className="text-sm font-semibold tracking-tight text-foreground">
                  Orders on this route
                </h4>
                {orders.length > 0 && (
                  <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {orders.length} {orders.length === 1 ? 'stop' : 'stops'}
                  </span>
                )}
              </div>
              {totalSelected > 0 && (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {totalSelected} selected
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <span className="rounded-full bg-muted p-3 text-muted-foreground">
                  <PackageOpen className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">No orders in this route</p>
                <p className="text-xs text-muted-foreground">
                  Orders will appear here once they are added to the route.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 w-10 px-4">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="h-10 w-14 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Seq
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Type
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-32 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => {
                    const source = order.source as OrderSource;
                    const meta = sourceMeta(source);
                    const checked =
                      source === 'daily'
                        ? selectedDaily.includes(order._id)
                        : source === 'addon'
                          ? selectedAddon.includes(order._id)
                          : selectedCorporate.includes(order._id);
                    const isLast = index === orders.length - 1;
                    const isDelivered =
                      order.status === 'delivered' || order.status === 'Delivered';
                    return (
                      <TableRow
                        key={order._id}
                        className={cn(
                          'group transition-colors hover:bg-accent/20',
                          !isLast && 'border-b border-border/50',
                          checked && 'bg-primary/5',
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelect(order._id, source)}
                            aria-label={`Select ${order.customer_name}`}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[11px] font-bold tabular-nums text-foreground">
                            {order.route_sequence ?? index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm font-semibold text-foreground">
                              {order.customer_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 md:table-cell">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                              meta.className,
                            )}
                          >
                            {meta.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden max-w-[260px] px-4 py-3 lg:table-cell">
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                            <span className="truncate" title={getAddress(order)}>
                              {getAddress(order)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          {!isDelivered ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1.5"
                                  onClick={() => handleMarkDelivered(order._id)}
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Delivered
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Mark this order as delivered</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
