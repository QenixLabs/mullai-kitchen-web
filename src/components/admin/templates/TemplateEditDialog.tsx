'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCreateTemplate, useUpdateTemplate } from '@/api/hooks/useTemplates';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { WeekDay, MealType } from '@/api/types/menu.types';
import type { WeeklyMealTemplate } from '@/api/types/menu.types';

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  dayOfWeek: WeekDay;
  mealType: MealType;
  effectiveFrom: string;
  existing?: WeeklyMealTemplate;
}

const DAY_LABELS: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: 'Monday', [WeekDay.TUESDAY]: 'Tuesday', [WeekDay.WEDNESDAY]: 'Wednesday',
  [WeekDay.THURSDAY]: 'Thursday', [WeekDay.FRIDAY]: 'Friday', [WeekDay.SATURDAY]: 'Saturday', [WeekDay.SUNDAY]: 'Sunday',
};

export function TemplateEditDialog({
  open, onOpenChange, outletId, dayOfWeek, mealType, effectiveFrom, existing,
}: TemplateEditDialogProps) {
  const [vegRecipeId, setVegRecipeId] = useState<string>('');
  const [nonvegRecipeId, setNonvegRecipeId] = useState<string>('');
  const [effectiveUntil, setEffectiveUntil] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const createTemplate = useCreateTemplate(outletId);
  const updateTemplate = useUpdateTemplate(outletId);
  const { data: recipes } = useRecipeSelect(outletId);

  const isEditing = !!existing;
  const isSubmitting = createTemplate.isPending || updateTemplate.isPending;

  // Reset form when dialog opens or template changes
  useEffect(() => {
    if (open) {
      setVegRecipeId(existing?.veg_recipe_id || '');
      setNonvegRecipeId(existing?.nonveg_recipe_id || '');
      setEffectiveUntil(existing?.effective_until ? existing.effective_until.split('T')[0] : '');
      setIsPublished(existing?.is_published || false);
    }
  }, [open, existing]);

  const handleSubmit = async () => {
    const payload = {
      day_of_week: dayOfWeek,
      meal_type: mealType,
      veg_recipe_id: vegRecipeId && vegRecipeId !== 'none' ? vegRecipeId : undefined,
      nonveg_recipe_id: nonvegRecipeId && nonvegRecipeId !== 'none' ? nonvegRecipeId : undefined,
      effective_from: effectiveFrom,
      effective_until: effectiveUntil || undefined,
      is_published: isPublished,
    };

    if (isEditing && existing) {
      updateTemplate.mutate(
        { id: existing._id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createTemplate.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const recipeOptions = recipes || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Add Template'}</DialogTitle>
          <DialogDescription>
            {DAY_LABELS[dayOfWeek]} — {mealType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Veg Recipe</Label>
            <Select value={vegRecipeId} onValueChange={setVegRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select veg recipe" />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Select non-veg recipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {recipeOptions.map((r) => (
                  <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_until">Effective Until (optional)</Label>
            <Input
              id="effective_until"
              type="date"
              value={effectiveUntil}
              onChange={(e) => setEffectiveUntil(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_published">Published</Label>
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
