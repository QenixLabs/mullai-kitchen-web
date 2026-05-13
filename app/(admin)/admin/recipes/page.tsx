'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/Auth/can';
import { useRecipes, useDeleteRecipe, useUpdateRecipeStatus } from '@/api/hooks/useRecipes';
import { RecipeTable } from '@/components/admin/recipes/RecipeTable';
import { RecipeStatus } from '@/api/types/menu.types';
import type { Recipe } from '@/api/types/menu.types';

export default function RecipesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecipes({
    search: search || undefined,
    status: (status as RecipeStatus) || undefined,
    page,
    limit: 10,
  });

  const deleteRecipe = useDeleteRecipe();
  const updateStatus = useUpdateRecipeStatus();

  const handleDelete = (recipe: Recipe) => {
    deleteRecipe.mutate(recipe._id);
  };

  const handleStatusChange = (recipe: Recipe, newStatus: RecipeStatus) => {
    updateStatus.mutate({ id: recipe._id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Recipes</h1>
          <p className="text-sm text-muted-foreground">Manage your recipe catalog</p>
        </div>
        <Can permission="recipe:create:global">
          <Button asChild>
            <Link href="/admin/recipes/create">
              <Plus className="mr-2 h-4 w-4" />Create Recipe
            </Link>
          </Button>
        </Can>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RecipeTable
        recipes={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
