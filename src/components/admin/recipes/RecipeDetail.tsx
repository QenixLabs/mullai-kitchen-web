'use client';

import { motion } from 'motion/react';
import { ChefHat, Clock, Users, Flame, Globe, Building2, Pencil, Trash2, Archive, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Can } from '@/components/Auth/can';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/api/types/menu.types';
import { RecipeStatus } from '@/api/types/menu.types';

interface RecipeDetailProps {
  recipe: Recipe;
  onDelete?: () => void;
  onStatusChange?: (status: RecipeStatus) => void;
}

function StatusBadge({ status }: { status: RecipeStatus }) {
  const config = {
    [RecipeStatus.DRAFT]: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    [RecipeStatus.PUBLISHED]: { label: 'Published', className: 'bg-success/15 text-success' },
    [RecipeStatus.ARCHIVED]: { label: 'Archived', className: 'bg-destructive/15 text-destructive' },
  };
  const c = config[status] || config[RecipeStatus.DRAFT];
  return <Badge variant="secondary" className={cn('font-medium', c.className)}>{c.label}</Badge>;
}

export function RecipeDetail({ recipe, onDelete, onStatusChange }: RecipeDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{recipe.name}</h1>
            <StatusBadge status={recipe.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {recipe.cuisine_type && <span>{recipe.cuisine_type}</span>}
            {recipe.difficulty && <span>{recipe.difficulty}</span>}
            {recipe.outlet_restriction ? (
              <Badge variant="outline" className="gap-1 text-xs"><Building2 className="h-3 w-3" />Outlet Only</Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs"><Globe className="h-3 w-3" />Global</Badge>
            )}
          </div>
        </div>
        <Can permission="recipe:edit:global">
          <div className="flex items-center gap-2">
            {recipe.status === RecipeStatus.DRAFT && onStatusChange && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(RecipeStatus.PUBLISHED)}>
                <Send className="mr-2 h-4 w-4" />Publish
              </Button>
            )}
            {recipe.status === RecipeStatus.PUBLISHED && onStatusChange && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(RecipeStatus.ARCHIVED)}>
                <Archive className="mr-2 h-4 w-4" />Archive
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/recipes/${recipe._id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
            </Button>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this recipe? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </Can>
      </div>

      {recipe.description && (
        <p className="text-sm text-muted-foreground">{recipe.description}</p>
      )}

      {recipe.image_url && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.0 }}>
          <Card className="rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <img src={recipe.image_url} alt={recipe.name} className="w-full max-h-80 object-cover" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cooking Details */}
      {recipe.cooking_details && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="rounded-2xl border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="text-base font-semibold text-primary">Cooking Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {recipe.cooking_details.prep_time && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Prep Time</p>
                    <p className="text-sm font-semibold">{recipe.cooking_details.prep_time}</p>
                  </div>
                )}
                {recipe.cooking_details.cook_time && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cook Time</p>
                    <p className="text-sm font-semibold">{recipe.cooking_details.cook_time}</p>
                  </div>
                )}
                {recipe.cooking_details.servings && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <Users className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Servings</p>
                    <p className="text-sm font-semibold">{recipe.cooking_details.servings}</p>
                  </div>
                )}
              </div>
              {recipe.cooking_details.instructions && recipe.cooking_details.instructions.length > 0 && (
                <>
                  <Separator className="mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Instructions</p>
                    {recipe.cooking_details.instructions.map((step, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{i + 1}</span>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="rounded-2xl border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/5">
                  <ChefHat className="h-4 w-4 text-primary" />
                </div>
                <span className="text-base font-semibold text-primary">Ingredients ({recipe.ingredients.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 px-4 rounded-xl bg-muted/30 border border-border/20">
                    <span>{ing.name}</span>
                    <span className="text-muted-foreground">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Nutrition */}
      {recipe.nutrition && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="rounded-2xl border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <span className="text-base font-semibold text-primary">Nutrition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {recipe.nutrition.calories && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Calories</p>
                    <p className="text-lg font-bold">{recipe.nutrition.calories}</p>
                  </div>
                )}
                {recipe.nutrition.protein && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Protein</p>
                    <p className="text-lg font-bold">{recipe.nutrition.protein}</p>
                  </div>
                )}
                {recipe.nutrition.carbs && (
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Carbs</p>
                    <p className="text-lg font-bold">{recipe.nutrition.carbs}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
