export type AddOnCategory = 'Beverage' | 'Dessert' | 'Side Dish' | 'Extra Main';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type AddOnOrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface AddOnItem {
  _id: string;
  name: string;
  name_tamil?: string;
  category: AddOnCategory;
  description?: string;
  price: number;
  quantity?: string;
  image?: string;
  is_veg?: boolean;
  is_available?: boolean;
  meal_type?: MealType[];
  max_quantity_per_order?: number;
  outlet_restriction?: string;
}

export interface CartItem {
  item_id: string;
  name: string;
  name_tamil?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  meal_type: MealType;
  max_quantity: number;
  image?: string;
}

export interface CartSummary {
  subscription_id: string;
  delivery_date: string;
  items: CartItem[];
  total_amount: number;
  subscription_meal_types: MealType[];
}

export interface CheckoutPrepareRequest {
  subscription_id: string;
  items: { item_id: string; quantity: number; meal_type: MealType }[];
  delivery_date: string;
  apply_wallet: boolean;
  coupon_id?: string;
}

export interface CheckoutPrepareResponse {
  subscription_id: string;
  items: {
    item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    meal_type: MealType;
  }[];
  delivery_date: string;
  total_amount: number;
  coupon_discount?: number;
  wallet_applied: number;
  amount_to_pay: number;
  payment_session_id?: string;
  razorpay_order_id?: string;
  full_wallet_payment: boolean;
}

export interface CreateAddOnOrderRequest {
  subscription_id: string;
  items: { item_id: string; quantity: number; meal_type: MealType }[];
  delivery_date: string;
}

export interface CreateAddOnOrderResponse {
  success: boolean;
  message: string;
  order_id?: string;
  total_amount?: number;
}

export interface ActiveAddOnOrder {
  _id: string;
  order_id: string;
  items: {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  delivery_date: string;
  total_amount: number;
  status: AddOnOrderStatus;
  created_at: string;
}
