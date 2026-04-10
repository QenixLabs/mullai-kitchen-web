import { apiClient } from '@/api/client';
import { ADMIN_ROUTES } from '@/api/routes';
import { UserRole } from '@/api/types/user.types';

// Types
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole.SuperAdmin | UserRole.OutletAdmin | UserRole.DeliveryPartner | UserRole.Customer | UserRole.Corporate;
  status: 'active' | 'inactive' | 'pending';
  assigned_outlet_id?: string;
  assigned_outlet_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  permission_grants?: string[];
  permission_revokes?: string[];
  deactivation_reason?: string;
  created_at: string;
  updated_at: string;
}

export type AdminUserRole = AdminUser['role'];

export interface AdminUserListParams {
  role?: AdminUserRole;
  status?: 'active' | 'inactive' | 'pending';
  outlet_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateHubOwnerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  assigned_outlet_id: string;
}

export interface CreateDeliveryPartnerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  assigned_outlet_id: string;
  vehicle_type?: string;
  vehicle_number?: string;
}

export interface UpdateUserStatusPayload {
  status: 'active' | 'inactive';
  deactivation_reason?: string;
}

export const adminUserApi = {
  list: async (params?: AdminUserListParams): Promise<AdminUserListResponse> => {
    const response = await apiClient.get<AdminUserListResponse>(ADMIN_ROUTES.USERS, { params });
    return response.data;
  },

  getById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUser>(ADMIN_ROUTES.USER_DETAIL(id));
    return response.data;
  },

  createAdmin: async (data: CreateAdminUserPayload): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>(ADMIN_ROUTES.CREATE_ADMIN, data);
    return response.data;
  },

  createHubOwner: async (data: CreateHubOwnerPayload): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>(ADMIN_ROUTES.CREATE_HUB_OWNER, data);
    return response.data;
  },

  createDeliveryPartner: async (data: CreateDeliveryPartnerPayload): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>(ADMIN_ROUTES.CREATE_DELIVERY_PARTNER, data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateUserStatusPayload): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUser>(ADMIN_ROUTES.USER_STATUS(id), data);
    return response.data;
  },
};
