'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Leaf,
  Drumstick,
  CalendarClock,
  Radio,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  X,
  Pencil,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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

const MEAL_META: Record<MealType, {
  icon: React.ComponentType<{ className?: string }>;
  time: string;
  iconBg: string;
  accent: string;
  ring: string;
}> = {
  [MealType.BREAKFAST]: {
    icon: Sun,
    time: '7–9 AM',
    iconBg: 'bg-amber-50 text-amber-600 ring-amber-100',
    accent: 'from-amber-50/80 to-transparent',
    ring: 'ring-amber-100',
  },
  [MealType.LUNCH]: {
    icon: Sunset,
    time: '12–2 PM',
    iconBg: 'bg-orange-50 text-orange-600 ring-orange-100',
    accent: 'from-orange-50/80 to-transparent',
    ring: 'ring-orange-100',
  },
  [MealType.DINNER]: {
    icon: Moon,
    time: '7–9 PM',
    iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    accent: 'from-indigo-50/80 to-transparent',
    ring: 'ring-indigo-100',
  },
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
  const meta = MEAL_META[mealType];
  const MealIcon = meta.icon;

  const recipeOptions = recipes || [];
  const hasAnyRecipe = (vegRecipeId && vegRecipeId !== 'none') || (nonvegRecipeId && nonvegRecipeId !== 'none');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden border-border/70 p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Header band */}
        <div className={cn('relative bg-gradient-to-br px-6 pb-5 pt-6', meta.accent)}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <span
              className={cn(
                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1',
                meta.iconBg,
              )}
            >
              <MealIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold leading-tight tracking-tight text-foreground">
                  {isEditing ? 'Edit Meal Slot' : 'Add Meal Slot'}
                </DialogTitle>
                {isEditing && existing?.is_published && (
                  <Badge
                    variant="secondary"
                    className="h-5 gap-1 border-0 bg-success/15 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-success"
                  >
                    <span className="h-1 w-1 rounded-full bg-success" />
                    Live
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{DAY_LABELS[dayOfWeek]}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-medium text-foreground/80">{mealType}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" />
                  {meta.time}
                </span>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Recipe pickers — side by side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recipes
              </Label>
              {hasAnyRecipe ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  At least one recipe selected
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Choose Veg, Non-Veg, or both</span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <RecipeSelectCard
                tone="veg"
                icon={<Leaf className="h-3.5 w-3.5" />}
                label="Veg Recipe"
                value={vegRecipeId}
                onChange={setVegRecipeId}
                recipes={recipeOptions}
                placeholder="Select veg recipe"
              />
              <RecipeSelectCard
                tone="nonveg"
                icon={<Drumstick className="h-3.5 w-3.5" />}
                label="Non-Veg Recipe"
                value={nonvegRecipeId}
                onChange={setNonvegRecipeId}
                recipes={recipeOptions}
                placeholder="Select non-veg recipe"
              />
            </div>
          </div>

          {/* Effective Until */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="effective_until"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Effective Until
              </Label>
              <span className="text-[11px] text-muted-foreground">Optional</span>
            </div>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="effective_until"
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Leave empty to keep this slot active indefinitely.
            </p>
          </div>

          {/* Publish toggle */}
          <div
            className={cn(
              'flex items-start justify-between gap-3 rounded-lg border p-3.5 transition-colors',
              isPublished
                ? 'border-success/30 bg-success/[0.06]'
                : 'border-border/70 bg-muted/30',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
                  isPublished
                    ? 'bg-success/15 text-success ring-success/20'
                    : 'bg-muted text-muted-foreground ring-border/70',
                )}
              >
                <Radio className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <Label htmlFor="is_published" className="text-sm font-semibold text-foreground">
                  {isPublished ? 'Published — Live to customers' : 'Draft — Not visible'}
                </Label>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {isPublished
                    ? 'This slot will appear in the active menu for the effective range.'
                    : 'Save without publishing. You can publish it any time later.'}
                </p>
              </div>
            </div>
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              className="mt-1"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-6 py-3.5 sm:justify-between">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Week starting <span className="font-medium text-foreground/80">{effectiveFrom}</span>
          </p>
          <div className="flex flex-1 justify-end gap-2 sm:flex-none">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
              className="h-9 min-w-[110px] gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isEditing ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {isEditing ? 'Save Changes' : 'Create Slot'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RecipeSelectCardProps {
  tone: 'veg' | 'nonveg';
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  recipes: { _id: string; name: string }[];
  placeholder: string;
}

function RecipeSelectCard({
  tone, icon, label, value, onChange, recipes, placeholder,
}: RecipeSelectCardProps) {
  const isSelected = !!value && value !== 'none';

  const tones = {
    veg: {
      base: 'bg-emerald-50/40 ring-emerald-100',
      selected: 'bg-emerald-50 ring-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      label: 'text-emerald-900',
    },
    nonveg: {
      base: 'bg-rose-50/40 ring-rose-100',
      selected: 'bg-rose-50 ring-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
      label: 'text-rose-900',
    },
  } as const;

  const t = tones[tone];

  return (
    <div
      className={cn(
        'space-y-2 rounded-lg p-3 ring-1 transition-colors',
        isSelected ? t.selected : t.base,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-md', t.iconBg)}>
          {icon}
        </span>
        <span className={cn('text-[11px] font-semibold uppercase tracking-wider', t.label)}>
          {label}
        </span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 border-white/70 bg-white text-sm shadow-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {recipes.map((r) => (
            <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
