'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { PermissionMatrix } from './PermissionMatrix';
import {
  useRolePermissions,
  useUpdateRolePermissions,
  useResetRolePermissions,
  useAvailablePermissions,
} from '@/api/hooks/usePermissions';
import { useHasPermission } from '@/hooks/useHasPermission';
import { Loader2, Save, RotateCcw, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EDITABLE_ROLES = [
  { value: 'outletAdmin', label: 'Outlet Admin' },
  { value: 'deliveryPartner', label: 'Delivery Partner' },
  { value: 'customer', label: 'Customer' },
  { value: 'corporate', label: 'Corporate' },
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

  const categories = availablePermissions?.categories || [];

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white border border-border/40 p-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Selected Role
            </p>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px] border-0 bg-transparent p-0 h-auto text-base font-semibold text-primary focus:ring-0">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {EDITABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isSaving}
                  className="rounded-full border-border/60 px-5 text-sm font-semibold hover:bg-muted/60"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle
                    className="text-xl font-bold text-primary"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Reset Permissions
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[15px]">
                    This will reset all permissions for the{' '}
                    <span className="font-semibold text-primary">
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
                    className="rounded-full bg-primary px-5 text-white hover:bg-primary/90"
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl bg-white border border-border/40 p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-10 w-3/4 rounded-2xl" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PermissionMatrix
              categories={categories}
              permissions={permissions}
              onChange={handlePermissionChange}
              readOnly={!canEdit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
