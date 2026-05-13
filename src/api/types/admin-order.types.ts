// Enums mirroring backend
export enum DailyOrderStatus {
  PLANNED = 'planned',
  LOCKED = 'locked',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  MISSED = 'missed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  OPTED_OUT = 'opted_out',
}

export enum AddOnOrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PREPARING = 'Preparing',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}

export interface UnifiedOrder {
  _id: string;
  source: 'daily' | 'addon' | 'corporate';
  customer_name: string;
  meal_type: MealType | string;
  recipe_name?: string;
  items?: { name: string; quantity: number }[];
  status: string;
  full_address?: string;
  delivery_address?: {
    address_line: string;
    area: string;
    pincode: string;
    city: string;
  };
  delivery_route_id?: string;
  route_sequence?: number;
  delivery_time?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderListParams {
  date?: string;
  outlet_id?: string;
  meal_type?: MealType;
  status?: string;
  search?: string;
  delivery_route_id?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderListResponse {
  data: UnifiedOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusPayload {
  status: string;
  notes?: string;
}

export interface BatchUpdateStatusPayload {
  status: string;
  daily_order_ids?: string[];
  addon_order_ids?: string[];
  corporate_order_ids?: string[];
}
