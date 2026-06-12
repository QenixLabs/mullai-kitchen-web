'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ChefHat,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Ban,
  ListChecks,
} from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useIngredient,
  useDeleteIngredient,
} from '@/api/hooks/useInventory';

export default function IngredientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: ingredient, isLoading, error } = useIngredient(id);
  const deleteIngredient = useDeleteIngredient();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      deleteIngredient.mutate(id, {
        onSuccess: () => router.push('/admin/inventory/ingredients'),
      });
    }
  };

  return (
    <Can
      permission="inventory:view"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <ChefHat className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view ingredients.
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
              Ingredient Details
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              View ingredient information, stock levels, and movement history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="inventory:manage">
              <Button
                variant="outline"
                className="h-9 gap-1.5 rounded-full"
                asChild
              >
                <Link href={`/admin/inventory/ingredients/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can permission="inventory:manage">
              <Button
                variant="destructive"
                className="h-9 gap-1.5 rounded-full"
                onClick={handleDelete}
                disabled={deleteIngredient.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </Can>
            <Link
              href="/admin/inventory/ingredients"
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
        ) : error || !ingredient ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <ChefHat className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">Ingredient Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested ingredient could not be loaded.'}
            </p>
            <Link
              href="/admin/inventory/ingredients"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ingredients
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
                    {ingredient.name.slice(0, 2)}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{ingredient.name}</h2>
                    <p className="text-sm text-muted-foreground">{ingredient.category}</p>
                  </div>
                </div>
                <StatusPill status={ingredient.status} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatItem label="Default Unit" value={ingredient.default_unit} />
                <StatItem
                  label="Min Stock"
                  value={ingredient.minimum_stock_level?.toString() ?? '—'}
                />
                <StatItem
                  label="Reorder Qty"
                  value={ingredient.reorder_quantity?.toString() ?? '—'}
                />
                <StatItem
                  label="Current Cost"
                  value={
                    ingredient.current_cost
                      ? `₹${ingredient.current_cost.toLocaleString('en-IN')}`
                      : '—'
                  }
                />
              </div>
            </div>

            {/* Supplier Card */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-primary">Supplier Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatItem label="Supplier" value={ingredient.supplier || '—'} />
                <StatItem label="Contact" value={ingredient.supplier_contact || '—'} />
                <StatItem label="Email" value={ingredient.supplier_email || '—'} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Can>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      {normalized === 'DISCONTINUED' ? 'Discontinued' : 'Inactive'}
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
