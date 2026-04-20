'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Pencil,
  Trash2,
  Eye,
  ChefHat,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/api/types/menu.types';
import { RecipeStatus } from '@/api/types/menu.types';

interface RecipeTableProps {
  recipes: Recipe[];
  isLoading?: boolean;
  onDelete?: (recipe: Recipe) => void;
  onStatusChange?: (recipe: Recipe, status: RecipeStatus) => void;
}

function RecipeStatusBadge({ status }: { status: RecipeStatus }) {
  const config = {
    [RecipeStatus.DRAFT]: { label: 'Draft', className: 'bg-[#f8f2f3] text-[#554243]' },
    [RecipeStatus.PUBLISHED]: { label: 'Active', className: 'bg-[#44151c] text-white' },
    [RecipeStatus.ARCHIVED]: { label: 'Archived', className: 'bg-[#e8e0e1] text-[#554243]' },
  };
  const c = config[status] || config[RecipeStatus.DRAFT];
  return (
    <Badge className={cn('font-semibold text-[10px] uppercase tracking-wider rounded-full px-3 py-0.5', c.className)}>
      {c.label}
    </Badge>
  );
}

function CardSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden rounded-xl border border-[rgba(219,192,193,0.2)]">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div className="rounded-2xl bg-[#f8f2f3] p-5 mb-4">
        <ChefHat className="h-10 w-10 text-[#44151c]" />
      </div>
      <p className="text-lg font-semibold text-[#44151c]">No recipes found</p>
      <p className="text-sm text-[#554243] mt-1">
        Try adjusting your filters or search query
      </p>
    </div>
  );
}

export function RecipeTable({ recipes, isLoading = false, onDelete, onStatusChange }: RecipeTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const canEdit = useHasPermission('recipe:edit:global');

  const handleDeleteConfirm = () => {
    if (deleteTarget && onDelete) onDelete(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <CardSkeleton />
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : (
          recipes.map((recipe) => (
            <Card
              key={recipe._id}
              className="group overflow-hidden rounded-xl border border-[rgba(219,192,193,0.2)] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden bg-[#f8f2f3]">
                <img
                  src={recipe.image_url || '/images/admin/Gourmet Salad (1).png'}
                  alt={recipe.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <RecipeStatusBadge status={recipe.status} />
                </div>
              </div>

              <CardContent className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.cuisine_type && (
                    <span className="inline-flex items-center rounded-full bg-[#f8f2f3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#44151c]">
                      {recipe.cuisine_type}
                    </span>
                  )}
                  {recipe.difficulty && (
                    <span className="inline-flex items-center rounded-full bg-[#f8f2f3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#44151c]">
                      {recipe.difficulty}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-[#44151c] leading-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {recipe.name}
                </h3>

                {/* Description */}
                {recipe.description && (
                  <p className="text-sm text-[#554243] line-clamp-2 mb-4 leading-relaxed">
                    {recipe.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[rgba(219,192,193,0.2)]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-[#f8f2f3] text-[#44151c]"
                    asChild
                  >
                    <Link href={`/admin/recipes/${recipe._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Can permission="recipe:edit:global">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-[#f8f2f3] text-[#44151c]"
                      asChild
                    >
                      <Link href={`/admin/recipes/${recipe._id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </Can>

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-red-50 text-red-600"
                      onClick={() => setDeleteTarget(recipe)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-xl border-[rgba(219,192,193,0.2)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[#44151c]">Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#554243]">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[#44151c]">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-[rgba(219,192,193,0.3)] text-[#44151c]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-full bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
