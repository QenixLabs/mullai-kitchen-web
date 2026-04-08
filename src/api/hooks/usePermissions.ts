"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { permissionApi } from "@/api/permission.api";
import { permissionKeys } from "@/api/query-keys";

export function useRolePermissions() {
  return useQuery({
    queryKey: permissionKeys.roles(),
    queryFn: permissionApi.getRolePermissions,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      permissionApi.updateRolePermissions(role, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.roles() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.auditLogs() });
      toast.success("Role permissions updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update role permissions");
    },
  });
}

export function useResetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: string) => permissionApi.resetRolePermissions(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.roles() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.auditLogs() });
      toast.success("Role permissions reset to defaults");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset role permissions");
    },
  });
}

export function usePermissionAuditLogs(params?: {
  action?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: permissionKeys.auditLogs(params),
    queryFn: () => permissionApi.getAuditLogs(params),
  });
}

export function useUserPermissions(userId: string | null) {
  return useQuery({
    queryKey: permissionKeys.userPermissions(userId!),
    queryFn: () => permissionApi.getUserPermissions(userId!),
    enabled: !!userId,
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { grants: string[]; revokes: string[] };
    }) => permissionApi.updateUserPermissions(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.userPermissions(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: permissionKeys.auditLogs() });
      toast.success("User permissions updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update user permissions");
    },
  });
}
