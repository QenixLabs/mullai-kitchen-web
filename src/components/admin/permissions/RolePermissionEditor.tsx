'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PermissionMatrix, PermissionCategory } from './PermissionMatrix';
import {
  useRolePermissions,
  useUpdateRolePermissions,
  useResetRolePermissions,
  useAvailablePermissions,
} from '@/api/hooks/usePermissions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { Loader2, Save, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EDITABLE_ROLES = [
  { value: 'outletAdmin', label: 'Admin Role' },
  { value: 'deliveryPartner', label: 'Hub Owner' },
  { value: 'customer', label: 'Kitchen Staff' },
  { value: 'corporate', label: 'Corporate' },
];

// Static mock categories for UI preview when API returns empty
const MOCK_CATEGORIES: PermissionCategory[] = [
  {
    key: 'outlet-management',
    label: 'Outlets',
    order: 1,
    permissions: [
      { key: 'outlet:view', label: 'View Outlets' },
      { key: 'outlet:create', label: 'Create New Outlet' },
      { key: 'outlet:edit', label: 'Edit Outlet Info' },
      { key: 'outlet:delete', label: 'Delete Outlets' },
    ],
  },
  {
    key: 'user-management',
    label: 'Users',
    order: 2,
    permissions: [
      { key: 'user:manage', label: 'Manage Staff' },
      { key: 'user:assign_roles', label: 'Assign Roles' },
      { key: 'user:audit_logs', label: 'Audit Login Logs' },
      { key: 'user:reset_password', label: 'Reset Passwords' },
    ],
  },
  {
    key: 'orders-delivery',
    label: 'Orders',
    order: 3,
    permissions: [
      { key: 'order:view_live', label: 'View Live Orders' },
      { key: 'order:refund', label: 'Process Refunds' },
      { key: 'order:adjust', label: 'Adjust Order Items' },
      { key: 'order:bulk_export', label: 'Bulk Order Export' },
    ],
  },
  {
    key: 'reports-analytics',
    label: 'Reports & Intelligence',
    order: 4,
    permissions: [
      { key: 'report:revenue', label: 'Access Revenue Dashboard' },
      { key: 'report:kitchen', label: 'Kitchen Performance Metrics' },
      { key: 'report:feedback', label: 'Customer Feedback Analysis' },
      { key: 'report:inventory', label: 'Download Inventory Reports' },
      { key: 'report:vendor', label: 'Vendor Payment Insights' },
      { key: 'report:audit', label: 'Super Admin Audit Logs' },
    ],
  },
];

export function RolePermissionEditor() {
  const [selectedRole, setSelectedRole] = useState('outletAdmin');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  const canEdit = useHasPermission(['permission:grant', 'permission:revoke']);
  const { data: rolePermissions, isLoading } = useRolePermissions();
  const { data: availablePermissions } = useAvailablePermissions();
  const updateMutation = useUpdateRolePermissions();
  const resetMutation = useResetRolePermissions();

  const categories =
    availablePermissions?.categories?.length
      ? availablePermissions.categories
      : MOCK_CATEGORIES;

  const currentRoleData = rolePermissions?.find((rp) => rp.role === selectedRole);

  useEffect(() => {
    if (currentRoleData) {
      setPermissions(new Set(currentRoleData.permissions));
      setIsDirty(false);
    }
  }, [currentRoleData]);

  const handlePermissionChange = (newPermissions: Set<string>) => {
    setPermissions(newPermissions);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      { role: selectedRole, permissions: Array.from(permissions) },
      { onSuccess: () => setIsDirty(false) },
    );
  };

  const handleReset = () => {
    resetMutation.mutate(selectedRole, {
      onSuccess: () => setIsDirty(false),
    });
  };

  const isSaving = updateMutation.isPending || resetMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2">
        {EDITABLE_ROLES.map((role) => {
          const isActive = selectedRole === role.value;
          return (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#44151c' : 'rgba(255,255,255,0.6)',
                color: isActive ? '#fff' : '#554243',
                border: isActive
                  ? '1px solid #44151c'
                  : '1px solid rgba(219,192,193,0.3)',
                boxShadow: isActive ? '0 1px 3px rgba(68,21,28,0.15)' : 'none',
              }}
            >
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Permission Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white p-6"
              style={{ border: '1px solid rgba(219,192,193,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-5 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PermissionMatrix
            categories={categories}
            permissions={permissions}
            onChange={handlePermissionChange}
            readOnly={!canEdit}
          />
        </motion.div>
      )}

      {/* Bottom Actions */}
      {canEdit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isSaving}
                className="text-sm font-semibold transition-colors hover:opacity-80 disabled:opacity-50"
                style={{ color: '#44151c' }}
              >
                Reset Changes
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle
                  className="text-xl font-bold"
                  style={{ color: '#3d000c', fontFamily: 'Inter, sans-serif' }}
                >
                  Reset Permissions
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[15px]">
                  This will reset all permissions for the{' '}
                  <span className="font-semibold" style={{ color: '#3d000c' }}>
                    {EDITABLE_ROLES.find((r) => r.value === selectedRole)?.label}
                  </span>{' '}
                  role back to their default values. Any custom changes will be
                  lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full px-5">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="rounded-full px-5 text-white"
                  style={{ backgroundColor: '#44151c' }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="rounded-full px-7 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{
              backgroundColor: '#44151c',
              opacity: !isDirty || isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Permissions
          </Button>
        </motion.div>
      )}
    </div>
  );
}
