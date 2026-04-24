'use client';

import { useCallback, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { BatchUpdateBar } from './BatchUpdateBar';
import { Badge } from '@/components/ui/badge';
import { useAdminOrders, useUpdateOrderStatus } from '@/api/hooks/useAdminOrders';
import type { DeliveryRoute } from '@/api/admin-route.api';

interface RouteDetailPanelProps {
  route: DeliveryRoute;
  outletId: string;
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

  const toggleSelect = useCallback((orderId: string, source: 'daily' | 'addon' | 'corporate') => {
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
    const totalSelected = selectedDaily.length + selectedAddon.length + selectedCorporate.length;
    if (totalSelected === orders.length) {
      setSelectedDaily([]);
      setSelectedAddon([]);
      setSelectedCorporate([]);
    } else {
      setSelectedDaily(orders.filter((o) => o.source === 'daily').map((o) => o._id));
      setSelectedAddon(orders.filter((o) => o.source === 'addon').map((o) => o._id));
      setSelectedCorporate(orders.filter((o) => o.source === 'corporate').map((o) => o._id));
    }
  }, [orders, selectedDaily, selectedAddon, selectedCorporate]);

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
    return '-';
  };

  return (
    <div className="space-y-3">
      {/* Route info header */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>
          Route: <span className="font-medium text-foreground">{route.name}</span>
        </span>
        <span>
          Orders: <span className="font-medium text-foreground">{route.order_count}</span>
        </span>
        {route.assigned_partner && (
          <span>
            Partner: <span className="font-medium text-foreground">{route.assigned_partner.name}</span>
            {route.assigned_partner.vehicle_number ? ` (${route.assigned_partner.vehicle_number})` : ''}
          </span>
        )}
        <span>
          Progress: <span className="font-medium text-foreground">{route.completed_stops}/{route.order_count}</span>
        </span>
      </div>

      {/* Batch update bar */}
      <BatchUpdateBar
        routeId={route._id}
        outletId={outletId}
        selectedDailyOrderIds={selectedDaily}
        selectedAddonOrderIds={selectedAddon}
        selectedCorporateOrderIds={selectedCorporate}
        onClearSelection={clearSelection}
      />

      {/* Orders table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No orders in this route</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      orders.length > 0 &&
                      selectedDaily.length + selectedAddon.length + selectedCorporate.length === orders.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16">Seq</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Checkbox
                      checked={
                        order.source === 'daily'
                          ? selectedDaily.includes(order._id)
                          : order.source === 'addon'
                            ? selectedAddon.includes(order._id)
                            : selectedCorporate.includes(order._id)
                      }
                      onCheckedChange={() => toggleSelect(order._id, order.source)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.route_sequence ?? index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant={order.source === 'corporate' ? 'secondary' : 'outline'}>
                      {order.source === 'daily' ? 'Daily' : order.source === 'addon' ? 'Add-on' : 'Corporate'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{getAddress(order)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {order.status !== 'delivered' && order.status !== 'Delivered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkDelivered(order._id)}
                        disabled={updateStatus.isPending}
                      >
                        Delivered
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
