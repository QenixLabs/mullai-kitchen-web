export interface IRolePermission {
  _id: string;
  role: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermissionAuditLog {
  _id: string;
  user_id: string;
  user_name: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface IPermissionAuditResponse {
  data: IPermissionAuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface IUserPermissionDetail {
  role: string;
  rolePermissions: string[];
  grants: string[];
  revokes: string[];
  effectivePermissions: string[];
  assignedOutletId: string | null;
}
