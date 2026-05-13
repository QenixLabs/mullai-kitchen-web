'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Users,
  UtensilsCrossed,
  CreditCard,
  FileText,
  Truck,
  BarChart3,
  Settings,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PermissionCategory {
  key: string;
  label: string;
  order: number;
  permissions: { key: string; label: string }[];
}

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'outlet-management': Shield,
  'user-management': Users,
  'menu-recipes': UtensilsCrossed,
  'subscriptions-plans': CreditCard,
  invoices: FileText,
  'orders-delivery': Truck,
  'reports-analytics': BarChart3,
  'system-configuration': Settings,
  'permission-management': KeyRound,
};

interface PermissionMatrixProps {
  categories: PermissionCategory[];
  permissions: Set<string>;
  onChange: (permissions: Set<string>) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({
  categories,
  permissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.key)),
  );

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const togglePermission = (key: string) => {
    if (readOnly) return;
    const next = new Set(permissions);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const toggleAllInCategory = (category: PermissionCategory) => {
    if (readOnly) return;
    const allSelected = category.permissions.every((p) => permissions.has(p.key));
    const next = new Set(permissions);
    category.permissions.forEach((p) => {
      if (allSelected) next.delete(p.key);
      else next.add(p.key);
    });
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isOpen = openCategories.has(category.key);
        const allSelected = category.permissions.every((p) => permissions.has(p.key));
        const selectedCount = category.permissions.filter((p) =>
          permissions.has(p.key),
        ).length;
        const Icon = CATEGORY_ICONS[category.key] || Shield;
        const isFullySelected = selectedCount === category.permissions.length;
        const isPartial = selectedCount > 0 && !isFullySelected;

        return (
          <Card key={category.key} className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              {/* Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.key)}
                className="flex w-full items-center gap-2.5 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 truncate text-sm font-semibold tracking-tight text-foreground">
                  {category.label}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1',
                    isFullySelected
                      ? 'bg-success/15 text-success ring-success/20'
                      : isPartial
                        ? 'bg-info/15 text-info ring-info/20'
                        : 'bg-muted text-muted-foreground ring-border',
                  )}
                >
                  <span className="tabular-nums">{selectedCount}</span>
                  <span className="opacity-50">/</span>
                  <span className="tabular-nums">{category.permissions.length}</span>
                </span>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllInCategory(category);
                    }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </button>

              {/* Body */}
              {isOpen && (
                <div className="grid grid-cols-1 gap-1.5 px-3 py-3 md:grid-cols-2 lg:grid-cols-3">
                  {category.permissions.map((perm) => {
                    const isChecked = permissions.has(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-xs transition-colors',
                          readOnly ? 'cursor-default' : 'cursor-pointer',
                          isChecked
                            ? 'border-primary/20 bg-primary/5 text-foreground'
                            : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40',
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(perm.key)}
                          disabled={readOnly}
                          className={cn('shrink-0', isChecked && 'border-primary')}
                        />
                        <span
                          className={cn(
                            'truncate font-medium',
                            isChecked && 'text-foreground',
                          )}
                        >
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
