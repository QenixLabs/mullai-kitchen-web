'use client';

import { Eye, Truck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { UnifiedOrder } from '@/api/types/admin-order.types';

interface OrderTableProps {
  data: UnifiedOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

function getAddress(order: UnifiedOrder): string {
  if (order.full_address) return order.full_address;
  if (order.delivery_address) {
    return `${order.delivery_address.address_line}, ${order.delivery_address.area}`;
  }
  return '-';
}

function getItemsDisplay(order: UnifiedOrder): string {
  if (order.recipe_name) return order.recipe_name;
  if (order.items && order.items.length > 0) {
    return order.items.map((item) => `${item.name} x${item.quantity}`).join(', ');
  }
  return '-';
}

export function OrderTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onViewDetail,
  onUpdateStatus,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">Loading orders...</div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">No orders found</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.customer_name}</TableCell>
                <TableCell>{order.meal_type}</TableCell>
                <TableCell className="max-w-[200px] truncate">{getItemsDisplay(order)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{getAddress(order)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetail(order._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Can permission="order:deliver">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateStatus(order._id, order.status)}
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    </Can>
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
