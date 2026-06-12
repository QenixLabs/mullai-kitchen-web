import {
  Shield,
  Users,
  UtensilsCrossed,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  KeyRound,
} from 'lucide-react';

export interface PermissionCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: { key: string; label: string }[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'outlet',
    label: 'Outlet Management',
    icon: Shield,
    permissions: [
      { key: 'outlet:create', label: 'Create Outlet' },
      { key: 'outlet:edit:any', label: 'Edit Any Outlet' },
      { key: 'outlet:edit:own', label: 'Edit Own Outlet' },
      { key: 'outlet:delete', label: 'Delete Outlet' },
      { key: 'outlet:view:any', label: 'View Any Outlet' },
      { key: 'outlet:view:own', label: 'View Own Outlet' },
      { key: 'outlet:zones', label: 'Manage Zones' },
    ],
  },
  {
    key: 'user',
    label: 'User Management',
    icon: Users,
    permissions: [
      { key: 'user:create:admin', label: 'Create Admin' },
      { key: 'user:create:hub', label: 'Create Hub User' },
      { key: 'user:create:delivery', label: 'Create Delivery Partner' },
      { key: 'user:view:any', label: 'View Any User' },
      { key: 'user:view:outlet', label: 'View Outlet Users' },
      { key: 'user:edit:role', label: 'Edit User Roles' },
      { key: 'user:status', label: 'Change User Status' },
    ],
  },
  {
    key: 'menu',
    label: 'Menu & Recipes',
    icon: UtensilsCrossed,
    permissions: [
      { key: 'menu:view', label: 'View Menu' },
      { key: 'menu:manage', label: 'Manage Menu' },
      { key: 'recipe:create:global', label: 'Create Global Recipe' },
      { key: 'recipe:edit:global', label: 'Edit Global Recipe' },
      { key: 'recipe:view', label: 'View Recipes' },
      { key: 'template:manage', label: 'Manage Templates' },
      { key: 'override:manage', label: 'Manage Overrides' },
    ],
  },
  {
    key: 'subscription',
    label: 'Subscriptions & Plans',
    icon: CreditCard,
    permissions: [
      { key: 'plan:create:global', label: 'Create Global Plan' },
      { key: 'plan:edit:global', label: 'Edit Global Plan' },
      { key: 'subscription:view:any', label: 'View Any Subscription' },
      { key: 'subscription:view:outlet', label: 'View Outlet Subscriptions' },
      { key: 'subscription:modify', label: 'Modify Subscriptions' },
    ],
  },
  {
    key: 'order',
    label: 'Orders & Delivery',
    icon: Truck,
    permissions: [
      { key: 'order:view:any', label: 'View Any Order' },
      { key: 'order:view:outlet', label: 'View Outlet Orders' },
      { key: 'route:generate', label: 'Generate Routes' },
      { key: 'route:assign', label: 'Assign Routes' },
      { key: 'order:kitchen', label: 'Kitchen Operations' },
      { key: 'order:deliver', label: 'Deliver Orders' },
    ],
  },
  {
    key: 'report',
    label: 'Reports & Analytics',
    icon: BarChart3,
    permissions: [
      { key: 'report:cross-outlet', label: 'Cross-Outlet Reports' },
      { key: 'report:outlet', label: 'Outlet Reports' },
      { key: 'report:export', label: 'Export Reports' },
      { key: 'report:financial', label: 'Financial Reports' },
    ],
  },
  {
    key: 'config',
    label: 'System Configuration',
    icon: Settings,
    permissions: [
      { key: 'config:system', label: 'System Config' },
      { key: 'config:outlet', label: 'Outlet Config' },
      { key: 'config:notifications', label: 'Notification Config' },
      { key: 'config:integrations', label: 'Integration Config' },
    ],
  },
  {
    key: 'permission',
    label: 'Permission Management',
    icon: KeyRound,
    permissions: [
      { key: 'permission:grant', label: 'Grant Permissions' },
      { key: 'permission:revoke', label: 'Revoke Permissions' },
      { key: 'permission:view', label: 'View Permissions' },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap((cat) =>
  cat.permissions.map((p) => p.key),
);

export function getPermissionLabel(key: string): string {
  for (const cat of PERMISSION_CATEGORIES) {
    const found = cat.permissions.find((p) => p.key === key);
    if (found) return found.label;
  }
  return key;
}

export function getPermissionCategory(key: string): PermissionCategory | undefined {
  return PERMISSION_CATEGORIES.find((cat) =>
    cat.permissions.some((p) => p.key === key),
  );
}
