'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Plus, Trash2, ChefHat, Save } from 'lucide-react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useRecipe } from '@/api/hooks/useRecipes';
import {
  useIngredients,
  useRecipeIngredients,
  useUpdateRecipeIngredients,
} from '@/api/hooks/useInventory';

const UNITS = [
  'KG',
  'G',
  'L',
  'ML',
  'PCS',
  'DOZEN',
  'PACKET',
  'BOTTLE',
  'BUNCH',
];

const bomItemSchema = z.object({
  ingredient_id: z.string().min(1, 'Ingredient is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  wastage_factor: z.coerce.number().min(0).max(1).optional(),
});

const bomSchema = z.object({
  items: z.array(bomItemSchema).min(1, 'At least one ingredient is required'),
});

type BOMFormValues = z.infer<typeof bomSchema>;

export default function RecipeIngredientsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading: recipeLoading } = useRecipe(id);
  const { data: recipeIngredients, isLoading: bomLoading } = useRecipeIngredients(id);
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const updateRecipeIngredients = useUpdateRecipeIngredients();

  const ingredients = ingredientsData?.data ?? [];

  const form = useForm<BOMFormValues>({
    resolver: zodResolver(bomSchema) as Resolver<BOMFormValues>,
    defaultValues: {
      items: [
        {
          ingredient_id: '',
          quantity: 0,
          unit: '',
          wastage_factor: 0.05,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (recipeIngredients) {
      form.reset({
        items:
          recipeIngredients.length > 0
            ? recipeIngredients.map((ri) => ({
                ingredient_id:
                  typeof ri.ingredient_id === 'object'
                    ? ri.ingredient_id._id
                    : ri.ingredient_id,
                quantity: ri.quantity,
                unit: ri.unit,
                wastage_factor: ri.wastage_factor ?? 0.05,
              }))
            : [
                {
                  ingredient_id: '',
                  quantity: 0,
                  unit: '',
                  wastage_factor: 0.05,
                },
              ],
      });
    }
  }, [recipeIngredients, form]);

  const onSubmit = (values: BOMFormValues) => {
    updateRecipeIngredients.mutate(
      {
        recipeId: id,
        data: values.items.map((item) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          wastage_factor: item.wastage_factor ?? 0.05,
        })),
      },
      {
        onSuccess: () => {
          router.push(`/admin/recipes/${id}`);
        },
      }
    );
  };

  const isLoading = recipeLoading || bomLoading;

  return (
    <Can
      permission="inventory:manage"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <ChefHat className="h-10 w-10 text-destructive" />
          </div>
          <h2
            className="text-2xl font-bold mb-2 text-primary"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to manage recipe ingredients.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1
              className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Manage BOM
            </h1>
            <p
              className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {recipe ? `Recipe: ${recipe.name}` : 'Link ingredients to recipe with quantities and wastage.'}
            </p>
          </div>

          <Link
            href={`/admin/recipes/${id}`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe
          </Link>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-border/40 p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
              <Skeleton className="h-11 rounded-xl" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-2xl bg-white border border-border/40 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.ingredient_id`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Ingredient
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ingredients.map((ing) => (
                                  <SelectItem key={ing._id} value={ing._id}>
                                    {ing.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Quantity
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                className="h-11 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Unit
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNITS.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.wastage_factor`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Wastage Factor
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                max={1}
                                className="h-11 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        ingredient_id: '',
                        quantity: 0,
                        unit: '',
                        wastage_factor: 0.05,
                      })
                    }
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>

                  <Button
                    type="submit"
                    disabled={updateRecipeIngredients.isPending}
                    className="rounded-full"
                  >
                    {updateRecipeIngredients.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save BOM
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </div>
    </Can>
  );
}
