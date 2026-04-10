export enum UserRole {
  SuperAdmin = "superAdmin",
  Admin = "admin",
  OutletAdmin = "outletAdmin",
  HubOwner = "hubOwner",
  DeliveryPartner = "deliveryPartner",
  Customer = "customer",
  Corporate = "corporate",
}

/** Roles that have access to the admin panel */
export const ADMIN_PANEL_ROLES: readonly UserRole[] = [
  UserRole.SuperAdmin,
  UserRole.Admin,
  UserRole.HubOwner,
] as const;

export function isAdminRole(role: string | undefined): boolean {
  return !!role && (ADMIN_PANEL_ROLES as readonly string[]).includes(role);
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: string;
  avatar_url?: string;
  assigned_outlet_id?: string;
  onboarding_completed?: boolean;
  dietary_preferences?: string;
  special_instructions?: string;
  preferred_contact_time?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: string[];
}
