'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSupplier, useUpdateSupplier } from '@/api/hooks/useInventory';
import type { UpdateSupplierPayload } from '@/api/admin-inventory.api';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  bank_details: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: supplier, isLoading, error } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    values: supplier
      ? {
          name: supplier.name,
          contact_person: supplier.contact_person || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          gstin: supplier.gstin || '',
          bank_details: supplier.bank_details || '',
          notes: supplier.notes || '',
        }
      : undefined,
  });

  const onSubmit = (data: SupplierFormValues) => {
    const payload: UpdateSupplierPayload = {
      name: data.name,
      contact_person: data.contact_person || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      gstin: data.gstin || undefined,
      bank_details: data.bank_details || undefined,
      notes: data.notes || undefined,
    };
    updateSupplier.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/admin/inventory/suppliers/${id}`) },
    );
  };

  const isPending = updateSupplier.isPending;

  return (
    <Can
      permission="supplier:manage"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <Truck className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to edit suppliers.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Edit Supplier
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              Update supplier details and contact information.
            </p>
          </div>

          <Link
            href="/admin/inventory/suppliers"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Suppliers
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : error || !supplier ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <Truck className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">Supplier Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested supplier could not be loaded.'}
            </p>
            <Link
              href="/admin/inventory/suppliers"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Link>
          </motion.div>
        ) : (
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
                        <Truck className="h-4 w-4 text-primary" />
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
                                placeholder="e.g., Fresh Farms Pvt Ltd"
                                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact_person"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                placeholder="e.g., contact@supplier.com"
                                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., +91 98765 43210"
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
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Full address..."
                              rows={3}
                              className="rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Business Details */}
                <div className="rounded-2xl bg-white border border-border/40 shadow-sm">
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/5">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-primary">Business Details</h3>
                    </div>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              GSTIN
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 27AABCU9603R1ZX"
                                className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bank_details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Bank Details
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., HDFC Bank, A/C 1234567890"
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
                            <Textarea
                              {...field}
                              placeholder="Optional notes about this supplier..."
                              rows={3}
                              className="rounded-xl border-border/60 bg-white px-4 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/admin/inventory/suppliers/${id}`)}
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
                    Update Supplier
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
