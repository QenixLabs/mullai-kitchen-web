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
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
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
      <AdminPageHeader
        title="Recipes"
        subtitle="Manage your recipe catalog"
      >
        <Can permission="recipe:create:global">
          <Button
            asChild
            className="rounded-full text-white px-6 shadow-md self-start sm:self-auto"
            style={{
              background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)',
            }}
          >
            <Link href="/admin/recipes/create">
              <Plus className="mr-2 h-4 w-4" />Create Recipe
            </Link>
          </Button>
        </Can>
      </AdminPageHeader>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v === 'all' ? '' : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
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
            className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
          >
            Previous
          </Button>
          <span className="text-sm text-[#554243]">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
