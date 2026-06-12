'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  UtensilsCrossed,
  Pencil,
  Trash2,
  Package,
  Leaf,
  Beef,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddOn, useDeleteAddOn } from '@/api/hooks/useAdminAddons';
import { sanitizeUrl } from '@/lib/sanitize';

export default function AddOnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: addOn, isLoading, error } = useAddOn(id);
  const deleteAddOn = useDeleteAddOn();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      deleteAddOn.mutate(id, {
        onSuccess: () => router.push('/admin/menu/add-ons'),
      });
    }
  };

  return (
    <Can
      permission="menu:view"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <UtensilsCrossed className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view add-ons.
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
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Add-on Details
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              View add-on information, pricing, and availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="menu:manage">
              <Button
                variant="outline"
                className="h-9 gap-1.5 rounded-full"
                asChild
              >
                <Link href={`/admin/menu/add-ons/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can permission="menu:manage">
              <Button
                variant="destructive"
                className="h-9 gap-1.5 rounded-full"
                onClick={handleDelete}
                disabled={deleteAddOn.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </Can>
            <Link
              href="/admin/menu/add-ons"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : error || !addOn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <UtensilsCrossed className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">Add-on Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested add-on could not be loaded.'}
            </p>
            <Link
              href="/admin/menu/add-ons"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Add-ons
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Overview Card */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold uppercase text-primary ring-1 ring-primary/15">
                    {addOn.name.slice(0, 2)}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{addOn.name}</h2>
                    <p className="text-sm text-muted-foreground">{addOn.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VegPill isVeg={addOn.is_veg} />
                  <AvailabilityPill isAvailable={addOn.is_available} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatItem
                  label="Price"
                  value={`₹${addOn.price.toLocaleString('en-IN')}`}
                />
                <StatItem
                  label="Quantity"
                  value={addOn.quantity || '—'}
                />
                <StatItem
                  label="Preparation Time"
                  value={
                    addOn.preparation_time
                      ? `${addOn.preparation_time} min`
                      : '—'
                  }
                />
                <StatItem
                  label="Max Per Order"
                  value={
                    addOn.max_quantity_per_order?.toString() || '—'
                  }
                />
                <StatItem
                  label="Recipe"
                  value={addOn.recipe_name || addOn.recipe_id ? (addOn.recipe_name || 'Linked') : '—'}
                />
              </div>
            </div>

            {/* Details Card */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-primary">More Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatItem
                  label="Meal Types"
                  value={addOn.meal_type?.join(', ') || '—'}
                />
                <StatItem
                  label="Description"
                  value={addOn.description || '—'}
                />
              </div>
            </div>

            {/* Media Card */}
            {addOn.image && (
              <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/5">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-primary">Image</h3>
                </div>
                <img
                  src={sanitizeUrl(addOn.image)}
                  alt={addOn.name}
                  className="max-h-64 rounded-xl object-cover"
                />
              </div>
            )}

            {/* Restrictions Card */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Ban className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-primary">Restrictions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatItem
                  label="Outlet Restriction"
                  value={addOn.outlet_restriction || '—'}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Can>
  );
}

function VegPill({ isVeg }: { isVeg?: boolean }) {
  if (isVeg) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <Leaf className="h-3 w-3" />
        Veg
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
      <Beef className="h-3 w-3" />
      Non-Veg
    </span>
  );
}

function AvailabilityPill({ isAvailable }: { isAvailable?: boolean }) {
  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Unavailable
    </span>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
