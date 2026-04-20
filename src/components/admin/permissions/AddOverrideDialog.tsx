'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAvailablePermissions } from '@/api/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldOff, Search } from 'lucide-react';

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
    if (selected) {
      onAdd(selected, type);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle
            className="text-xl font-bold text-primary"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Add Permission Override
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-4 pb-2">
          {/* Grant / Revoke pill toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('grant')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
                type === 'grant'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted',
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Grant
            </button>
            <button
              type="button"
              onClick={() => setType('revoke')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
                type === 'revoke'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted',
              )}
            >
              <ShieldOff className="h-4 w-4" />
              Revoke
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-border/40 bg-muted/30 focus:bg-white"
            />
          </div>

          {/* Scrollable permission list */}
          <div className="h-[300px] overflow-y-auto rounded-xl border border-border/30 bg-muted/20">
            <div className="p-2 space-y-1">
              {filteredPermissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No permissions available
                  </p>
                </div>
              ) : (
                filteredPermissions.map((perm) => (
                  <button
                    key={perm.key}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all duration-150',
                      selected === perm.key
                        ? 'bg-primary/5 border border-primary/20 shadow-sm'
                        : 'hover:bg-white/60 border border-transparent',
                    )}
                    onClick={() => setSelected(perm.key)}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 shrink-0 transition-all duration-150 flex items-center justify-center',
                        selected === perm.key
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/40',
                      )}
                    >
                      {selected === perm.key && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-1.5 w-1.5 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{perm.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {perm.category}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 bg-muted/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-border/60 px-5 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selected}
            className={cn(
              'rounded-full px-5 font-semibold text-white transition-colors',
              type === 'grant'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600',
            )}
          >
            Add {type === 'grant' ? 'Grant' : 'Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
