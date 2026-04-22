'use client';

import { useState } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import { Plus, Search } from 'lucide-react';
=======
import Image from 'next/image';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
>>>>>>> 831ebf2 (admin pages ui changes)
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

<<<<<<< HEAD
=======
const DEFAULT_RECIPE_IMAGE = '/images/admin/Gourmet%20Salad.png';

/* ─── Mock fallback recipes ─── */
const MOCK_RECIPES: Recipe[] = [
  {
    _id: '1',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Tuscan Harvest Bowl',
    description: 'Quinoa base with roasted autumn vegetables, lemon-tahini dressing and toasted almonds.',
    cuisine_type: 'Mediterranean',
    status: RecipeStatus.PUBLISHED,
    ingredients: [],
    image_url: DEFAULT_RECIPE_IMAGE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const CATEGORIES = ['All Categories', 'Breakfast', 'Lunch', 'Dinner'];
const CUISINES = ['All Cuisines', 'South Indian', 'North Indian', 'Continental', 'Chinese', 'Mediterranean'];

/* ─── Recipe Card ─── */
function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete?: (r: Recipe) => void }) {
  return (
    <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
          alt={recipe.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-foreground leading-tight">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
            <Can permission="recipe:view">
              <Link href={`/admin/recipes/${recipe._id}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Can>
            <Can permission="recipe:update">
              <Link href={`/admin/recipes/${recipe._id}/edit`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Can>
            <Can permission="recipe:delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete?.(recipe)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
            Lunch
          </span>
          {recipe.cuisine_type && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
              {recipe.cuisine_type}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {recipe.description || 'No description'}
        </p>
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden animate-pulse">
      <div className="relative aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-10 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-3 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

/* ─── Page ─── */
>>>>>>> 831ebf2 (admin pages ui changes)
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
<<<<<<< HEAD
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
=======
      <PageHeader
        title="RECIPES"
        subtitle="Manage all global recipes used in plans"
        actions={
          <Can permission="recipe:create:global">
            <Link href="/admin/recipes/create">
              <Button className="rounded-full h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Recipe
              </Button>
>>>>>>> 831ebf2 (admin pages ui changes)
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

<<<<<<< HEAD
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
=======
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-border/40 shadow-sm p-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes by name or ingredient..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border/40 bg-white text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-border/40 bg-white text-sm text-foreground outline-none focus:border-primary/40 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={cuisine}
              onChange={(e) => { setCuisine(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-border/40 bg-white text-sm text-foreground outline-none focus:border-primary/40 cursor-pointer"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-border/40">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))
          : displayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {displayRecipes.length} of {useMock ? MOCK_RECIPES.length : total} Recipes
          </p>
          {(useMock ? 1 : totalPages) > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0 rounded-lg border-border/40"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, useMock ? 1 : totalPages) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 w-8 p-0 rounded-lg text-xs font-semibold',
                    page === p
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border/40'
                  )}
                >
                  {p}
                </Button>
              ))}
              {(useMock ? 1 : totalPages) > 5 && (
                <>
                  <span className="text-xs text-muted-foreground px-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(useMock ? 1 : totalPages)}
                    className="h-8 w-8 p-0 rounded-lg border-border/40 text-xs"
                  >
                    {useMock ? 1 : totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={page === (useMock ? 1 : totalPages)}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0 rounded-lg border-border/40"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
>>>>>>> 831ebf2 (admin pages ui changes)
        </div>
      )}
    </div>
  );
}
