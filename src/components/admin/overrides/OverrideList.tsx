'use client';

import { useMemo, useState } from 'react';
import {
  Leaf,
  Drumstick,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CalendarOff,
  Calendar,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useOverrides, useDeleteOverride } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

const MEAL_META: Record<MealType, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  [MealType.BREAKFAST]: { icon: Sun, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
  [MealType.LUNCH]: { icon: Sunset, tone: 'bg-orange-50 text-orange-700 ring-orange-100' },
  [MealType.DINNER]: { icon: Moon, tone: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
};

interface OverrideListProps {
  outletId: string;
  dateFrom: string;
  dateUntil: string;
  onEdit: (override: MealRosterOverride) => void;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const dateOnly = iso.split('T')[0];
  const [y, m, d] = dateOnly.split('-').map(Number);
  if (!y || !m || !d) return dateOnly;
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const dateLabel = date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  let relative: string | null = null;
  if (diffDays === 0) relative = 'Today';
  else if (diffDays === 1) relative = 'Tomorrow';
  else if (diffDays === -1) relative = 'Yesterday';
  else if (diffDays > 1 && diffDays <= 7) relative = `In ${diffDays}d`;
  else if (diffDays < -1 && diffDays >= -7) relative = `${Math.abs(diffDays)}d ago`;
  return { dateLabel, relative, diffDays };
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

  const overrides = useMemo(() => {
    const list = overridesData?.data || [];
    return [...list].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [overridesData]);

  if (isLoading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (overrides.length === 0) {
    return (
      <Card className="border-dashed border-border/70">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <CalendarOff className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No overrides for this period</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click <span className="font-medium text-foreground">Add Override</span> to schedule closures or special menus.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 hover:bg-muted/40">
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meal
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recipes
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Reason
              </TableHead>
              <TableHead className="h-10 w-10 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map((ov, idx) => {
              const formatted = formatDate(ov.date);
              const isPast =
                typeof formatted === 'object' && formatted.diffDays !== undefined && formatted.diffDays < 0;
              const isToday =
                typeof formatted === 'object' && formatted.diffDays === 0;
              const meta = MEAL_META[ov.meal_type] || MEAL_META[MealType.LUNCH];
              const Icon = meta.icon;
              const vegName = getRecipeName(ov.veg_recipe_id);
              const nonvegName = getRecipeName(ov.nonveg_recipe_id);
              const isLast = idx === overrides.length - 1;

              return (
                <TableRow
                  key={ov._id}
                  className={cn(
                    'transition-colors hover:bg-accent/20',
                    isPast && 'opacity-70',
                    isToday && 'bg-primary/[0.04]',
                    !isLast && 'border-b border-border/50',
                  )}
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-foreground">
                          {typeof formatted === 'object' ? formatted.dateLabel : formatted}
                        </p>
                        {typeof formatted === 'object' && formatted.relative && (
                          <p
                            className={cn(
                              'text-[11px] font-medium leading-tight',
                              isToday ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {formatted.relative}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1',
                        meta.tone,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {ov.meal_type}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {ov.is_closed ? (
                      <Badge
                        variant="secondary"
                        className="h-6 gap-1 border-0 bg-rose-50 px-2 text-[11px] font-semibold uppercase tracking-wide text-rose-700 ring-1 ring-rose-100"
                      >
                        <X className="h-3 w-3" />
                        Closed
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="h-6 gap-1 border-0 bg-amber-50 px-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100"
                      >
                        <Sparkles className="h-3 w-3" />
                        Special
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {ov.is_closed ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {vegName && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900 ring-1 ring-emerald-100">
                            <Leaf className="h-3 w-3 text-emerald-600" />
                            {vegName}
                          </span>
                        )}
                        {nonvegName && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-900 ring-1 ring-rose-100">
                            <Drumstick className="h-3 w-3 text-rose-600" />
                            {nonvegName}
                          </span>
                        )}
                        {!vegName && !nonvegName && (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] px-4 py-3">
                    {ov.reason ? (
                      <p className="truncate text-sm text-foreground/80" title={ov.reason}>
                        {ov.reason}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => onEdit(ov)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(ov._id)}
                          className="text-destructive focus:text-destructive"
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

        <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{overrides.length}</span> override
            {overrides.length === 1 ? '' : 's'} this period
          </span>
          <span className="hidden sm:inline">Past entries shown faded · Today highlighted</span>
        </div>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent className="min-w-[360px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this override?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the date-specific change. The default schedule will apply for that day.
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
