'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  useUserPermissions,
  useUpdateUserPermissions,
  useAvailablePermissions,
} from '@/api/hooks/usePermissions';
import { Can } from '@/components/Auth/can';
import { AddOverrideDialog } from './AddOverrideDialog';
import {
  Plus,
  X,
  Shield,
  ShieldCheck,
  ShieldOff,
  KeyRound,
} from 'lucide-react';
import { CATEGORY_ICONS } from './PermissionMatrix';

interface UserPermissionDetailProps {
  userId: string;
  userName?: string;
}

function HeaderStrip({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function UserPermissionDetail({ userId }: UserPermissionDetailProps) {
  const { data: permDetail, isLoading } = useUserPermissions(userId);
  const { data: availablePermissions } = useAvailablePermissions();
  const updateMutation = useUpdateUserPermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
            <Separator />
            <Skeleton className="h-5 w-36" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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

  const effectiveByCategory = categories
    .map((cat) => ({
      ...cat,
      effective: cat.permissions.filter((p) =>
        permDetail.effectivePermissions.includes(p.key),
      ),
    }))
    .filter((cat) => cat.effective.length > 0);

  const allKnownKeys = new Set(categories.flatMap((c) => c.permissions.map((p) => p.key)));
  const uncategorized = permDetail.effectivePermissions.filter(
    (p) => !allKnownKeys.has(p),
  );

  return (
    <div className="space-y-5">
      {/* Overrides Card */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            icon={Shield}
            title="Permission Overrides"
            subtitle="Individual grants and revokes"
            action={
              <Can permission={['permission:grant', 'permission:revoke']}>
                <Button
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="h-8 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Override
                </Button>
              </Can>
            }
          />
          <div className="space-y-4 px-4 py-4">
            {/* Grants */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Granted
                </span>
                <span className="rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-success">
                  {grants.size}
                </span>
              </div>
              {grants.size === 0 ? (
                <div className="flex items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-5 text-xs text-muted-foreground">
                  No individual grants
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {permDetail.grants.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 py-0.5 pl-2 pr-1 text-xs font-medium text-success"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {getPermissionLabel(perm)}
                      <Can permission={['permission:grant']}>
                        <button
                          type="button"
                          onClick={() => handleRemoveOverride(perm, 'grant')}
                          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-success/70 transition-colors hover:bg-success/15 hover:text-success"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Can>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Revokes */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShieldOff className="h-3.5 w-3.5 text-destructive" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Revoked
                </span>
                <span className="rounded-md border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-destructive">
                  {revokes.size}
                </span>
              </div>
              {revokes.size === 0 ? (
                <div className="flex items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-5 text-xs text-muted-foreground">
                  No individual revokes
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {permDetail.revokes.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 py-0.5 pl-2 pr-1 text-xs font-medium text-destructive"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      {getPermissionLabel(perm)}
                      <Can permission={['permission:revoke']}>
                        <button
                          type="button"
                          onClick={() => handleRemoveOverride(perm, 'revoke')}
                          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-destructive/70 transition-colors hover:bg-destructive/15 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Can>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Effective Permissions Card */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip
            icon={KeyRound}
            title="Effective Permissions"
            subtitle={`${permDetail.effectivePermissions.length} active`}
          />
          <div className="space-y-4 px-4 py-4">
            {effectiveByCategory.length === 0 && uncategorized.length === 0 ? (
              <div className="flex items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-6 text-xs text-muted-foreground">
                No effective permissions
              </div>
            ) : (
              <>
                {effectiveByCategory.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.key] || Shield;
                  return (
                    <div key={cat.key}>
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {cat.label}
                        </span>
                        <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                          {cat.effective.length}/{cat.permissions.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.effective.map((p) => (
                          <span
                            key={p.key}
                            className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground/80 ring-1 ring-primary/15"
                          >
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {uncategorized.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Other
                      </span>
                      <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {uncategorized.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {uncategorized.map((key) => (
                        <span
                          key={key}
                          className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground/80 ring-1 ring-primary/15"
                        >
                          {getPermissionLabel(key)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddOverrideDialog
          existingGrants={permDetail.grants}
          existingRevokes={permDetail.revokes}
          onAdd={handleAddOverride}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}
