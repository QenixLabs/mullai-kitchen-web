'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PERMISSION_CATEGORIES, type PermissionCategory } from '@/lib/permission-categories';
import { cn } from '@/lib/utils';

interface PermissionMatrixProps {
  permissions: Set<string>;
  onChange: (permissions: Set<string>) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({ permissions, onChange, readOnly = false }: PermissionMatrixProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(PERMISSION_CATEGORIES.map((c) => c.key)),
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
      {PERMISSION_CATEGORIES.map((category, index) => {
        const isOpen = openCategories.has(category.key);
        const allSelected = category.permissions.every((p) => permissions.has(p.key));
        const Icon = category.icon;
        const selectedCount = category.permissions.filter((p) => permissions.has(p.key)).length;

        return (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl bg-white border border-border/40 shadow-sm overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
              onClick={() => toggleCategory(category.key)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted/60"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="down"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="right"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <div className="p-1.5 rounded-lg bg-primary/5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span
                className="flex-1 font-semibold text-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {category.label}
              </span>
              <span className="text-sm font-medium text-muted-foreground mr-2">
                {selectedCount}/{category.permissions.length}
              </span>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs font-semibold border-border/60 hover:bg-muted/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllInCategory(category);
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-1.5 border-t border-border/30 px-5 py-3 md:grid-cols-2 lg:grid-cols-3">
                    {category.permissions.map((perm) => {
                      const isChecked = permissions.has(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150',
                            readOnly ? 'cursor-default' : 'cursor-pointer',
                            isChecked
                              ? 'bg-primary/5 border border-primary/10'
                              : 'hover:bg-muted/40 border border-transparent',
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(perm.key)}
                            disabled={readOnly}
                            className={cn(isChecked && 'border-primary')}
                          />
                          <span
                            className={cn(
                              'font-medium',
                              isChecked ? 'text-primary' : 'text-primary/70',
                            )}
                          >
                            {perm.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
