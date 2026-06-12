'use client';

import { useMemo, useState } from 'react';
import {
  Loader2,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  CalendarX2,
  Leaf,
  Drumstick,
  Trash2,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCreateOverride, useUpdateOverride, useDeleteOverride } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  date: string;
  mealType?: MealType;
  existing?: MealRosterOverride;
}

const MEAL_TYPES: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];

const MEAL_META: Record<MealType, { icon: React.ComponentType<{ className?: string }>; time: string }> = {
  [MealType.BREAKFAST]: { icon: Sun, time: '7–9 AM' },
  [MealType.LUNCH]: { icon: Sunset, time: '12–2 PM' },
  [MealType.DINNER]: { icon: Moon, time: '7–9 PM' },
};

const REASON_MAX = 200;

function formatDate(iso?: string) {
  if (!iso) return { full: '—', relative: null as string | null };
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return { full: iso, relative: null };
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const full = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  let relative: string | null = null;
  if (diffDays === 0) relative = 'Today';
  else if (diffDays === 1) relative = 'Tomorrow';
  else if (diffDays === -1) relative = 'Yesterday';
  else if (diffDays > 1 && diffDays <= 7) relative = `In ${diffDays} days`;
  else if (diffDays < -1 && diffDays >= -7) relative = `${Math.abs(diffDays)} days ago`;
  return { full, relative, diffDays };
}

export function OverrideDialog({
  open,
  onOpenChange,
  outletId,
  date,
  mealType: initialMealType,
  existing,
}: OverrideDialogProps) {
  return (
    <OverrideForm
      key={String(open)}
      open={open}
      onOpenChange={onOpenChange}
      outletId={outletId}
      date={date}
      initialMealType={initialMealType}
      existing={existing}
    />
  );
}

function OverrideForm({
  open,
  onOpenChange,
  outletId,
  date,
  initialMealType,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  date: string;
  initialMealType?: MealType;
  existing?: MealRosterOverride;
}) {
  const [mealType, setMealType] = useState<MealType>(initialMealType || existing?.meal_type || MealType.LUNCH);
  const [vegRecipeId, setVegRecipeId] = useState<string>(existing?.veg_recipe_id || '');
  const [nonvegRecipeId, setNonvegRecipeId] = useState<string>(existing?.nonveg_recipe_id || '');
  const [isClosed, setIsClosed] = useState(existing?.is_closed || false);
  const [reason, setReason] = useState(existing?.reason || '');

  const createOverride = useCreateOverride(outletId);
  const updateOverride = useUpdateOverride(outletId);
  const deleteOverride = useDeleteOverride(outletId);
  const { data: recipes } = useRecipeSelect(outletId);

  const isEditing = !!existing;
  const isSubmitting = createOverride.isPending || updateOverride.isPending;
  const isDeleting = deleteOverride.isPending;

  const dateInfo = useMemo(() => formatDate(date), [date]);

  const recipeOptions = recipes || [];
  const hasAnyRecipe =
    (vegRecipeId && vegRecipeId !== 'none') || (nonvegRecipeId && nonvegRecipeId !== 'none');
  const canSubmit = isClosed || hasAnyRecipe;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      date,
      meal_type: mealType,
      veg_recipe_id: vegRecipeId && vegRecipeId !== 'none' ? vegRecipeId : undefined,
      nonveg_recipe_id: nonvegRecipeId && nonvegRecipeId !== 'none' ? nonvegRecipeId : undefined,
      is_closed: isClosed,
      reason: reason.trim() || undefined,
    };

    if (isEditing && existing) {
      updateOverride.mutate(
        { id: existing._id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createOverride.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const handleDelete = () => {
    if (existing) {
      deleteOverride.mutate(existing._id, { onSuccess: () => onOpenChange(false) });
    }
  };

  const reasonRemaining = REASON_MAX - reason.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:!max-w-[520px]">
        {/* Header strip */}
        <div className="border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-6 py-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
                  isClosed
                    ? 'bg-rose-50 text-rose-600 ring-rose-100'
                    : 'bg-amber-50 text-amber-600 ring-amber-100',
                )}
              >
                {isClosed ? <CalendarX2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {isEditing ? 'Edit Override' : 'Add Override'}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">{dateInfo.full}</span>
                  {dateInfo.relative && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-4 border-0 px-1.5 text-[10px] font-semibold uppercase tracking-wider',
                        dateInfo.diffDays === 0
                          ? 'bg-primary/10 text-primary'
                          : dateInfo.diffDays !== undefined && dateInfo.diffDays < 0
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-success/15 text-success',
                      )}
                    >
                      {dateInfo.relative}
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Meal type segmented */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Meal slot
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map((mt) => {
                const Icon = MEAL_META[mt].icon;
                const isActive = mealType === mt;
                return (
                  <button
                    key={mt}
                    type="button"
                    disabled={isEditing}
                    onClick={() => setMealType(mt)}
                    className={cn(
                      'group flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 transition-all',
                      isActive
                        ? 'border-primary/40 bg-primary/[0.06] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
                        : 'border-border/70 bg-background hover:border-border hover:bg-muted/40',
                      isEditing && !isActive && 'opacity-40',
                      isEditing && 'cursor-not-allowed',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {mt}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {MEAL_META[mt].time}
                    </span>
                  </button>
                );
              })}
            </div>
            {isEditing && (
              <p className="text-[11px] text-muted-foreground">Meal slot can&apos;t change while editing.</p>
            )}
          </div>

          {/* Mode segmented (Special vs Closed) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Override type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsClosed(false)}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all',
                  !isClosed
                    ? 'border-amber-300 bg-amber-50/60 shadow-[inset_0_0_0_1px_rgb(252_211_77_/_0.5)]'
                    : 'border-border/70 bg-background hover:border-border hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
                    !isClosed
                      ? 'bg-amber-100 text-amber-700 ring-amber-200'
                      : 'bg-muted text-muted-foreground ring-border',
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      !isClosed ? 'text-amber-900' : 'text-foreground',
                    )}
                  >
                    Special menu
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Replace default recipes for this slot.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsClosed(true)}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all',
                  isClosed
                    ? 'border-rose-300 bg-rose-50/60 shadow-[inset_0_0_0_1px_rgb(252_165_165_/_0.5)]'
                    : 'border-border/70 bg-background hover:border-border hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
                    isClosed
                      ? 'bg-rose-100 text-rose-700 ring-rose-200'
                      : 'bg-muted text-muted-foreground ring-border',
                  )}
                >
                  <CalendarX2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isClosed ? 'text-rose-900' : 'text-foreground',
                    )}
                  >
                    Closed
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    No service for this meal.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional content */}
          {isClosed ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200/70 bg-rose-50/40 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="text-[12px] text-rose-900">
                Customers won&apos;t see {mealType.toLowerCase()} on this day. Existing orders
                stay intact &mdash; no new orders can be placed.
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Leaf className="h-3 w-3 text-emerald-600" />
                  Veg recipe
                </Label>
                <Select value={vegRecipeId} onValueChange={setVegRecipeId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select veg recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {recipeOptions.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Drumstick className="h-3 w-3 text-rose-600" />
                  Non-Veg recipe
                </Label>
                <Select value={nonvegRecipeId} onValueChange={setNonvegRecipeId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select non-veg recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {recipeOptions.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!hasAnyRecipe && (
                <p className="col-span-full -mt-0.5 text-[11px] text-muted-foreground">
                  Pick at least one recipe to save a special menu.
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Reason */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label
                htmlFor="reason"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Reason <span className="font-normal lowercase tracking-normal text-muted-foreground/70">(optional)</span>
              </Label>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  reasonRemaining < 0
                    ? 'text-destructive'
                    : reasonRemaining < 30
                      ? 'text-amber-600'
                      : 'text-muted-foreground',
                )}
              >
                {reasonRemaining}
              </span>
            </div>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
              placeholder={
                isClosed
                  ? 'e.g., Public holiday, kitchen maintenance...'
                  : 'e.g., Festival special, chef recommendation...'
              }
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center gap-2 border-t border-border/70 bg-muted/20 px-6 py-3">
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="h-9 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9"
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isDeleting || !canSubmit}
            className="h-9 min-w-[96px]"
          >
            {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {isEditing ? 'Save changes' : isClosed ? 'Add closure' : 'Add menu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
