import { apiClient } from '@/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ingredient {
  _id: string;
  name: string;
  category: string;
  default_unit: string;
  current_cost?: number;
  supplier?: string;
  supplier_contact?: string;
  supplier_email?: string;
  minimum_stock_level?: number;
  reorder_quantity?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  bank_details?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockLevel {
  _id: string;
  outlet_id: string | { _id: string; name: string };
  ingredient_id: string | { _id: string; name: string };
  current_quantity: number;
  unit: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  last_movement_at?: string;
  last_movement_id?: string;
}

export interface StockMovement {
  _id: string;
  outlet_id: string;
  ingredient_id: string | { _id: string; name: string };
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  quantity: number;
  unit: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface PurchaseOrderItem {
  _id: string;
  purchase_order_id: string;
  ingredient_id: { _id: string; name: string } | string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface PurchaseOrder {
  _id: string;
  outlet_id: string;
  supplier_id: string;
  status: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount?: number;
  tax_amount?: number;
  notes?: string;
  created_by?: string;
  items?: PurchaseOrderItem[];
  created_at: string;
}

export interface GoodsReceiptItem {
  ingredient_id: string;
  quantity_received: number;
  unit: string;
  unit_price: number;
  notes?: string;
}

export interface GoodsReceipt {
  _id: string;
  purchase_order_id: string;
  received_at: string;
  received_by?: string;
  notes?: string;
  total_amount?: number;
  items: GoodsReceiptItem[];
  created_at: string;
}

// ─── Query / Payload Types ───────────────────────────────────────────────────

export interface ListIngredientsQuery {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateIngredientPayload {
  name: string;
  category: string;
  default_unit: string;
  current_cost?: number;
  supplier?: string;
  supplier_contact?: string;
  supplier_email?: string;
  minimum_stock_level?: number;
  reorder_quantity?: number;
  status?: string;
}

export interface UpdateIngredientPayload {
  name?: string;
  category?: string;
  default_unit?: string;
  current_cost?: number;
  supplier?: string;
  supplier_contact?: string;
  supplier_email?: string;
  minimum_stock_level?: number;
  reorder_quantity?: number;
  status?: string;
}

export interface ListSuppliersQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupplierPayload {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  bank_details?: string;
  notes?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  bank_details?: string;
  notes?: string;
}

export interface ListStockMovementsQuery {
  outlet_id?: string;
  ingredient_id?: string;
  type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface AdjustStockPayload {
  outlet_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface CreateStockMovementPayload {
  outlet_id: string;
  ingredient_id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  quantity: number;
  unit: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
}

export interface ListPurchaseOrdersQuery {
  outlet_id?: string;
  supplier_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchaseOrderItemPayload {
  ingredient_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  notes?: string;
}

export interface CreatePurchaseOrderPayload {
  outlet_id: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  tax_amount?: number;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export interface UpdatePOStatusPayload {
  status: string;
}

export interface ReceiveGoodsPayload {
  purchase_order_id: string;
  received_at: string;
  notes?: string;
  items: GoodsReceiptItem[];
}

// ─── Recipe Ingredients (BOM) ────────────────────────────────────────────────

export interface RecipeIngredient {
  _id: string;
  recipe_id: string;
  ingredient_id: string | { _id: string; name: string; default_unit?: string };
  quantity: number;
  unit: string;
  wastage_factor: number;
}

export interface RecipeIngredientPayload {
  ingredient_id: string;
  quantity: number;
  unit: string;
  wastage_factor?: number;
}

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────

const BASE = '/admin/inventory';

export const adminInventoryApi = {
  // === Ingredients ===
  listIngredients: async (query?: ListIngredientsQuery): Promise<PaginatedResponse<Ingredient>> => {
    const response = await apiClient.get<PaginatedResponse<Ingredient>>(`${BASE}/ingredients`, { params: query });
    return response.data;
  },

  getIngredient: async (id: string): Promise<Ingredient> => {
    const response = await apiClient.get<Ingredient>(`${BASE}/ingredients/${id}`);
    return response.data;
  },

  createIngredient: async (data: CreateIngredientPayload): Promise<Ingredient> => {
    const response = await apiClient.post<Ingredient>(`${BASE}/ingredients`, data);
    return response.data;
  },

  updateIngredient: async (id: string, data: UpdateIngredientPayload): Promise<Ingredient> => {
    const response = await apiClient.put<Ingredient>(`${BASE}/ingredients/${id}`, data);
    return response.data;
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/ingredients/${id}`);
  },

  // === Suppliers ===
  listSuppliers: async (query?: ListSuppliersQuery): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<PaginatedResponse<Supplier>>(`${BASE}/suppliers`, { params: query });
    return response.data;
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`${BASE}/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: CreateSupplierPayload): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>(`${BASE}/suppliers`, data);
    return response.data;
  },

  updateSupplier: async (id: string, data: UpdateSupplierPayload): Promise<Supplier> => {
    const response = await apiClient.put<Supplier>(`${BASE}/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/suppliers/${id}`);
  },

  // === Stock ===
  listStockLevels: async (outletId?: string): Promise<StockLevel[]> => {
    const response = await apiClient.get<StockLevel[]>(`${BASE}/stock`, { params: { outlet_id: outletId } });
    return response.data;
  },

  getLowStockLevels: async (outletId?: string): Promise<StockLevel[]> => {
    const response = await apiClient.get<StockLevel[]>(`${BASE}/stock/low`, { params: { outlet_id: outletId } });
    return response.data;
  },

  adjustStock: async (data: AdjustStockPayload): Promise<StockLevel> => {
    const response = await apiClient.post<StockLevel>(`${BASE}/stock/adjust`, data);
    return response.data;
  },

  // === Movements ===
  listMovements: async (query?: ListStockMovementsQuery): Promise<PaginatedResponse<StockMovement>> => {
    const response = await apiClient.get<PaginatedResponse<StockMovement>>(`${BASE}/movements`, { params: query });
    return response.data;
  },

  createMovement: async (data: CreateStockMovementPayload): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>(`${BASE}/movements`, data);
    return response.data;
  },

  // === Procurement ===
  listPurchaseOrders: async (query?: ListPurchaseOrdersQuery): Promise<PaginatedResponse<PurchaseOrder>> => {
    const response = await apiClient.get<PaginatedResponse<PurchaseOrder>>(`${BASE}/procurement`, { params: query });
    return response.data;
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await apiClient.get<PurchaseOrder>(`${BASE}/procurement/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data: CreatePurchaseOrderPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>(`${BASE}/procurement`, data);
    return response.data;
  },

  updatePOStatus: async (id: string, data: UpdatePOStatusPayload): Promise<PurchaseOrder> => {
    const response = await apiClient.patch<PurchaseOrder>(`${BASE}/procurement/${id}/status`, data);
    return response.data;
  },

  receiveGoods: async (id: string, data: ReceiveGoodsPayload): Promise<GoodsReceipt> => {
    const response = await apiClient.post<GoodsReceipt>(`${BASE}/procurement/${id}/receive`, data);
    return response.data;
  },

  // === Recipe Ingredients (BOM) ===
  getRecipeIngredients: async (recipeId: string): Promise<RecipeIngredient[]> => {
    const response = await apiClient.get<RecipeIngredient[]>(`${BASE}/recipes/${recipeId}/ingredients`);
    return response.data;
  },

  updateRecipeIngredients: async (recipeId: string, data: RecipeIngredientPayload[]): Promise<void> => {
    await apiClient.put(`${BASE}/recipes/${recipeId}/ingredients`, { recipe_id: recipeId, ingredients: data });
  },
};
