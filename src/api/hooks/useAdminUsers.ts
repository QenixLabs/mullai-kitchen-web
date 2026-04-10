"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminUserApi,
  type AdminUserListParams,
  type CreateAdminUserPayload,
  type CreateHubOwnerPayload,
  type CreateDeliveryPartnerPayload,
  type UpdateUserStatusPayload,
} from "@/api/admin-user.api";
import { adminUserKeys } from "@/api/query-keys";

export function useAdminUsers(params?: AdminUserListParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => adminUserApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: adminUserKeys.detail(id!),
    queryFn: () => adminUserApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserPayload) => adminUserApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success("Admin user created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create admin user");
    },
  });
}

export function useCreateHubOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHubOwnerPayload) => adminUserApi.createHubOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success("Hub owner created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create hub owner");
    },
  });
}

export function useCreateDeliveryPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryPartnerPayload) => adminUserApi.createDeliveryPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      toast.success("Delivery partner created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create delivery partner");
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserStatusPayload }) =>
      adminUserApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.id) });
      toast.success("User status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update user status");
    },
  });
}

export function useUserStats() {
  const queries = useQueries({
    queries: [
      {
        queryKey: adminUserKeys.list({ limit: 1 }),
        queryFn: () => adminUserApi.list({ limit: 1 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: adminUserKeys.list({ role: 'superAdmin', limit: 1 }),
        queryFn: () => adminUserApi.list({ role: 'superAdmin' as any, limit: 1 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: adminUserKeys.list({ role: 'outletAdmin', limit: 1 }),
        queryFn: () => adminUserApi.list({ role: 'outletAdmin' as any, limit: 1 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: adminUserKeys.list({ role: 'deliveryPartner', status: 'active', limit: 1 }),
        queryFn: () => adminUserApi.list({ role: 'deliveryPartner' as any, status: 'active', limit: 1 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: adminUserKeys.list({ status: 'pending', limit: 1 }),
        queryFn: () => adminUserApi.list({ status: 'pending' as any, limit: 1 }),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  return {
    totalStaff: queries[0].data?.total ?? 0,
    admins: queries[1].data?.total ?? 0,
    hubOwners: queries[2].data?.total ?? 0,
    activeRiders: queries[3].data?.total ?? 0,
    pendingCount: queries[4].data?.total ?? 0,
    isLoading: queries.some((q) => q.isLoading),
  };
}
