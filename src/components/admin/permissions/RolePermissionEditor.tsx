'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Loader2, Save, RotateCcw, Shield, AlertTriangle } from 'lucide-react';

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
  const selectedRoleLabel =
    EDITABLE_ROLES.find((r) => r.value === selectedRole)?.label || selectedRole;

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
    <div className="space-y-5">
      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Shield className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Selected Role
              </p>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-8 w-[200px] border-0 bg-transparent p-0 text-sm font-semibold text-foreground hover:text-foreground focus:ring-0">
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
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    className="h-9 gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to Default
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-base">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10 text-warning ring-1 ring-warning/20">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </span>
                      Reset Permissions
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You're about to reset permissions for the{' '}
                      <span className="font-semibold text-foreground">
                        {selectedRoleLabel}
                      </span>{' '}
                      role to their default values. Any custom changes will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      This affects every user assigned to this role. Individual user
                      overrides remain untouched.
                    </span>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="h-9 gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Role
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                size="sm"
                className="h-9 gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matrix */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/70 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-9 rounded-md" />
                  <Skeleton className="h-9 rounded-md" />
                  <Skeleton className="h-9 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <PermissionMatrix
          categories={categories}
          permissions={permissions}
          onChange={handlePermissionChange}
          readOnly={!canEdit}
        />
      )}
    </div>
  );
}
