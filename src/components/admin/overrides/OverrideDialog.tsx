'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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

export function OverrideDialog({
  open, onOpenChange, outletId, date, mealType: initialMealType, existing,
}: OverrideDialogProps) {
  const [mealType, setMealType] = useState<MealType>(initialMealType || MealType.LUNCH);
  const [vegRecipeId, setVegRecipeId] = useState<string>('');
  const [nonvegRecipeId, setNonvegRecipeId] = useState<string>('');
  const [isClosed, setIsClosed] = useState(false);
  const [reason, setReason] = useState('');

  const createOverride = useCreateOverride(outletId);
  const updateOverride = useUpdateOverride(outletId);
  const deleteOverride = useDeleteOverride(outletId);
  const { data: recipes } = useRecipeSelect(outletId);

  const isEditing = !!existing;
  const isSubmitting = createOverride.isPending || updateOverride.isPending;

  useEffect(() => {
    if (open) {
      setMealType(initialMealType || existing?.meal_type || MealType.LUNCH);
      setVegRecipeId(existing?.veg_recipe_id || '');
      setNonvegRecipeId(existing?.nonveg_recipe_id || '');
      setIsClosed(existing?.is_closed || false);
      setReason(existing?.reason || '');
    }
  }, [open, existing, initialMealType]);

  const handleSubmit = () => {
    const payload = {
      date,
      meal_type: mealType,
      veg_recipe_id: vegRecipeId && vegRecipeId !== 'none' ? vegRecipeId : undefined,
      nonveg_recipe_id: nonvegRecipeId && nonvegRecipeId !== 'none' ? nonvegRecipeId : undefined,
      is_closed: isClosed,
      reason: reason || undefined,
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

  const recipeOptions = recipes || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Override' : 'Add Override'}</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((mt) => (
                  <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_closed">Close this meal</Label>
            <Switch id="is_closed" checked={isClosed} onCheckedChange={setIsClosed} />
          </div>

          {!isClosed && (
            <>
              <div className="space-y-2">
                <Label>Veg Recipe</Label>
                <Select value={vegRecipeId} onValueChange={setVegRecipeId}>
                  <SelectTrigger><SelectValue placeholder="Select veg recipe" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {recipeOptions.map((r) => (
                      <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Non-Veg Recipe</Label>
                <Select value={nonvegRecipeId} onValueChange={setNonvegRecipeId}>
                  <SelectTrigger><SelectValue placeholder="Select non-veg recipe" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {recipeOptions.map((r) => (
                      <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Holiday, kitchen maintenance..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteOverride.isPending}>
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
