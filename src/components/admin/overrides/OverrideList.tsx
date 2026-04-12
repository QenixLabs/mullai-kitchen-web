'use client';

import { useMemo, useState } from 'react';
import { Leaf, Drumstick, X, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

interface OverrideListProps {
  outletId: string;
  dateFrom: string;
  dateUntil: string;
  onEdit: (override: MealRosterOverride) => void;
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
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (overrides.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No overrides for this period.
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead>Veg</TableHead>
            <TableHead>Non-Veg</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {overrides.map((ov) => {
            const vegName = getRecipeName(ov.veg_recipe_id);
            const nonvegName = getRecipeName(ov.nonveg_recipe_id);
            return (
            <TableRow key={ov._id}>
              <TableCell className="text-sm">
                {ov.date?.split('T')[0]}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{ov.meal_type}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {ov.is_closed ? (
                  <span className="text-muted-foreground">—</span>
                ) : vegName ? (
                  <span className="flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-green-600" />
                    {vegName}
                  </span>
                ) : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-sm">
                {ov.is_closed ? (
                  <span className="text-muted-foreground">—</span>
                ) : nonvegName ? (
                  <span className="flex items-center gap-1">
                    <Drumstick className="h-3 w-3 text-red-500" />
                    {nonvegName}
                  </span>
                ) : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {ov.is_closed ? (
                  <Badge variant="destructive" className="text-xs">
                    <X className="h-3 w-3 mr-0.5" /> Closed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                    Overridden
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {ov.reason || '—'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(ov)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(ov._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Override</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this override? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteOverride.mutate(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </CardContent>
    </Card>
  );
}
