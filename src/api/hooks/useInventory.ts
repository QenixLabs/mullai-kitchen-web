"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminInventoryApi } from "@/api/admin-inventory.api";
import { inventoryKeys } from "@/api/query-keys";
import type {
  CreateIngredientPayload,
  UpdateIngredientPayload,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  AdjustStockPayload,
  CreateStockMovementPayload,
  CreatePurchaseOrderPayload,
  UpdatePOStatusPayload,
  ReceiveGoodsPayload,
  ListIngredientsQuery,
  ListSuppliersQuery,
  ListStockMovementsQuery,
  ListPurchaseOrdersQuery,
  RecipeIngredientPayload,
} from "@/api/admin-inventory.api";

// ─── Ingredients ─────────────────────────────────────────────────────────────

export function useIngredients(params?: ListIngredientsQuery) {
  return useQuery({
    queryKey: inventoryKeys.ingredientList(params),
    queryFn: () => adminInventoryApi.listIngredients(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useIngredient(id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.ingredientDetail(id!),
    queryFn: () => adminInventoryApi.getIngredient(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientPayload) => adminInventoryApi.createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.ingredientLists() });
      toast.success("Ingredient created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create ingredient");
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIngredientPayload }) =>
      adminInventoryApi.updateIngredient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.ingredientLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.ingredientDetail(variables.id) });
      toast.success("Ingredient updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update ingredient");
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminInventoryApi.deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.ingredientLists() });
      toast.success("Ingredient deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete ingredient");
    },
  });
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export function useSuppliers(params?: ListSuppliersQuery) {
  return useQuery({
    queryKey: inventoryKeys.supplierList(params),
    queryFn: () => adminInventoryApi.listSuppliers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.supplierDetail(id!),
    queryFn: () => adminInventoryApi.getSupplier(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierPayload) => adminInventoryApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplierLists() });
      toast.success("Supplier created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create supplier");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierPayload }) =>
      adminInventoryApi.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplierLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplierDetail(variables.id) });
      toast.success("Supplier updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update supplier");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminInventoryApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.supplierLists() });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete supplier");
    },
  });
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export function useStockLevels(outletId?: string) {
  return useQuery({
    queryKey: inventoryKeys.stockLevels(outletId),
    queryFn: () => adminInventoryApi.listStockLevels(outletId),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useLowStockLevels(outletId?: string) {
  return useQuery({
    queryKey: inventoryKeys.lowStock(outletId),
    queryFn: () => adminInventoryApi.getLowStockLevels(outletId),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustStockPayload) => adminInventoryApi.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movementLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      toast.success("Stock adjusted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to adjust stock");
    },
  });
}

// ─── Movements ───────────────────────────────────────────────────────────────

export function useStockMovements(params?: ListStockMovementsQuery) {
  return useQuery({
    queryKey: inventoryKeys.movementList(params),
    queryFn: () => adminInventoryApi.listMovements(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementPayload) => adminInventoryApi.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movementLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      toast.success("Stock movement recorded successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to record stock movement");
    },
  });
}

// ─── Procurement ─────────────────────────────────────────────────────────────

export function usePurchaseOrders(params?: ListPurchaseOrdersQuery) {
  return useQuery({
    queryKey: inventoryKeys.purchaseOrderList(params),
    queryFn: () => adminInventoryApi.listPurchaseOrders(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.purchaseOrderDetail(id!),
    queryFn: () => adminInventoryApi.getPurchaseOrder(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderPayload) => adminInventoryApi.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrderLists() });
      toast.success("Purchase order created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create purchase order");
    },
  });
}

export function useUpdatePOStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePOStatusPayload }) =>
      adminInventoryApi.updatePOStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrderLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrderDetail(variables.id) });
      toast.success("Purchase order status updated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update purchase order status");
    },
  });
}

export function useReceiveGoods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceiveGoodsPayload }) =>
      adminInventoryApi.receiveGoods(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrderLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.purchaseOrderDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movementLists() });
      toast.success("Goods received successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to receive goods");
    },
  });
}

// ─── Recipe Ingredients (BOM) ────────────────────────────────────────────────

export function useRecipeIngredients(recipeId: string) {
  return useQuery({
    queryKey: inventoryKeys.recipeIngredients(recipeId),
    queryFn: () => adminInventoryApi.getRecipeIngredients(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateRecipeIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, data }: { recipeId: string; data: RecipeIngredientPayload[] }) =>
      adminInventoryApi.updateRecipeIngredients(recipeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.recipeIngredients(variables.recipeId) });
      toast.success("Recipe ingredients updated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update recipe ingredients");
    },
  });
}
