'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAvailablePermissions } from '@/api/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldOff, Search, Shield, Check } from 'lucide-react';

interface AddOverrideDialogProps {
  existingGrants: string[];
  existingRevokes: string[];
  onAdd: (permission: string, type: 'grant' | 'revoke') => void;
  onClose: () => void;
}

export function AddOverrideDialog({
  existingGrants,
  existingRevokes,
  onAdd,
  onClose,
}: AddOverrideDialogProps) {
  const [type, setType] = useState<'grant' | 'revoke'>('grant');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const { data: availablePermissions } = useAvailablePermissions();
  const categories = availablePermissions?.categories || [];

  const alreadyOverridden = useMemo(() => {
    return new Set([...existingGrants, ...existingRevokes]);
  }, [existingGrants, existingRevokes]);

  const filteredPermissions = useMemo(() => {
    const results: { key: string; label: string; category: string }[] = [];
    for (const cat of categories) {
      for (const perm of cat.permissions) {
        if (alreadyOverridden.has(perm.key)) continue;
        if (
          search &&
          !perm.label.toLowerCase().includes(search.toLowerCase()) &&
          !perm.key.toLowerCase().includes(search.toLowerCase())
        )
          continue;
        results.push({ key: perm.key, label: perm.label, category: cat.label });
      }
    }
    return results;
  }, [search, alreadyOverridden, categories]);

  const handleAdd = () => {
    if (selected) onAdd(selected, type);
  };

  const isGrant = type === 'grant';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="space-y-1 border-b border-border/70 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Shield className="h-3.5 w-3.5" />
            </span>
            Add Permission Override
          </DialogTitle>
          <DialogDescription>
            Choose whether to grant or revoke a specific permission for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          {/* Grant / Revoke segmented toggle */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Override Type
            </p>
            <div className="inline-flex h-9 items-center rounded-md border border-border/70 bg-muted p-1">
              <button
                type="button"
                onClick={() => setType('grant')}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold uppercase tracking-wide transition-all',
                  isGrant
                    ? 'bg-success/15 text-success ring-1 ring-success/20'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Grant
              </button>
              <button
                type="button"
                onClick={() => setType('revoke')}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold uppercase tracking-wide transition-all',
                  !isGrant
                    ? 'bg-destructive/15 text-destructive ring-1 ring-destructive/20'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <ShieldOff className="h-3.5 w-3.5" />
                Revoke
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Permission
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          {/* Permission list */}
          <div className="rounded-md border border-border/70 bg-muted/20">
            <div className="max-h-[260px] space-y-1 overflow-y-auto p-1.5">
              {filteredPermissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                  <Search className="h-5 w-5 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">
                    {search ? 'No permissions match your search.' : 'No permissions available.'}
                  </p>
                </div>
              ) : (
                filteredPermissions.map((perm) => {
                  const isSelected = selected === perm.key;
                  return (
                    <button
                      key={perm.key}
                      type="button"
                      onClick={() => setSelected(perm.key)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors',
                        isSelected
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-transparent hover:border-border/70 hover:bg-background',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground ring-primary'
                            : 'bg-background ring-border',
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-xs font-semibold',
                            isSelected ? 'text-foreground' : 'text-foreground/80',
                          )}
                        >
                          {perm.label}
                        </p>
                        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {perm.category}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/70 bg-muted/20 px-5 py-3">
          <Button variant="outline" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selected}
            className={cn(
              'h-9 gap-1.5',
              isGrant
                ? 'bg-success text-success-foreground hover:bg-success/90'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {isGrant ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
            Add {isGrant ? 'Grant' : 'Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
