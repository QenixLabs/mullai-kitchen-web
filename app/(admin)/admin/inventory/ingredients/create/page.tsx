'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ChefHat, Loader2, Plus } from 'lucide-react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Can } from '@/components/Auth/can';
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
import { useCreateIngredient, useSuppliers } from '@/api/hooks/useInventory';
import type { CreateIngredientPayload } from '@/api/admin-inventory.api';

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

const STATUSES = ['ACTIVE', 'INACTIVE', 'DISCONTINUED'];

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  default_unit: z.string().min(1, 'Unit is required'),
  current_cost: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : Number(val), z.number().nonnegative().optional()),
  supplier: z.string().optional(),
  supplier_contact: z.string().optional(),
  supplier_email: z.string().email('Invalid email').optional().or(z.literal('')),
  minimum_stock_level: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : Number(val), z.number().nonnegative().optional()),
  reorder_quantity: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : Number(val), z.number().nonnegative().optional()),
  status: z.string().optional(),
});

type IngredientFormValues = {
  name: string;
  category: string;
  default_unit: string;
  current_cost?: number;
  supplier?: string;
  supplier_contact?: string;
  supplier_email?: string;
  minimum_stock_level?: number;
  reorder_quantity?: number;
  status?: string;
};

export default function CreateIngredientPage() {
  const router = useRouter();
  const createIngredient = useCreateIngredient();

  const { data: suppliersData } = useSuppliers({ limit: 100 });

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema) as Resolver<IngredientFormValues>,
    defaultValues: {
      name: '',
      category: '',
      default_unit: '',
      status: 'ACTIVE',
    },
  });

  const onSubmit: SubmitHandler<IngredientFormValues> = (data) => {
    const payload: CreateIngredientPayload = {
      name: data.name,
      category: data.category,
      default_unit: data.default_unit,
      current_cost: data.current_cost,
      supplier: data.supplier || undefined,
      supplier_contact: data.supplier_contact || undefined,
      supplier_email: data.supplier_email || undefined,
      minimum_stock_level: data.minimum_stock_level,
      reorder_quantity: data.reorder_quantity,
      status: data.status || 'ACTIVE',
    };
    createIngredient.mutate(payload, {
      onSuccess: () => router.push('/admin/inventory/ingredients'),
    });
  };

  const isPending = createIngredient.isPending;

  return (
    <Can
      permission="inventory:manage"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <ChefHat className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to create ingredients.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Create Ingredient
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              Add a new ingredient to the catalog with stock thresholds and supplier info.
            </p>
          </div>

          <Link
            href="/admin/inventory/ingredients"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Ingredients
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
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Basmati Rice"
                              className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Category *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="default_unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Default Unit *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS.map((u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Status
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Stock Thresholds */}
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <ChefHat className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-primary">Stock Thresholds</h3>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="minimum_stock_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Minimum Stock Level
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="e.g., 10"
                              className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorder_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Reorder Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="e.g., 50"
                              className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Current Cost (&#8377;)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="e.g., 120.50"
                              className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <ChefHat className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-primary">Supplier Information</h3>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Supplier
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(suppliersData?.data ?? []).map((s) => (
                                <SelectItem key={s._id} value={s.name}>
                                  {s.name}
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
                      name="supplier_contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Contact Person
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Ramesh Kumar"
                              className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="supplier_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Supplier Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            placeholder="e.g., supplier@example.com"
                            className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Link
                      href="/admin/inventory/suppliers/create"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      Create new supplier
                    </Link>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/inventory/ingredients')}
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
                  Create Ingredient
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </Can>
  );
}
