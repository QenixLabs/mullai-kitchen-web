'use client';

import { useMemo, useState } from 'react';
import { Leaf, Drumstick, X, Pencil, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverrides, useDeleteOverride } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import type { MealRosterOverride } from '@/api/types/menu.types';

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
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (overrides.length === 0) {
    return (
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
      </div>
    );
  }

  return (
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-2xl" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold" style={{ color: '#3d000c' }}>
              Delete Override
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm" style={{ color: '#554243' }}>
              Are you sure you want to delete this override? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full" style={{ borderColor: 'rgba(219,192,193,0.3)', color: '#554243' }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteOverride.mutate(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
