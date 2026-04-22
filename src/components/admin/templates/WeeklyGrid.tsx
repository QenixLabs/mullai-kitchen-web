'use client';

import { Plus, Pencil, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeeklyGrid } from '@/api/hooks/useTemplates';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { WeekDay, MealType } from '@/api/types/menu.types';
import type { WeeklyMealTemplate } from '@/api/types/menu.types';

const DAYS: WeekDay[] = [
  WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY,
  WeekDay.THURSDAY, WeekDay.FRIDAY, WeekDay.SATURDAY, WeekDay.SUNDAY,
];
const MEALS: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];

const DAY_LABELS: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: 'Monday',
  [WeekDay.TUESDAY]: 'Tuesday',
  [WeekDay.WEDNESDAY]: 'Wednesday',
  [WeekDay.THURSDAY]: 'Thursday',
  [WeekDay.FRIDAY]: 'Friday',
  [WeekDay.SATURDAY]: 'Saturday',
  [WeekDay.SUNDAY]: 'Sunday',
};

const MEAL_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'BREAKFAST',
  [MealType.LUNCH]: 'LUNCH',
  [MealType.DINNER]: 'DINNER',
};

interface WeeklyGridProps {
  outletId: string;
  effectiveFrom: string;
  onEdit: (day: WeekDay, mealType: MealType, existing?: WeeklyMealTemplate) => void;
}

// Static mock recipe data for UI preview when API returns empty
const MOCK_RECIPES: Record<string, { name: string; tag: string; tagColor: string; time: string }> = {
  'veg-mon-bf': { name: 'Avocado Smash with Poached Egg', tag: 'BREAKFAST', tagColor: '#dbeafe', time: '15 min' },
  'nonveg-mon-ln': { name: 'Mullai Signature Salmon Bowl', tag: 'HEALTHY', tagColor: '#fce7f3', time: '30 min' },
  'veg-tue-bf': { name: 'Avocado Smash with Poached Egg', tag: 'BREAKFAST', tagColor: '#dbeafe', time: '15 min' },
  'nonveg-tue-ln': { name: 'Mullai Signature Salmon Bowl', tag: 'HEALTHY', tagColor: '#fce7f3', time: '30 min' },
  'veg-wed-bf': { name: 'Avocado Smash with Poached Egg', tag: 'BREAKFAST', tagColor: '#dbeafe', time: '15 min' },
  'nonveg-wed-ln': { name: 'Mullai Signature Salmon Bowl', tag: 'HEALTHY', tagColor: '#fce7f3', time: '30 min' },
};

function RecipeSlot({
  day,
  meal,
  template,
  recipeName,
  onEdit,
}: {
  day: WeekDay;
  meal: MealType;
  template?: WeeklyMealTemplate;
  recipeName?: string | null;
  onEdit: (day: WeekDay, meal: MealType, existing?: WeeklyMealTemplate) => void;
}) {
  const hasContent = recipeName;
  const mockKey = `${day}-${meal}`;
  const mockRecipe = MOCK_RECIPES[mockKey];

  if (!hasContent && !mockRecipe) {
    return (
      <button
        onClick={() => onEdit(day, meal, template)}
        className="flex h-full min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors hover:bg-[#f8f5f5]"
        style={{ borderColor: 'rgba(219,192,193,0.4)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}
        >
          <Plus className="h-4 w-4" style={{ color: '#554243' }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#554243' }}>
          SELECT RECIPE
        </span>
      </button>
    );
  }

  const displayName = recipeName || mockRecipe?.name || 'Recipe';
  const tag = mockRecipe?.tag || meal;
  const tagColor = mockRecipe?.tagColor || 'rgba(68,21,28,0.08)';
  const time = mockRecipe?.time || '20 min';

  return (
    <div
      className="relative flex h-full min-h-[100px] items-start gap-3 rounded-2xl border p-3 transition-colors hover:bg-[#f8f5f5]"
      style={{ borderColor: 'rgba(219,192,193,0.15)' }}
    >
      {/* Food image */}
      <div
        className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundColor: '#f0eaea' }}
      >
        <img
          src="/images/admin/Gourmet Salad (1).png"
          alt="Recipe"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight" style={{ color: '#3d000c' }}>
          {displayName}
        </p>
        <span
          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: tagColor, color: '#44151c' }}
        >
          {tag}
        </span>
        <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: '#554243' }}>
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>

      {/* Edit button */}
      <button
        onClick={() => onEdit(day, meal, template)}
        className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-lg text-[#554243] transition-colors hover:bg-[#f0eaea]"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function WeeklyGrid({ outletId, effectiveFrom, onEdit }: WeeklyGridProps) {
  const { data: templates, isLoading: templatesLoading } = useWeeklyGrid(outletId, effectiveFrom);
  const { data: recipes } = useRecipeSelect(outletId);

  // Build recipe name lookup
  const recipeNames = new Map<string, string>();
  (recipes || []).forEach((r) => recipeNames.set(r._id, r.name));

  // Organize templates by day+meal
  const templateMap = new Map<string, WeeklyMealTemplate>();
  (templates || []).forEach((t) => {
    templateMap.set(`${t.day_of_week}-${t.meal_type}`, t);
  });

  const getRecipeName = (id?: string) => {
    if (!id) return null;
    return recipeNames.get(id) || id;
  };

  if (templatesLoading) {
    return (
      <div className="space-y-4">
        {DAYS.slice(0, 3).map((day) => (
          <div key={day} className="grid grid-cols-4 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header Row */}
      <div className="grid grid-cols-4 gap-3 px-3 pb-2">
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: '#554243' }}
        >
          DAY OF WEEK
        </span>
        {MEALS.map((meal) => (
          <span
            key={meal}
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: '#554243' }}
          >
            {MEAL_LABELS[meal]}
          </span>
        ))}
      </div>

      {/* Day Rows */}
      {DAYS.map((day) => (
        <div
          key={day}
          className="grid grid-cols-4 items-start gap-3 rounded-2xl bg-white p-3"
          style={{ border: '1px solid rgba(219,192,193,0.1)' }}
        >
          {/* Day label */}
          <div className="flex h-full items-center py-4">
            <span className="text-lg font-bold" style={{ color: '#3d000c' }}>
              {DAY_LABELS[day]}
            </span>
          </div>

          {/* Meal slots */}
          {MEALS.map((meal) => {
            const key = `${day}-${meal}`;
            const template = templateMap.get(key);
            const vegName = getRecipeName(template?.veg_recipe_id);
            const nonvegName = getRecipeName(template?.nonveg_recipe_id);
            const recipeName = vegName || nonvegName;

            return (
              <RecipeSlot
                key={key}
                day={day}
                meal={meal}
                template={template}
                recipeName={recipeName}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
