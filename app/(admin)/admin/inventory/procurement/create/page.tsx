'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ClipboardList, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useSuppliers, useIngredients, useCreatePurchaseOrder } from '@/api/hooks/useInventory';
import { UserRole } from '@/api/types/user.types';
import type { CreatePurchaseOrderPayload } from '@/api/admin-inventory.api';

const UNITS = ['KG', 'G', 'L', 'ML', 'PCS', 'DOZEN', 'PACKET', 'BOTTLE', 'BUNCH'];

const poItemSchema = z.object({
  ingredient_id: z.string().min(1, 'Ingredient is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.coerce.number().nonnegative('Price must be positive'),
  notes: z.string().optional(),
});

const poSchema = z.object({
  outlet_id: z.string().min(1, 'Outlet is required'),
  supplier_id: z.string().min(1, 'Supplier is required'),
  order_date: z.string().min(1, 'Order date is required'),
  expected_delivery_date: z.string().optional(),
  tax_amount: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
});

type POFormValues = z.infer<typeof poSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const { data: outletsData } = useOutlets(canViewAnyOutlet ? { status: 'active' } : undefined);
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const createPO = useCreatePurchaseOrder();

  const defaultOutletId = !isSuperAdmin && user?.assigned_outlet_id
    ? user.assigned_outlet_id
    : '';

  const form = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      outlet_id: defaultOutletId,
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      tax_amount: undefined,
      notes: '',
      items: [{ ingredient_id: '', quantity: 1, unit: '', unit_price: 0, notes: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (data: POFormValues) => {
    const payload: CreatePurchaseOrderPayload = {
      outlet_id: data.outlet_id,
      supplier_id: data.supplier_id,
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date || undefined,
      tax_amount: data.tax_amount,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({
        ingredient_id: item.ingredient_id,
        quantity: Number(item.quantity),
        unit: item.unit,
        unit_price: Number(item.unit_price),
        notes: item.notes || undefined,
      })),
    };
    createPO.mutate(payload, {
      onSuccess: () => router.push('/admin/inventory/procurement'),
    });
  };

  const isPending = createPO.isPending;
  const ingredients = ingredientsData?.data ?? [];

  return (
    <Can
      permission="inventory:procurement"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <ClipboardList className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to create purchase orders.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Create Purchase Order
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              Create a new PO with supplier, outlet, and line items.
            </p>
          </div>

          <Link
            href="/admin/inventory/procurement"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Procurement
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* PO Details */}
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/5">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-primary">Order Details</h3>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="outlet_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Outlet *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select outlet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(outletsData?.data || []).map((o) => (
                                <SelectItem key={o._id} value={o._id}>
                                  {o.name}
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
                      name="supplier_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Supplier *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(suppliersData?.data ?? []).map((s) => (
                                <SelectItem key={s._id} value={s._id}>
                                  {s.name}
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
                      name="order_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Order Date *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expected_delivery_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Expected Delivery
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ''} className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="tax_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tax Amount (₹)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value ?? ''}
                              placeholder="e.g., 180.50"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Optional notes..." rows={3} className="rounded-xl border-border/60 bg-white px-4 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/5">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-primary">Line Items</h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ ingredient_id: '', quantity: 1, unit: '', unit_price: 0, notes: '' })}
                      className="rounded-full"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-border/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Item {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.ingredient_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Ingredient *
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                                    <SelectValue placeholder="Select ingredient" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ingredients.map((i) => (
                                    <SelectItem key={i._id} value={i._id}>
                                      {i.name}
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
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Unit *
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
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Quantity *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
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
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Unit Price (₹) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  placeholder="e.g., 120.50"
                                  className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Notes
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Optional"
                                  className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/inventory/procurement')}
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
                  Create Purchase Order
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </Can>
  );
}
