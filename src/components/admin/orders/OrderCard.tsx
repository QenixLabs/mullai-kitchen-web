'use client';

import { Utensils, Eye, Truck, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { UnifiedOrder } from '@/api/types/admin-order.types';

interface OrderCardProps {
  order: UnifiedOrder & { outlet_name?: string };
  onViewDetail: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

function getItemsDisplay(order: UnifiedOrder): string {
  if (order.recipe_name) return order.recipe_name;
  if (order.items && order.items.length > 0) {
    return order.items.map((item) => `${item.name} x${item.quantity}`).join(', ');
  }
  return '-';
}

function getActionButtonProps(status: string) {
  switch (status) {
    case 'delivered':
    case 'Delivered':
      return { label: 'Track Courier', icon: MapPin };
    case 'missed':
    case 'Delayed':
      return { label: 'Manual Assign', icon: AlertTriangle };
    case 'out_for_delivery':
      return { label: 'Track Courier', icon: MapPin };
    default:
      return { label: 'Assign Partner', icon: Truck };
  }
}

export function OrderCard({ order, onViewDetail, onUpdateStatus }: OrderCardProps) {
  const action = getActionButtonProps(order.status);
  const ActionIcon = action.icon;

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl bg-white p-5"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      {/* Top Row: Order ID + Badge + Outlet */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold truncate" style={{ color: '#3d000c' }}>
            #{order._id.toUpperCase().replace('ORD-', 'ORD-')}
          </span>
          <span
            className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: 'rgba(68,21,28,0.08)',
              color: '#44151c',
            }}
          >
            {order.meal_type}
          </span>
        </div>
        <div className="text-left sm:text-right">
          <span className="block text-[10px] font-medium uppercase tracking-wide" style={{ color: '#554243' }}>
            Outlet
          </span>
          <span className="text-xs font-semibold" style={{ color: '#44151c' }}>
            {order.outlet_name || 'Central Kitchen'}
          </span>
        </div>
      </div>

      {/* Customer Name */}
      <h3 className="text-lg font-bold" style={{ color: '#3d000c', lineHeight: '24px' }}>
        {order.customer_name}
      </h3>

      {/* Item + Status Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}
          >
            <Utensils className="h-4 w-4" style={{ color: '#44151c' }} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: '#3d000c' }}>
              {getItemsDisplay(order)}
            </p>
            <p className="text-xs" style={{ color: '#554243' }}>
              {order.source === 'addon' ? 'Instant Order' : 'Scheduled'}
              {order.delivery_time ? `: ${order.delivery_time}` : ''}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-full border-[rgba(219,192,193,0.3)] bg-[#f8f5f5] text-sm font-semibold hover:bg-[#f0eaea]"
          style={{ color: '#554243' }}
          onClick={() => onViewDetail(order._id)}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View Details
        </Button>
        <Can permission="order:deliver">
          <Button
            className="flex-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: '#44151c',
              color: '#fff',
            }}
            onClick={() => onUpdateStatus(order._id, order.status)}
          >
            <ActionIcon className="mr-1.5 h-4 w-4" />
            {action.label}
          </Button>
        </Can>
      </div>
    </div>
  );
}
