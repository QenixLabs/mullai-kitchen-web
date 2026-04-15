export type AddOnCategory = 'Beverage' | 'Dessert' | 'Side Dish' | 'Extra Main';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

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

// Response for independent add-on fetching (no subscription context)
export interface AvailableAddOnsIndependentData {
  items: AddOnItem[];
  delivery_date?: string;
  grouped_by_category?: Record<AddOnCategory, AddOnItem[]>;
}

// Response for meal types endpoint
export interface MealTypesResponse {
  mealTypes: MealType[];
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
  meal_type?: MealType;             // Required for independent flow; legacy flow derives from subscription
  subscription_id?: string;         // Required for legacy flow; independent flow resolves server-side
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
  currency?: string;                    // Currency code (e.g., "INR")
  payment_session_id?: string;       // Zoho / Razorpay payment session ID
  razorpay_order_id?: string;
  provider_account_id?: string;      // Zoho account ID for payment widget
  provider?: 'zoho' | 'razorpay';   // Payment provider used
  full_wallet_payment: boolean;
}

export interface CreateAddOnOrderRequest {
  meal_type?: MealType;              // Required for independent flow; legacy flow derives from subscription
  subscription_id?: string;          // Required for legacy flow; independent flow resolves server-side
  items: { item_id: string; quantity: number; meal_type: MealType }[];
  delivery_date: string;
  payment_id?: string;               // Zoho payment ID
  payments_session_id?: string;      // Zoho payments session ID (note 's' in 'payments')
  razorpay_order_id?: string;        // Razorpay order ID
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

export interface AddOnOrderHistoryOrder extends Omit<ActiveAddOnOrder, 'items'> {
  meal_type: MealType;
  items: {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    image?: string | null;
  }[];
}

export interface AddOnOrderHistoryResponse {
  orders: AddOnOrderHistoryOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface AddOnOrderHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
}
