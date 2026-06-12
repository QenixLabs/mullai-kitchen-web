'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, UtensilsCrossed, Loader2, Leaf, ImageIcon, Ban } from 'lucide-react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCreateAddOn } from '@/api/hooks/useAdminAddons';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { ImageUploadField } from '@/components/admin/plans/ImageUploadField';
import type { CreateAddOnPayload } from '@/api/admin-addon.api';

const CATEGORIES = ['Beverage', 'Dessert', 'Side Dish', 'Extra Main'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const addOnSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be under 200 characters'),
  name_tamil: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().nonnegative('Price must be positive').max(999999, 'Price exceeds maximum allowed').refine((v) => !isNaN(v), 'Price must be a valid number'),
  ),
  quantity: z.string().optional(),
  image: z.string().optional(),
  is_veg: z.boolean().optional(),
  is_available: z.boolean().optional(),
  meal_type: z.array(z.string()).optional(),
  max_quantity_per_order: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().nonnegative().max(100, 'Max quantity must be 100 or less').optional().refine((v) => v === undefined || !isNaN(v), 'Must be a valid number'),
  ),
  preparation_time: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().nonnegative().max(1440, 'Preparation time must be 24 hours or less').optional().refine((v) => v === undefined || !isNaN(v), 'Must be a valid number'),
  ),
  outlet_restriction: z.string().optional(),
  recipe_id: z.string().optional(),
});

type AddOnFormValues = z.infer<typeof addOnSchema>;

export default function CreateAddOnPage() {
  const router = useRouter();
  const createAddOn = useCreateAddOn();
  const { data: outletsData } = useOutlets({ limit: 100 });
  const outlets = outletsData?.data ?? [];
  const { data: recipes } = useRecipeSelect();

  const form = useForm<AddOnFormValues>({
    resolver: zodResolver(addOnSchema) as Resolver<AddOnFormValues>,
    defaultValues: {
      name: '',
      name_tamil: '',
      category: '',
      description: '',
      price: undefined,
      quantity: '',
      image: '',
      is_veg: true,
      is_available: true,
      meal_type: [],
      max_quantity_per_order: undefined,
      preparation_time: undefined,
      outlet_restriction: '',
      recipe_id: '',
    },
  });

  const onSubmit: SubmitHandler<AddOnFormValues> = (data) => {
    const payload: CreateAddOnPayload = {
      name: data.name,
      name_tamil: data.name_tamil || undefined,
      category: data.category,
      description: data.description || undefined,
      price: data.price,
      quantity: data.quantity || undefined,
      image: data.image || undefined,
      is_veg: data.is_veg,
      is_available: data.is_available,
      meal_type: data.meal_type,
      max_quantity_per_order: data.max_quantity_per_order,
      preparation_time: data.preparation_time,
      outlet_restriction: data.outlet_restriction || undefined,
      recipe_id: data.recipe_id || undefined,
    };
    createAddOn.mutate(payload, {
      onSuccess: () => router.push('/admin/menu/add-ons'),
    });
  };

  const isPending = createAddOn.isPending;

  return (
    <Can
      permission="menu:manage"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <UtensilsCrossed className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to create add-ons.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Create Add-on
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              Add a new add-on item to the menu catalog.
            </p>
          </div>

          <Link
            href="/admin/menu/add-ons"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Add-ons
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card className="rounded-2xl bg-card border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                    </div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Gulab Jamun" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name_tamil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Tamil)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., குலாப் ஜாமூன்" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (&#8377;) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 2 pieces" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recipe_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe</FormLabel>
                          <Select onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)} value={field.value || '__none__'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recipe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {recipes?.map((r) => (
                                <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Short description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="rounded-2xl bg-card border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="is_veg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Vegetarian?</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v === 'true')}
                            defaultValue={field.value ? 'true' : 'false'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_available"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Available?</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v === 'true')}
                            defaultValue={field.value ? 'true' : 'false'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preparation_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preparation Time (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                              placeholder="e.g., 15"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="meal_type"
                    render={() => (
                      <FormItem>
                        <FormLabel>Meal Types</FormLabel>
                        <div className="flex flex-row flex-wrap gap-x-6 gap-y-3">
                          {MEAL_TYPES.map((mt) => (
                            <FormField
                              key={mt}
                              control={form.control}
                              name="meal_type"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-x-2.5 gap-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(mt)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        field.onChange(checked ? [...current, mt] : current.filter((v) => v !== mt));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{mt}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_quantity_per_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Quantity Per Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                            placeholder="Unlimited"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Media */}
              <Card className="rounded-2xl bg-card border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <ImageUploadField value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Restrictions */}
              <Card className="rounded-2xl bg-card border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <Ban className="h-4 w-4 text-primary" />
                    </div>
                    Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="outlet_restriction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outlet Restriction</FormLabel>
                        <Select onValueChange={(v) => field.onChange(v === '__all__' ? '' : v)} defaultValue={field.value || '__all__'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All outlets" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__all__">All outlets</SelectItem>
                            {outlets.map((o) => (
                              <SelectItem key={o._id} value={o._id}>{o.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/menu/add-ons')}
                  className="rounded-full px-8 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Add-on
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </Can>
  );
}
