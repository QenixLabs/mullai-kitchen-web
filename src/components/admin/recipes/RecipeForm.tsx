'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, Plus, Trash2, ChefHat, ListChecks, Clock, Flame, ArrowUpRight, Save } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Can } from '@/components/Auth/can';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useIngredients, useCreateIngredient } from '@/api/hooks/useInventory';
import type { CreateRecipePayload, Recipe } from '@/api/types/menu.types';
import type { CreateIngredientPayload } from '@/api/admin-inventory.api';

const ingredientSchema = z.object({
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

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Recipe;
  onSubmit: (data: CreateRecipePayload) => Promise<void>;
}

const CATEGORIES = [
  'Dals & Pulses',
  'Rice & Grains',
  'Vegetables',
  'Non-Veg',
  'Spices & Condiments',
  'Dairy',
  'Dry Fruits & Nuts',
  'Oils',
  'Other',
];

const UNITS = ['KG', 'G', 'L', 'ML', 'PCS', 'DOZEN', 'PACKET', 'BOTTLE', 'BUNCH'];

export function RecipeForm({ mode, initialData, onSubmit }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddIngredientDialog, setShowAddIngredientDialog] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientCategory, setNewIngredientCategory] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');

  const { data: outletsData } = useOutlets({ status: 'active' });
  const { data: ingredientsData, refetch: refetchIngredients } = useIngredients({ limit: 500 });
  const createIngredient = useCreateIngredient();

  const inventoryIngredients = ingredientsData?.data ?? [];

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
      ingredients: initialData?.ingredients || [],
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

  const handleAddNewIngredient = () => {
    if (!newIngredientName.trim() || !newIngredientCategory || !newIngredientUnit) return;
    const payload: CreateIngredientPayload = {
      name: newIngredientName.trim(),
      category: newIngredientCategory,
      default_unit: newIngredientUnit,
      status: 'ACTIVE',
    };
    createIngredient.mutate(payload, {
      onSuccess: () => {
        setShowAddIngredientDialog(false);
        setNewIngredientName('');
        setNewIngredientCategory('');
        setNewIngredientUnit('');
        refetchIngredients();
      },
    });
  };

  const handleFormSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const payload: CreateRecipePayload = {
        name: data.name,
        description: data.description || undefined,
        cuisine_type: data.cuisine_type || undefined,
        difficulty: data.difficulty || undefined,
        ingredients: data.ingredients?.filter((i) => i.name),
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
              <Label htmlFor="image_url" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Image URL</Label>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://..."
                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
              {errors.image_url && (
                <p className="text-xs text-destructive">
                  {errors.image_url.message}
                </p>
              )}
            </div>
          </div>
          <Can permission="recipe:create:global">
            <div className="space-y-2">
              <Label htmlFor="outlet_restriction" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Outlet Restriction</Label>
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
            </div>
          </Can>
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
              {mode === 'edit' && initialData?._id && (
                <Can permission="inventory:manage">
                  <Link
                    href={`/admin/recipes/${initialData._id}/ingredients`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Manage BOM
                  </Link>
                </Can>
              )}
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
                  appendIngredient({ name: '', quantity: '', unit: '' })
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
              <div className="flex-1 space-y-1 min-w-0">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
                <Controller
                  control={control}
                  name={`ingredients.${index}.name`}
                  render={({ field: selectField }) => {
                    return (
                      <Select
                        value={selectField.value}
                        onValueChange={(val) => {
                          if (val === '__add_new__') {
                            setShowAddIngredientDialog(true);
                            return;
                          }
                          selectField.onChange(val);
                          const ing = inventoryIngredients.find((i) => i.name === val);
                          if (ing?.default_unit) {
                            setValue(`ingredients.${index}.unit`, ing.default_unit);
                          }
                        }}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryIngredients.map((ing) => (
                            <SelectItem key={ing._id} value={ing.name}>
                              {ing.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-primary font-semibold">
                            + Add New Ingredient
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Qty</Label>
                <Input
                  {...register(`ingredients.${index}.quantity`)}
                  placeholder="100"
                  className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
                <Controller
                  control={control}
                  name={`ingredients.${index}.unit`}
                  render={({ field: unitField }) => (
                    <Select
                      value={unitField.value}
                      onValueChange={unitField.onChange}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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

      {/* Add New Ingredient Dialog */}
      <Dialog open={showAddIngredientDialog} onOpenChange={setShowAddIngredientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Ingredient</DialogTitle>
            <DialogDescription>
              Create a new ingredient in the inventory catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name *</Label>
              <Input
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                placeholder="e.g., Basmati Rice"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
              <Select value={newIngredientCategory} onValueChange={setNewIngredientCategory}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Unit *</Label>
              <Select value={newIngredientUnit} onValueChange={setNewIngredientUnit}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddIngredientDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createIngredient.isPending || !newIngredientName.trim() || !newIngredientCategory || !newIngredientUnit}
              onClick={handleAddNewIngredient}
              className="rounded-full bg-primary text-white hover:bg-primary/90"
            >
              {createIngredient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
