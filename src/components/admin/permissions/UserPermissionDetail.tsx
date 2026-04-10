'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  useUserPermissions,
  useUpdateUserPermissions,
  useAvailablePermissions,
} from '@/api/hooks/usePermissions';
import { Can } from '@/components/Auth/can';
import { AddOverrideDialog } from './AddOverrideDialog';
import {
  Loader2,
  Plus,
  X,
  Shield,
  ShieldCheck,
  ShieldOff,
  KeyRound,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_ICONS } from './PermissionMatrix';

interface UserPermissionDetailProps {
  userId: string;
  userName?: string;
}

export function UserPermissionDetail({
  userId,
  userName,
}: UserPermissionDetailProps) {
  const { data: permDetail, isLoading } = useUserPermissions(userId);
  const { data: availablePermissions } = useAvailablePermissions();
  const updateMutation = useUpdateUserPermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white border border-border/40 p-6 space-y-4">
          <Skeleton className="h-8 w-48 rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-[9px]" />
            ))}
          </div>
          <Separator />
          <Skeleton className="h-8 w-36 rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-[9px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!permDetail) return null;

  const grants = new Set(permDetail.grants);
  const revokes = new Set(permDetail.revokes);

  const handleRemoveOverride = (perm: string, type: 'grant' | 'revoke') => {
    const newGrants =
      type === 'grant'
        ? permDetail.grants.filter((p) => p !== perm)
        : [...permDetail.grants];
    const newRevokes =
      type === 'revoke'
        ? permDetail.revokes.filter((p) => p !== perm)
        : [...permDetail.revokes];
    updateMutation.mutate({
      userId,
      data: { grants: newGrants, revokes: newRevokes },
    });
  };

  const handleAddOverride = (permission: string, type: 'grant' | 'revoke') => {
    const newGrants =
      type === 'grant'
        ? [...permDetail.grants, permission]
        : [...permDetail.grants];
    const newRevokes =
      type === 'revoke'
        ? [...permDetail.revokes, permission]
        : [...permDetail.revokes];
    updateMutation.mutate({
      userId,
      data: { grants: newGrants, revokes: newRevokes },
    });
    setShowAddDialog(false);
  };

  // Build a label lookup from API categories
  const permissionLabels = new Map<string, string>();
  const categories = availablePermissions?.categories || [];
  for (const cat of categories) {
    for (const p of cat.permissions) {
      permissionLabels.set(p.key, p.label);
    }
  }

  const getPermissionLabel = (key: string): string => {
    return permissionLabels.get(key) || key;
  };

  // Group effective permissions by category (from API)
  const effectiveByCategory = categories
    .map((cat) => ({
      ...cat,
      effective: cat.permissions.filter((p) =>
        permDetail.effectivePermissions.includes(p.key),
      ),
    }))
    .filter((cat) => cat.effective.length > 0);

  // Also include any effective permissions not in any category
  const allKnownKeys = new Set(categories.flatMap((c) => c.permissions.map((p) => p.key)));
  const uncategorized = permDetail.effectivePermissions.filter((p) => !allKnownKeys.has(p));

  return (
    <div className="space-y-6">
      {/* Overrides section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="rounded-3xl bg-white border border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/5">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold text-primary"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Permission Overrides
                  </CardTitle>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                    Individual grants and revokes for this user
                  </p>
                </div>
              </div>
              <Can permission={['permission:grant', 'permission:revoke']}>
                <Button
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Override
                </Button>
              </Can>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {/* Grants */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Granted ({grants.size})
              </h4>
              {grants.size === 0 ? (
                <div className="flex flex-col items-center py-6 rounded-2xl bg-muted/30">
                  <ShieldCheck className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No individual grants</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {permDetail.grants.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-emerald-500 text-white text-sm font-semibold"
                    >
                      {getPermissionLabel(perm)}
                      <Can permission={['permission:grant']}>
                        <button
                          onClick={() => handleRemoveOverride(perm, 'grant')}
                          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Can>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-border/30" />

            {/* Revokes */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <ShieldOff className="h-4 w-4 text-red-500" />
                Revoked ({revokes.size})
              </h4>
              {revokes.size === 0 ? (
                <div className="flex flex-col items-center py-6 rounded-2xl bg-muted/30">
                  <ShieldOff className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No individual revokes</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {permDetail.revokes.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-red-500 text-white text-sm font-semibold"
                    >
                      {getPermissionLabel(perm)}
                      <Can permission={['permission:revoke']}>
                        <button
                          onClick={() => handleRemoveOverride(perm, 'revoke')}
                          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Can>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Effective permissions summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="rounded-3xl bg-white border border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/5">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle
                  className="text-lg font-bold text-primary"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Effective Permissions
                </CardTitle>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                  {permDetail.effectivePermissions.length} active permissions
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {effectiveByCategory.map((cat, index) => {
              const Icon = CATEGORY_ICONS[cat.key] || Shield;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                    <Icon className="h-3.5 w-3.5 text-primary/50" />
                    {cat.label} ({cat.effective.length}/{cat.permissions.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.effective.map((p) => (
                      <span
                        key={p.key}
                        className="inline-flex items-center px-3 py-1 rounded-[9px] bg-primary/5 border border-primary/10 text-xs font-semibold text-primary"
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {uncategorized.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + effectiveByCategory.length * 0.05 }}
              >
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-primary/50" />
                  Other ({uncategorized.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {uncategorized.map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-[9px] bg-primary/5 border border-primary/10 text-xs font-semibold text-primary"
                    >
                      {getPermissionLabel(key)}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Override Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <AddOverrideDialog
            existingGrants={permDetail.grants}
            existingRevokes={permDetail.revokes}
            onAdd={handleAddOverride}
            onClose={() => setShowAddDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
