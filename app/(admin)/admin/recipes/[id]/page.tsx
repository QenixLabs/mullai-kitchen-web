'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipe, useDeleteRecipe, useUpdateRecipeStatus } from '@/api/hooks/useRecipes';
import { RecipeDetail } from '@/components/admin/recipes/RecipeDetail';
import { RecipeStatus } from '@/api/types/menu.types';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading, error } = useRecipe(id);
  const deleteRecipe = useDeleteRecipe();
  const updateStatus = useUpdateRecipeStatus();

  const handleDelete = () => {
    deleteRecipe.mutate(id, { onSuccess: () => router.push('/admin/recipes') });
  };

  const handleStatusChange = (status: RecipeStatus) => {
    updateStatus.mutate({ id, status });
  };

  return (
    <Can
      permission="recipe:view"
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
            You do not have permission to view recipes.
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
              Recipe Details
            </h1>
            <p
              className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View recipe information, ingredients, and nutrition.
            </p>
          </div>

          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
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
            <div className="rounded-2xl bg-white border border-border/40 p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-border/40 p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </div>
          </div>
        ) : error || !recipe ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <ChefHat className="h-10 w-10 text-destructive" />
            </div>
            <h2
              className="text-2xl font-bold mb-2 text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Recipe Not Found
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested recipe could not be loaded.'}
            </p>
            <Link
              href="/admin/recipes"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recipes
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <RecipeDetail
              recipe={recipe}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        )}
      </div>
    </Can>
  );
}
