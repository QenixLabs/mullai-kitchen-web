"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recipeApi } from "@/api/recipe.api";
import { recipeKeys } from "@/api/query-keys";
import type { RecipeListParams, CreateRecipePayload, RecipeStatus } from "@/api/types/menu.types";

export function useRecipes(params?: RecipeListParams) {
  return useQuery({
    queryKey: recipeKeys.list(params),
    queryFn: () => recipeApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: recipeKeys.detail(id!),
    queryFn: () => recipeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipePayload) => recipeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.select() });
      toast.success("Recipe created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create recipe");
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecipePayload> }) =>
      recipeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.select() });
      toast.success("Recipe updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update recipe");
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recipeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.select() });
      toast.success("Recipe deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete recipe");
    },
  });
}

export function useUpdateRecipeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecipeStatus }) =>
      recipeApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.select() });
      toast.success("Recipe status updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update recipe status");
    },
  });
}

export function useRecipeSelect(outletId?: string) {
  return useQuery({
    queryKey: recipeKeys.select(outletId),
    queryFn: () => recipeApi.getForSelect(outletId),
    staleTime: 1000 * 60 * 5,
  });
}
