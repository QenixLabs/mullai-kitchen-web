'use client';

import { useMemo, useState } from 'react';
<<<<<<< HEAD
import { Leaf, Drumstick, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
=======
import { Leaf, Drumstick, X, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
>>>>>>> 831ebf2 (admin pages ui changes)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverrides, useDeleteOverride } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import type { MealRosterOverride } from '@/api/types/menu.types';
import { cn } from '@/lib/utils';

interface OverrideListProps {
  outletId: string;
  dateFrom: string;
  dateUntil: string;
  onEdit: (override: MealRosterOverride) => void;
}

function StatusBadge({ isClosed }: { isClosed: boolean }) {
  if (isClosed) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: 'rgba(255,0,4,0.12)', color: '#ff0004' }}
      >
        <X className="h-3 w-3" />
        Closed
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: 'rgba(68,21,28,0.08)', color: '#44151c' }}
    >
      Overridden
    </span>
  );
}

function MealBadge({ mealType }: { mealType: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{
        backgroundColor: 'rgba(219,192,193,0.2)',
        color: '#554243',
      }}
    >
      {mealType}
    </span>
  );
}

export function OverrideList({ outletId, dateFrom, dateUntil, onEdit }: OverrideListProps) {
  const { data: overridesData, isLoading } = useOverrides(outletId, { date_from: dateFrom, date_until: dateUntil });
  const { data: recipes } = useRecipeSelect(outletId);
  const deleteOverride = useDeleteOverride(outletId);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const recipeNames = useMemo(() => {
    const map = new Map<string, string>();
    (recipes || []).forEach((r) => map.set(r._id, r.name));
    return map;
  }, [recipes]);

  const getRecipeName = (id?: string) => {
    if (!id) return null;
    return recipeNames.get(id) || id;
  };

  const overrides = overridesData?.data || [];

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
=======
      <div className="bg-white rounded-xl border border-border/40 shadow-sm p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
>>>>>>> 831ebf2 (admin pages ui changes)
        ))}
      </div>
    );
  }

  if (overrides.length === 0) {
    return (
<<<<<<< HEAD
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full p-4 mb-3" style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}>
          <Leaf className="h-6 w-6" style={{ color: '#44151c' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: '#3d000c' }}>
          No overrides for this period
        </p>
        <p className="text-xs mt-1" style={{ color: '#554243' }}>
          Click a date on the calendar to add an override
        </p>
=======
      <div className="bg-white rounded-xl border border-border/40 shadow-sm p-10 text-center">
        <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">No overrides for this period</h3>
        <p className="text-xs text-muted-foreground">Click a calendar day or "Add Override" to create one.</p>
>>>>>>> 831ebf2 (admin pages ui changes)
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <>
      <div className="overflow-hidden rounded-3xl bg-white" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(219,192,193,0.2)' }}>
                {['Date', 'Meal', 'Veg Recipe', 'Non-Veg Recipe', 'Status', 'Reason', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#554243' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overrides.map((ov, idx) => {
                const vegName = getRecipeName(ov.veg_recipe_id);
                const nonvegName = getRecipeName(ov.nonveg_recipe_id);
                return (
                  <tr
                    key={ov._id}
                    style={{
                      borderBottom:
                        idx < overrides.length - 1
                          ? '1px solid rgba(219,192,193,0.15)'
                          : 'none',
                    }}
                    className="transition-colors hover:bg-[rgba(68,21,28,0.02)]"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold" style={{ color: '#3d000c' }}>
                        {ov.date?.split('T')[0]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <MealBadge mealType={ov.meal_type} />
                    </td>
                    <td className="px-5 py-4">
                      {ov.is_closed ? (
                        <span className="text-sm" style={{ color: '#554243' }}>—</span>
                      ) : vegName ? (
                        <span className="flex items-center gap-1.5 text-sm" style={{ color: '#3d000c' }}>
                          <Leaf className="h-3.5 w-3.5 text-[#00990f]" />
                          {vegName}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: '#554243' }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {ov.is_closed ? (
                        <span className="text-sm" style={{ color: '#554243' }}>—</span>
                      ) : nonvegName ? (
                        <span className="flex items-center gap-1.5 text-sm" style={{ color: '#3d000c' }}>
                          <Drumstick className="h-3.5 w-3.5 text-[#ff0004]" />
                          {nonvegName}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: '#554243' }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge isClosed={ov.is_closed} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm truncate max-w-[160px] inline-block" style={{ color: '#554243' }}>
                        {ov.reason || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
                          onClick={() => onEdit(ov)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-[#554243] hover:text-[#ff0004] hover:bg-[rgba(255,0,4,0.08)]"
                          onClick={() => setDeleteTarget(ov._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
=======
    <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[120px_100px_1fr_1fr_100px_200px_100px] gap-4 px-5 py-3 border-b border-border/30 bg-muted/20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meal</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Veg Recipe</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Non-Veg Recipe</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/20">
        {overrides.map((ov) => {
          const vegName = getRecipeName(ov.veg_recipe_id);
          const nonvegName = getRecipeName(ov.nonveg_recipe_id);
          const dateStr = ov.date?.split('T')[0] || '';
          const [y, m, d] = dateStr.split('-');
          const formattedDate = `${m}/${d}/${y}`;

          return (
            <div
              key={ov._id}
              className="grid grid-cols-[120px_100px_1fr_1fr_100px_200px_100px] gap-4 px-5 py-3.5 items-center hover:bg-muted/10 transition-colors"
            >
              {/* Date */}
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{formattedDate}</span>
              </div>

              {/* Meal Type */}
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                ov.meal_type === 'Breakfast' && 'bg-info/10 text-info',
                ov.meal_type === 'Lunch' && 'bg-warning/10 text-warning',
                ov.meal_type === 'Dinner' && 'bg-primary/10 text-primary',
              )}>
                {ov.meal_type}
              </span>

              {/* Veg */}
              <div className="text-sm">
                {ov.is_closed ? (
                  <span className="text-muted-foreground">—</span>
                ) : vegName ? (
                  <span className="flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-success" />
                    <span className="text-foreground truncate">{vegName}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>

              {/* Non-Veg */}
              <div className="text-sm">
                {ov.is_closed ? (
                  <span className="text-muted-foreground">—</span>
                ) : nonvegName ? (
                  <span className="flex items-center gap-1.5">
                    <Drumstick className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground truncate">{nonvegName}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
>>>>>>> 831ebf2 (admin pages ui changes)

              {/* Status */}
              <div>
                {ov.is_closed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive">
                    <X className="h-2.5 w-2.5" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    Overridden
                  </span>
                )}
              </div>

              {/* Reason */}
              <span className="text-xs text-muted-foreground truncate">
                {ov.reason || '—'}
              </span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(ov)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(ov._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
<<<<<<< HEAD
        <AlertDialogContent className="rounded-2xl" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
=======
        <AlertDialogContent className="rounded-xl">
>>>>>>> 831ebf2 (admin pages ui changes)
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold" style={{ color: '#3d000c' }}>
              Delete Override
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm" style={{ color: '#554243' }}>
              Are you sure you want to delete this override? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
<<<<<<< HEAD
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full" style={{ borderColor: 'rgba(219,192,193,0.3)', color: '#554243' }}>
              Cancel
            </AlertDialogCancel>
=======
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full h-9">Cancel</AlertDialogCancel>
>>>>>>> 831ebf2 (admin pages ui changes)
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteOverride.mutate(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
<<<<<<< HEAD
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
=======
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full h-9"
>>>>>>> 831ebf2 (admin pages ui changes)
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
<<<<<<< HEAD
    </>
=======
    </div>
>>>>>>> 831ebf2 (admin pages ui changes)
  );
}
