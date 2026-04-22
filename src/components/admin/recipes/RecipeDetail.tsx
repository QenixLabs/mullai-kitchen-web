'use client';

import { motion } from 'motion/react';
import {
  ChefHat,
  Clock,
  Users,
  Flame,
  Pencil,
  Trash2,
  ArrowLeft,
  Printer,
  Share2,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    [RecipeStatus.DRAFT]: { label: 'Draft', className: 'bg-white/20 text-white backdrop-blur-sm' },
    [RecipeStatus.PUBLISHED]: { label: 'Active', className: 'bg-white/20 text-white backdrop-blur-sm' },
    [RecipeStatus.ARCHIVED]: { label: 'Archived', className: 'bg-white/20 text-white backdrop-blur-sm' },
  };
  const c = config[status] || config[RecipeStatus.DRAFT];
  return (
    <Badge className={cn('font-semibold text-[10px] uppercase tracking-wider rounded-full px-3 py-0.5', c.className)}>
      {c.label}
    </Badge>
  );
}

// Food images for step visuals (cycle through them)
const STEP_IMAGES = [
  '/images/food/1.jpg',
  '/images/food/2.jpg',
  '/images/food/3.jpg',
  '/images/food/4.jpg',
];

// Parse instruction text into title + body
function parseStep(text: string): { title: string | null; body: string } {
  // Try patterns like "TITLE: body" or "TITLE - body" or "STEP 1: body"
  const colonMatch = text.match(/^([^:]+):\s*(.+)$/);
  if (colonMatch && colonMatch[1].length < 60) {
    return { title: colonMatch[1].trim(), body: colonMatch[2].trim() };
  }
  const dashMatch = text.match(/^([^-]{3,40})\s+-\s+(.+)$/);
  if (dashMatch) {
    return { title: dashMatch[1].trim(), body: dashMatch[2].trim() };
  }
  return { title: null, body: text };
}

export function RecipeDetail({ recipe, onDelete, onStatusChange }: RecipeDetailProps) {
  const heroImage = recipe.image_url || '/images/admin/Gourmet Salad (1).png';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* ===== HERO IMAGE ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full overflow-hidden rounded-3xl"
      >
        <div className="relative h-72 md:h-[420px] w-full">
          <img
            src={heroImage}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0508]/90 via-[#1a0508]/30 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.cuisine_type && (
                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {recipe.cuisine_type}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Lunch
              </span>
              <StatusBadge status={recipe.status} />
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl font-extrabold text-white"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.5px' }}
            >
              {recipe.name}
            </h1>

            {/* Subtitle */}
            {recipe.description && (
              <p
                className="mt-2 text-xs md:text-sm text-white/70 font-medium uppercase tracking-wider"
                style={{ letterSpacing: '1.5px' }}
              >
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== TWO COLUMN: INGREDIENTS + PREPARATION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        {/* Left: Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl bg-white p-6 md:p-8 h-fit"
            style={{ border: '1px solid rgba(219,192,193,0.2)' }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <ChefHat className="h-5 w-5" style={{ color: '#44151c' }} />
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: '#3d000c', letterSpacing: '1.2px' }}
              >
                Ingredients
              </h2>
            </div>

            <div className="space-y-0">
              {recipe.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3.5"
                  style={{
                    borderBottom:
                      i < recipe.ingredients.length - 1
                        ? '1px solid rgba(219,192,193,0.2)'
                        : 'none',
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#3d000c' }}>
                    {ing.name}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#554243' }}>
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Dates footer */}
            <div className="mt-6 pt-5 space-y-2" style={{ borderTop: '1px solid rgba(219,192,193,0.2)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#554243' }}>
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wide">Created on:</span>
                <span>{formatDate(recipe.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#554243' }}>
                <Clock className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wide">Last Updated:</span>
                <span>{formatDate(recipe.updated_at)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right: Preparation Steps */}
        {recipe.cooking_details?.instructions && recipe.cooking_details.instructions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <UtensilsIcon />
              <h2
                className="text-lg font-extrabold uppercase tracking-wider"
                style={{ color: '#3d000c', letterSpacing: '1.5px' }}
              >
                Preparation Steps
              </h2>
            </div>

            <div className="space-y-8">
              {recipe.cooking_details.instructions.map((step, i) => {
                const { title, body } = parseStep(step);
                const stepImg = STEP_IMAGES[i % STEP_IMAGES.length];
                // Show image on alternating steps (odd indices after first)
                const showImage = i > 0 && i % 2 === 1;

                return (
                  <div key={i} className="flex gap-5">
                    {/* Number circle */}
                    <div className="flex-shrink-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#44151c' }}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      {title ? (
                        <>
                          <h3
                            className="text-sm font-extrabold uppercase tracking-wide"
                            style={{ color: '#3d000c', letterSpacing: '1px' }}
                          >
                            {title}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ color: '#554243' }}>
                            {body}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm leading-relaxed" style={{ color: '#554243' }}>
                          {body}
                        </p>
                      )}

                      {/* Step image on some steps */}
                      {showImage && (
                        <div className="mt-3 overflow-hidden rounded-2xl">
                          <img
                            src={stepImg}
                            alt={`Step ${i + 1}`}
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ===== CULINARY CONCIERGE FOOTER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-3xl bg-white p-6 md:p-8"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3
              className="text-sm font-extrabold uppercase tracking-wider"
              style={{ color: '#3d000c', letterSpacing: '1.5px' }}
            >
              Culinary Concierge
            </h3>
            <p className="text-xs mt-1" style={{ color: '#554243' }}>
              Operational Excellence in Fine Dining
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full px-6 text-sm font-semibold transition-colors hover:opacity-90"
              style={{
                borderColor: 'rgba(219,192,193,0.4)',
                color: '#44151c',
                backgroundColor: 'transparent',
              }}
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Recipe
            </Button>
            <Button
              className="rounded-full px-6 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#44151c' }}
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </div>
        </div>

        <Separator className="my-5" style={{ backgroundColor: 'rgba(219,192,193,0.2)' }} />

        <div className="flex flex-wrap items-center gap-3">
          <Can permission="recipe:edit:global">
            <Button
              variant="outline"
              className="rounded-full px-5 text-sm font-semibold transition-colors hover:opacity-90"
              style={{
                borderColor: 'rgba(219,192,193,0.4)',
                color: '#44151c',
                backgroundColor: 'transparent',
              }}
              asChild
            >
              <Link href={`/admin/recipes/${recipe._id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Recipe
              </Link>
            </Button>
          </Can>

          {onStatusChange && recipe.status === RecipeStatus.DRAFT && (
            <Button
              className="rounded-full px-5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#44151c' }}
              onClick={() => onStatusChange(RecipeStatus.PUBLISHED)}
            >
              Publish
            </Button>
          )}
          {onStatusChange && recipe.status === RecipeStatus.PUBLISHED && (
            <Button
              variant="outline"
              className="rounded-full px-5 text-sm font-semibold transition-colors hover:opacity-90"
              style={{
                borderColor: 'rgba(219,192,193,0.4)',
                color: '#44151c',
                backgroundColor: 'transparent',
              }}
              onClick={() => onStatusChange(RecipeStatus.ARCHIVED)}
            >
              Archive
            </Button>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  style={{
                    borderColor: 'rgba(219,192,193,0.4)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="rounded-2xl"
                style={{ border: '1px solid rgba(219,192,193,0.2)' }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold" style={{ color: '#3d000c' }}>
                    Delete Recipe
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm" style={{ color: '#554243' }}>
                    Are you sure you want to delete{' '}
                    <span className="font-semibold" style={{ color: '#3d000c' }}>
                      {recipe.name}
                    </span>
                    ? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel
                    className="rounded-full"
                    style={{ borderColor: 'rgba(219,192,193,0.3)', color: '#44151c' }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* Small fork/knife icon for preparation header */
function UtensilsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#44151c"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
