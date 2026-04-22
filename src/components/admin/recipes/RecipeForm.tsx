'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, Plus, Trash2, ChefHat, ListChecks, Clock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/Auth/can';
import { useOutlets } from '@/api/hooks/useOutlets';
import type { CreateRecipePayload, Recipe } from '@/api/types/menu.types';
import { RecipeStatus } from '@/api/types/menu.types';

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
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

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
<<<<<<< HEAD
      ingredients: initialData?.ingredients || [],
      prep_time: initialData?.cooking_details?.prep_time || '',
      cook_time: initialData?.cooking_details?.cook_time || '',
      servings: initialData?.cooking_details?.servings || ('' as any),
=======
      ingredients: initialData?.ingredients?.length ? initialData.ingredients : [],
>>>>>>> 831ebf2 (admin pages ui changes)
      instructions: initialData?.cooking_details?.instructions?.map((s) => ({ value: s })) || [],
      calories: initialData?.nutrition?.calories || ('' as any),
      protein: initialData?.nutrition?.protein || '',
      carbs: initialData?.nutrition?.carbs || '',
      image_url: initialData?.image_url || '',
      outlet_restriction: initialData?.outlet_restriction || null,
      status: initialData?.status || 'draft',
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
      if (initialData.status) setValue('status', initialData.status);
    }
  }, [initialData, setValue]);

  const difficultyValue = watch('difficulty') || '';
  const outletRestrictionValue = watch('outlet_restriction') || 'global';
  const statusValue = watch('status') || 'draft';
  const imageUrlValue = watch('image_url') || '';

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

  const inputClass =
    'h-11 rounded-lg border-[rgba(219,192,193,0.3)] bg-[#f8f2f3] px-4 text-sm text-[#44151c] placeholder:text-[#554243]/50 transition-colors focus-visible:border-[#44151c] focus-visible:ring-[#44151c]/20';
  const labelClass =
    'text-[11px] font-bold uppercase tracking-wider text-[#554243]';

  return (
<<<<<<< HEAD
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Top Row: Title + Status Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h1
          className="text-4xl font-extrabold uppercase tracking-tight text-[#44151c]"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.9px', lineHeight: '40px' }}
        >
          Recipes
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#554243]">Status</span>
          <Switch
            checked={statusValue === 'published'}
            onCheckedChange={(checked) =>
              setValue('status', checked ? 'published' : 'draft')
            }
            className="data-[state=checked]:bg-[#44151c]"
          />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              statusValue === 'published' ? 'text-[#44151c]' : 'text-[#554243]/60'
            }`}
          >
            {statusValue === 'published' ? 'Active' : 'Draft'}
          </span>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Basic Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-xl bg-white border border-[rgba(219,192,193,0.2)] shadow-sm p-6 md:p-8 space-y-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#f8f2f3]">
              <ChefHat className="h-4 w-4 text-[#44151c]" />
=======
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6"
    >
      {/* Status Toggle */}
      <div className="flex items-center justify-end gap-3"
      >
        <span className="text-sm text-muted-foreground"
        >Status:</span>
        <Switch
          checked={isActive}
          onCheckedChange={(v) => setValue('is_active', v)}
        />
        <span
          className={cn(
            'text-sm font-bold uppercase tracking-wider',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5"
      >
        {/* Left Column */}
        <div className="space-y-5"
        >
          {/* Basic Details */}
          <div className="bg-white rounded-xl border border-border/40 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-5"
            >
              <UtensilsCrossed className="h-4 w-4 text-foreground" />
              <h3 className="text-sm font-bold text-foreground"
              >
                Basic Details
              </h3>
>>>>>>> 831ebf2 (admin pages ui changes)
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#44151c]">
              Basic Details
            </h3>
          </div>

<<<<<<< HEAD
          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Recipe Name *
            </Label>
            <Input id="name" {...register('name')} placeholder="Enter recipe name" className={inputClass} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={labelClass}>
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the recipe..."
              rows={3}
              className="rounded-lg border-[rgba(219,192,193,0.3)] bg-[#f8f2f3] px-4 text-sm text-[#44151c] placeholder:text-[#554243]/50 transition-colors focus-visible:border-[#44151c] focus-visible:ring-[#44151c]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="cuisine_type" className={labelClass}>
                Category
              </Label>
              <Input
                id="cuisine_type"
                {...register('cuisine_type')}
                placeholder="e.g., Mediterranean"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty" className={labelClass}>
                Cuisine Type
              </Label>
              <Select value={difficultyValue} onValueChange={(v) => setValue('difficulty', v)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Can permission="recipe:create:global">
            <div className="space-y-2">
              <Label htmlFor="outlet_restriction" className={labelClass}>
                Outlet Restriction
              </Label>
              <Select
                value={outletRestrictionValue}
                onValueChange={(v) => setValue('outlet_restriction', v === 'global' ? null : v)}
              >
                <SelectTrigger className={inputClass}>
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
        </motion.div>

        {/* Right: Image + Preparation */}
        <div className="space-y-8">
          {/* Image Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl bg-white border border-[rgba(219,192,193,0.2)] shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#f8f2f3]">
                <Upload className="h-4 w-4 text-[#44151c]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#44151c]">
                Recipe Image
              </h3>
            </div>

            {imageUrlValue ? (
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img src={imageUrlValue} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setValue('image_url', '')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(219,192,193,0.4)] bg-[#f8f2f3] p-8 mb-4">
                <Upload className="h-8 w-8 text-[#554243]/40 mb-2" />
                <p className="text-sm text-[#554243]">Paste an image URL below</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image_url" className={labelClass}>
                Image URL
              </Label>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://..."
                className={inputClass}
              />
              {errors.image_url && <p className="text-xs text-red-600">{errors.image_url.message}</p>}
            </div>
          </motion.div>

          {/* Preparation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-xl bg-white border border-[rgba(219,192,193,0.2)] shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#f8f2f3]">
                  <Clock className="h-4 w-4 text-[#44151c]" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#44151c]">
                  Preparation
=======
            <div className="space-y-5"
            >
              {/* Recipe Name */}
              <div className="space-y-2"
              >
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Recipe Name
                </Label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Pan-Seared Chilean Sea Bass"
                  className="h-11 rounded-lg border-border/40 bg-muted/30 px-4 text-sm focus-visible:border-primary focus-visible:ring-primary/20"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2"
              >
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Description
                </Label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the flavor profile and presentation guidelines..."
                  rows={3}
                  className="rounded-lg border-border/40 bg-muted/30 px-4 text-sm resize-none focus-visible:border-primary focus-visible:ring-primary/20"
                />
              </div>

              {/* Category + Cuisine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="space-y-2"
                >
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Category
                  </Label>
                  <Select
                    value={watch('difficulty') || ''}
                    onValueChange={(v) => setValue('difficulty', v)}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-border/40 bg-muted/30 text-sm"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"
                >
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Cuisine Type
                  </Label>
                  <Select
                    value={watch('cuisine_type') || ''}
                    onValueChange={(v) => setValue('cuisine_type', v)}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-border/40 bg-muted/30 text-sm"
                    >
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="bg-white rounded-xl border border-border/40 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-5"
            >
              <div className="flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground"
                >
                  Ingredients List
>>>>>>> 831ebf2 (admin pages ui changes)
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
<<<<<<< HEAD
                onClick={() => appendInstruction({ value: '' })}
                className="rounded-full border-[rgba(219,192,193,0.3)] text-[#44151c] hover:bg-[#f8f2f3]"
=======
                onClick={() => appendIngredient({ name: '', quantity: '', unit: 'Grams' })}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 h-8"
>>>>>>> 831ebf2 (admin pages ui changes)
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Step
              </Button>
            </div>

<<<<<<< HEAD
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              <div className="space-y-2">
                <Label htmlFor="prep_time" className={labelClass}>
                  Prep Time
                </Label>
                <Input
                  id="prep_time"
                  {...register('prep_time')}
                  placeholder="e.g., 15 mins"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cook_time" className={labelClass}>
                  Cook Time
                </Label>
                <Input
                  id="cook_time"
                  {...register('cook_time')}
                  placeholder="e.g., 30 mins"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings" className={labelClass}>
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  {...register('servings')}
                  placeholder="4"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-4">
              {instructionFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#44151c] text-white text-xs flex items-center justify-center font-bold mt-1">
                    {index + 1}
                  </span>
                  <Textarea
                    {...register(`instructions.${index}.value`)}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                    className="flex-1 rounded-lg border-[rgba(219,192,193,0.3)] bg-[#f8f2f3] px-4 text-sm text-[#44151c] placeholder:text-[#554243]/50 transition-colors focus-visible:border-[#44151c] focus-visible:ring-[#44151c]/20"
=======
            <div className="space-y-3"
            >
              {ingredientFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4"
                >
                  No ingredients added yet. Click &quot;Add Row&quot; to start.
                </p>
              )}
              {ingredientFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30"
                >
                  <Input
                    {...register(`ingredients.${index}.quantity`)}
                    placeholder="200"
                    className="w-16 h-9 rounded-md border-border/40 bg-white text-sm text-center px-2"
                  />
                  <Select
                    value={watch(`ingredients.${index}.unit`) || 'Grams'}
                    onValueChange={(v) => setValue(`ingredients.${index}.unit`, v)}
                  >
                    <SelectTrigger className="w-28 h-9 rounded-md border-border/40 bg-white text-sm px-2"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    {...register(`ingredients.${index}.name`)}
                    placeholder="Chilean Sea Bass Fillet"
                    className="flex-1 h-9 rounded-md border-border/40 bg-white text-sm px-3"
>>>>>>> 831ebf2 (admin pages ui changes)
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
<<<<<<< HEAD
                    className="h-9 w-9 shrink-0 mt-1 rounded-full hover:bg-red-50 text-red-600"
                    onClick={() => removeInstruction(index)}
=======
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeIngredient(index)}
>>>>>>> 831ebf2 (admin pages ui changes)
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
<<<<<<< HEAD
              {instructionFields.length === 0 && (
                <p className="text-sm text-[#554243]/60 text-center py-4">
                  No steps added yet. Click "Add Step" to begin.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ingredients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl bg-white border border-[rgba(219,192,193,0.2)] shadow-sm p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#f8f2f3]">
              <ListChecks className="h-4 w-4 text-[#44151c]" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#44151c]">
              Ingredients List
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
            className="rounded-full border-[rgba(219,192,193,0.3)] text-[#44151c] hover:bg-[#f8f2f3]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Row
          </Button>
        </div>

        <div className="space-y-3">
          {ingredientFields.length === 0 && (
            <p className="text-sm text-[#554243]/60 text-center py-4">
              No ingredients added yet. Click "Add Row" to begin.
            </p>
          )}
          {ingredientFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-3 p-4 rounded-xl bg-[#f8f2f3] border border-[rgba(219,192,193,0.15)]"
            >
              <div className="flex-1 space-y-1.5">
                <Label className={labelClass}>Name</Label>
                <Input
                  {...register(`ingredients.${index}.name`)}
                  placeholder="Ingredient name"
                  className={inputClass}
                />
              </div>
              <div className="w-28 space-y-1.5">
                <Label className={labelClass}>Qty</Label>
                <Input
                  {...register(`ingredients.${index}.quantity`)}
                  placeholder="100"
                  className={inputClass}
                />
              </div>
              <div className="w-28 space-y-1.5">
                <Label className={labelClass}>Unit</Label>
                <Input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="gms"
                  className={inputClass}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full hover:bg-red-50 text-red-600"
                onClick={() => removeIngredient(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Nutrition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-xl bg-white border border-[rgba(219,192,193,0.2)] shadow-sm p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#f8f2f3]">
            <ChefHat className="h-4 w-4 text-[#44151c]" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#44151c]">
            Nutrition
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="calories" className={labelClass}>
              Calories
            </Label>
            <Input id="calories" type="number" {...register('calories')} placeholder="350" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein" className={labelClass}>
              Protein
            </Label>
            <Input id="protein" {...register('protein')} placeholder="e.g., 12g" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs" className={labelClass}>
              Carbs
            </Label>
            <Input id="carbs" {...register('carbs')} placeholder="e.g., 45g" className={inputClass} />
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3"
=======
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5"
        >
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-muted"
            >
              <Image
                src={imagePreview || DEFAULT_RECIPE_IMAGE}
                alt="Recipe preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40"
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2"
                >
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-wider"
                >
                  UPDATE RECIPE IMAGE
                </p>
                <p className="text-[10px] text-white/70 text-center mt-1 leading-relaxed"
                >
                  High-resolution JPEG or PNG.<br />Recommended 16:9 aspect ratio.
                </p>
              </div>
            </div>
            <div className="p-4"
            >
              <Input
                {...register('image_url')}
                placeholder="https://..."
                className="h-9 rounded-md border-border/40 bg-muted/30 text-sm"
              />
            </div>
          </div>

          {/* Preparation */}
          <div className="bg-white rounded-xl border border-border/40 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4"
            >
              <ListChecks className="h-4 w-4 text-foreground" />
              <h3 className="text-sm font-bold text-foreground"
              >
                Preparation
              </h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            >
              Step-by-Step Guide
            </p>
            <Textarea
              {...register('instructions.0.value')}
              placeholder="1. Preheat the pan to high heat.&#10;2. Season the fillets with sea salt.&#10;3. Sear for 4 minutes on skin side..."
              rows={8}
              className="rounded-lg border-border/40 bg-muted/30 px-4 text-sm resize-none focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-2"
>>>>>>> 831ebf2 (admin pages ui changes)
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/recipes')}
<<<<<<< HEAD
          className="rounded-full px-8 text-sm font-semibold border-[rgba(219,192,193,0.3)] text-[#44151c] hover:bg-[#f8f2f3]"
=======
          className="h-10 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
>>>>>>> 831ebf2 (admin pages ui changes)
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
<<<<<<< HEAD
          className="rounded-full px-8 text-sm font-semibold text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #44151c 0%, #5e1f2a 100%)' }}
=======
          className="h-10 rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider"
>>>>>>> 831ebf2 (admin pages ui changes)
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Save Recipe' : 'Save Recipe'}
        </Button>
      </motion.div>
    </form>
  );
}
