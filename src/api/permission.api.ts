import { apiClient } from '@/api/client';
import type {
  IRolePermission,
  IPermissionAuditResponse,
  IUserPermissionDetail,
} from '@/api/types/permission.types';

const BASE = '/admin/permissions';

export const permissionApi = {
  getRolePermissions: async (): Promise<IRolePermission[]> => {
    const response = await apiClient.get<IRolePermission[]>(`${BASE}/roles`);
    return response.data;
  },

  updateRolePermissions: async (
    role: string,
    permissions: string[],
  ): Promise<IRolePermission> => {
    const response = await apiClient.put<IRolePermission>(
      `${BASE}/roles/${role}`,
      { permissions },
    );
    return response.data;
  },

  resetRolePermissions: async (role: string): Promise<IRolePermission> => {
    const response = await apiClient.post<IRolePermission>(
      `${BASE}/roles/${role}/reset`,
    );
    return response.data;
  },

  getAuditLogs: async (params?: {
    action?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<IPermissionAuditResponse> => {
    const response = await apiClient.get<IPermissionAuditResponse>(
      `${BASE}/audit`,
      { params },
    );
    return response.data;
  },

  getUserPermissions: async (userId: string): Promise<IUserPermissionDetail> => {
    const response = await apiClient.get<IUserPermissionDetail>(
      `${BASE}/users/${userId}`,
    );
    return response.data;
  },

  updateUserPermissions: async (
    userId: string,
    data: { grants: string[]; revokes: string[] },
  ): Promise<any> => {
    const response = await apiClient.put(`${BASE}/users/${userId}`, data);
    return response.data;
  },
};
