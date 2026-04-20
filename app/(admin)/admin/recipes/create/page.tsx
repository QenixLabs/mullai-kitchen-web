'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { RecipeForm } from '@/components/admin/recipes/RecipeForm';
import { useCreateRecipe } from '@/api/hooks/useRecipes';
import type { CreateRecipePayload } from '@/api/types/menu.types';

export default function CreateRecipePage() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  const handleSubmit = async (data: CreateRecipePayload) => {
    await createRecipe.mutateAsync(data);
    router.push('/admin/recipes');
  };

  return (
    <Can
      permission="recipe:create:global"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-xl bg-destructive/10 mb-6">
            <ChefHat className="h-10 w-10 text-destructive" />
          </div>
          <h2
            className="text-2xl font-bold mb-2 text-primary"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to create recipes.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Create Recipe
            </h1>
            <p
              className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Add a new recipe to the catalog with ingredients, cooking details, and nutrition info.
            </p>
          </div>

          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Link>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <RecipeForm mode="create" onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </Can>
  );
}
