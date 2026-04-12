'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ChefHat,
  Eye,
  Globe,
  Building2,
  Archive,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
    [RecipeStatus.DRAFT]: { label: 'Draft', className: 'bg-muted text-muted-foreground hover:bg-muted/80' },
    [RecipeStatus.PUBLISHED]: { label: 'Published', className: 'bg-success/15 text-success hover:bg-success/20' },
    [RecipeStatus.ARCHIVED]: { label: 'Archived', className: 'bg-destructive/15 text-destructive hover:bg-destructive/20' },
  };
  const c = config[status] || config[RecipeStatus.DRAFT];
  return (
    <Badge variant="secondary" className={cn('font-medium', c.className)}>
      {c.label}
    </Badge>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-sm" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-sm" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-sm" /></TableCell>
          <TableCell className="w-[60px]"><Skeleton className="h-8 w-8 rounded-sm" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-[200px]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-sm bg-muted p-3 mb-3">
            <ChefHat className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No recipes found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
      </TableCell>
    </TableRow>
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
      <Card className="overflow-hidden border-border shadow-md">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">Recipe Name</TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">Status</TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">Difficulty</TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">Ingredients</TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">Scope</TableHead>
                  <TableHead className="h-11 w-[60px] px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows />
                ) : recipes.length === 0 ? (
                  <EmptyState />
                ) : (
                  recipes.map((recipe, index) => (
                    <TableRow
                      key={recipe._id}
                      className={cn(
                        'group border-b-border transition-colors hover:bg-muted/40',
                        index === recipes.length - 1 && 'border-b-0'
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                            <ChefHat className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{recipe.name}</span>
                            {recipe.cuisine_type && (
                              <span className="text-xs text-muted-foreground">{recipe.cuisine_type}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <RecipeStatusBadge status={recipe.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {recipe.difficulty || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {recipe.ingredients?.length || 0} items
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {recipe.outlet_restriction ? (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Building2 className="h-3 w-3" />
                            Outlet Only
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Globe className="h-3 w-3" />
                            Global
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm opacity-70 transition-all duration-200 hover:bg-muted hover:opacity-100 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-sm border-border">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/recipes/${recipe._id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />View
                              </Link>
                            </DropdownMenuItem>
                            <Can permission="recipe:edit:global">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/recipes/${recipe._id}/edit`} className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4" />Edit
                                </Link>
                              </DropdownMenuItem>
                              {recipe.status === RecipeStatus.DRAFT && onStatusChange && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => onStatusChange(recipe, RecipeStatus.PUBLISHED)}>
                                  <Send className="mr-2 h-4 w-4" />Publish
                                </DropdownMenuItem>
                              )}
                              {recipe.status === RecipeStatus.PUBLISHED && onStatusChange && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => onStatusChange(recipe, RecipeStatus.ARCHIVED)}>
                                  <Archive className="mr-2 h-4 w-4" />Archive
                                </DropdownMenuItem>
                              )}
                            </Can>
                            {canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteTarget(recipe)}>
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-sm border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-sm bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
