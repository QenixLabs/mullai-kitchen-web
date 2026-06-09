'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, Plus, Trash2, ChefHat, ListChecks, Clock, Flame, ArrowUpRight, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Can } from '@/components/Auth/can';
import { cn } from '@/lib/utils';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useIngredients } from '@/api/hooks/useInventory';
import type { CreateRecipePayload, Recipe } from '@/api/types/menu.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUploadField } from '@/components/admin/plans/ImageUploadField';

const ingredientSchema = z.object({
  ingredient_id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
});

const recipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  cuisine_type: z.string().optional(),
  difficulty: z.string().optional(),
  ingredients: z.array(ingredientSchema).optional(),
  prep_time: z.string().optional(),
  cook_time: z.string().optional(),
  servings: z.coerce.number().positive().optional().or(z.literal('')),
  instructions: z.array(z.object({ value: z.string() })).optional(),
  calories: z.coerce.number().positive().optional().or(z.literal('')),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  outlet_restriction: z.string().nullable().optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

function IngredientSelector({
  value,
  name,
  onSelect,
}: {
  value: string;
  name: string;
  onSelect: (id: string, name: string, unit: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  };

  const { data, isLoading, isError } = useIngredients({
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const ingredients = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full justify-between rounded-xl border-border/60 bg-white px-4 text-sm font-normal"
        >
          {name || 'Select ingredient'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 rounded-lg"
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive text-center">
              Failed to load ingredients
            </div>
          ) : ingredients.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No ingredients found
            </div>
          ) : (
            <div className="p-1">
              {ingredients.map((ing) => (
                <button
                  key={ing._id}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                    value === ing._id && 'bg-accent'
                  )}
                  onClick={() => {
                    onSelect(ing._id, ing.name, ing.default_unit);
                    setOpen(false);
                  }}
                >
                  {ing.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Recipe;
  onSubmit: (data: CreateRecipePayload) => Promise<void>;
}

export function RecipeForm({ mode, initialData, onSubmit }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: outletsData } = useOutlets({ status: 'active' });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      cuisine_type: initialData?.cuisine_type || '',
      difficulty: initialData?.difficulty || '',
      ingredients: initialData?.ingredients?.map((i) => ({ ...i, ingredient_id: i.ingredient_id || '' })) || [],
      prep_time: initialData?.cooking_details?.prep_time || '',
      cook_time: initialData?.cooking_details?.cook_time || '',
      servings: initialData?.cooking_details?.servings || ('' as any),
      instructions: initialData?.cooking_details?.instructions?.map((s) => ({ value: s })) || [],
      calories: initialData?.nutrition?.calories || ('' as any),
      protein: initialData?.nutrition?.protein || '',
      carbs: initialData?.nutrition?.carbs || '',
      image_url: initialData?.image_url || '',
      outlet_restriction: initialData?.outlet_restriction || null,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: 'instructions' });

  // Sync Select values when initialData changes (e.g. edit page async load)
  useEffect(() => {
    if (initialData) {
      if (initialData.difficulty) setValue('difficulty', initialData.difficulty);
      if (initialData.outlet_restriction) {
        setValue('outlet_restriction', initialData.outlet_restriction);
      } else if (initialData.outlet_restriction === null) {
        setValue('outlet_restriction', null);
      }
    }
  }, [initialData, setValue]);

  const difficultyValue = watch('difficulty') || '';
  const outletRestrictionValue = watch('outlet_restriction') || 'global';

  const handleFormSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const payload: CreateRecipePayload = {
        name: data.name,
        description: data.description || undefined,
        cuisine_type: data.cuisine_type || undefined,
        difficulty: data.difficulty || undefined,
        ingredients: data.ingredients
          ?.filter((i) => i.name)
          .map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, ingredient_id: i.ingredient_id || undefined })),
        cooking_details: {
          prep_time: data.prep_time || undefined,
          cook_time: data.cook_time || undefined,
          servings: data.servings ? Number(data.servings) : undefined,
          instructions: data.instructions?.map((i) => i.value).filter(Boolean),
        },
        nutrition: {
          calories: data.calories ? Number(data.calories) : undefined,
          protein: data.protein || undefined,
          carbs: data.carbs || undefined,
        },
        image_url: data.image_url || undefined,
        outlet_restriction: data.outlet_restriction || null,
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * 0 }}
        className="rounded-2xl bg-white border border-border/40 shadow-sm"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5">
              <ChefHat className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary">Basic Information</h3>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recipe Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter recipe name"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine_type" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                {...register('cuisine_type')}
                placeholder="e.g., South Indian, North Indian"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the recipe..."
              rows={3}
              className="rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Difficulty</Label>
              <Select
                value={difficultyValue}
                onValueChange={(v) => setValue('difficulty', v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outlet_restriction" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Outlet Restriction</Label>
              <Can permission="recipe:create:global">
                <Select
                  value={outletRestrictionValue}
                  onValueChange={(v) =>
                    setValue('outlet_restriction', v === 'global' ? null : v)
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (All Outlets)</SelectItem>
                    {(outletsData?.data || []).map((outlet) => (
                      <SelectItem key={outlet._id} value={outlet._id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Can>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recipe Image</Label>
            <ImageUploadField
              value={watch('image_url') || ''}
              onChange={(url) => setValue('image_url', url)}
            />
            {errors.image_url && (
              <p className="text-xs text-destructive">{errors.image_url.message}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ingredients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * 1 }}
        className="rounded-2xl bg-white border border-border/40 shadow-sm"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/5">
                <ListChecks className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-primary">Ingredients</h3>
            </div>
            <div className="flex items-center gap-2">
              <Can permission="inventory:view">
                <Link
                  href="/admin/inventory/ingredients"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Manage Ingredients
                </Link>
              </Can>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendIngredient({ ingredient_id: '', name: '', quantity: '', unit: '' })
                }
                className="rounded-full"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-3">
          {ingredientFields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ingredients added yet
            </p>
          )}
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex-1 space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ingredient</Label>
                <IngredientSelector
                  value={field.ingredient_id || ''}
                  name={field.name || ''}
                  onSelect={(id, n, unit) => {
                    setValue(`ingredients.${index}.ingredient_id`, id);
                    setValue(`ingredients.${index}.name`, n);
                    setValue(`ingredients.${index}.unit`, unit);
                  }}
                />
                <input type="hidden" {...register(`ingredients.${index}.name`)} />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Qty</Label>
                <Input
                  {...register(`ingredients.${index}.quantity`)}
                  placeholder="100"
                  className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
                <Input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="gms"
                  className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => removeIngredient(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cooking Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * 2 }}
        className="rounded-2xl bg-white border border-border/40 shadow-sm"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary">Cooking Details</h3>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="prep_time" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Prep Time</Label>
              <Input
                id="prep_time"
                {...register('prep_time')}
                placeholder="e.g., 15 mins"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cook_time" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cook Time</Label>
              <Input
                id="cook_time"
                {...register('cook_time')}
                placeholder="e.g., 30 mins"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Servings</Label>
              <Input
                id="servings"
                type="number"
                {...register('servings')}
                placeholder="4"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Instructions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendInstruction({ value: '' })}
                className="rounded-full"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Step
              </Button>
            </div>
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold mt-1">
                  {index + 1}
                </span>
                <Textarea
                  {...register(`instructions.${index}.value`)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                  className="flex-1 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 mt-1"
                  onClick={() => removeInstruction(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Nutrition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * 3 }}
        className="rounded-2xl bg-white border border-border/40 shadow-sm"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5">
              <Flame className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-primary">Nutrition</h3>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Calories</Label>
              <Input
                id="calories"
                type="number"
                {...register('calories')}
                placeholder="350"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Protein</Label>
              <Input
                id="protein"
                {...register('protein')}
                placeholder="e.g., 12g"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Carbs</Label>
              <Input
                id="carbs"
                {...register('carbs')}
                placeholder="e.g., 45g"
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 * 4 }}
        className="flex items-center justify-end gap-3"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/recipes')}
          className="rounded-full px-8 text-sm font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Recipe' : 'Update Recipe'}
        </Button>
      </motion.div>
    </form>
  );
}
