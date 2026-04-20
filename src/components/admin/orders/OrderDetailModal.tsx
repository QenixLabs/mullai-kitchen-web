'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOrderDetail } from '@/api/hooks/useAdminOrders';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailModal({ orderId, open, onOpenChange }: OrderDetailModalProps) {
  const { data: order, isLoading } = useAdminOrderDetail(open ? orderId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription className="sr-only">View order details including customer info, items, and delivery information.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ) : order ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-[120px_1fr]">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customer_name}</span>

              <span className="text-muted-foreground">Source</span>
              <span className="capitalize">{order.source === 'addon' ? 'Add-on Order' : 'Daily Order'}</span>

              <span className="text-muted-foreground">Meal Type</span>
              <span>{order.meal_type}</span>

              <span className="text-muted-foreground">Status</span>
              <span>
                <OrderStatusBadge status={order.status} />
              </span>

              {order.recipe_name && (
                <>
                  <span className="text-muted-foreground">Recipe</span>
                  <span>{order.recipe_name}</span>
                </>
              )}

              {order.items && order.items.length > 0 && (
                <>
                  <span className="text-muted-foreground">Items</span>
                  <span>
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                  </span>
                </>
              )}

              {order.full_address && (
                <>
                  <span className="text-muted-foreground">Address</span>
                  <span>{order.full_address}</span>
                </>
              )}

              {!order.full_address && order.delivery_address && (
                <>
                  <span className="text-muted-foreground">Address</span>
                  <span>
                    {order.delivery_address.address_line}, {order.delivery_address.area},{' '}
                    {order.delivery_address.city} - {order.delivery_address.pincode}
                  </span>
                </>
              )}

              {order.delivery_time && (
                <>
                  <span className="text-muted-foreground">Delivery Time</span>
                  <span>{order.delivery_time}</span>
                </>
              )}

              {order.route_sequence != null && (
                <>
                  <span className="text-muted-foreground">Route Sequence</span>
                  <span>#{order.route_sequence}</span>
                </>
              )}

              <span className="text-muted-foreground">Created</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>

              <span className="text-muted-foreground">Updated</span>
              <span>{new Date(order.updated_at).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Order not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
