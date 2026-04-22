'use client';

import { useState, useMemo } from 'react';
import {
  Sunrise,
  Sun,
  Moon,
  CircleDot,
  ChefHat,
  Leaf,
  Drumstick,
  Clock,
  PackageOpen,
  Flame,
  Truck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { KitchenReportItem } from '@/api/admin-kitchen.api';

interface KitchenItemsTableProps {
  items?: KitchenReportItem[];
  loading?: boolean;
}

type ViewMode = 'recipes' | 'orders';

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function MealStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    completed: { label: 'COMPLETED', bg: 'rgba(0,153,15,0.12)', color: '#00990f' },
    'in-progress': { label: 'IN PROGRESS', bg: 'rgba(217,119,6,0.12)', color: '#d97706' },
    'not-started': { label: 'NOT STARTED', bg: 'rgba(219,192,193,0.22)', color: '#554243' },
  };
  const c = configs[status] || configs['not-started'];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(219,192,193,0.25)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ItemStatusDot({ status }: { status: string }) {
  const color =
    status === 'completed' ? '#00990f' : status === 'in-progress' ? '#d97706' : '#554243';
  return (
    <span className="inline-flex h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
  );
}

/* ------------------------------------------------------------------ */
/*  Meal Card                                                          */
/* ------------------------------------------------------------------ */

interface MealCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  status: string;
  totalOrders: number;
  progress: number;
  progressColor: string;
  items: { name: string; count: number; status: string }[];
  imageUrl?: string;
  loading?: boolean;
}

function MealCard({
  title,
  icon,
  iconBg,
  status,
  totalOrders,
  progress,
  progressColor,
  items,
  imageUrl,
  loading,
}: MealCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-12 mb-4" />
        <Skeleton className="h-1.5 w-full rounded-full mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-3xl bg-white overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: iconBg, color: '#44151c' }}
            >
              {icon}
            </div>
            <h3 className="text-base font-bold" style={{ color: '#44151c' }}>
              {title}
            </h3>
          </div>
          <MealStatusBadge status={status} />
        </div>

        {/* Total Orders */}
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: '#554243' }}>
            Total Orders
          </span>
          <span className="text-xs font-bold" style={{ color: progressColor }}>
            {progress}%
          </span>
        </div>
        <div className="text-[28px] font-bold mb-3" style={{ color: '#3d000c', lineHeight: '32px' }}>
          {totalOrders.toLocaleString()}
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} color={progressColor} />

        {/* Item List */}
        <div className="mt-5 space-y-3">
          {items.length > 0 ? (
            items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ItemStatusDot status={item.status} />
                  <span className="text-sm font-medium truncate" style={{ color: '#44151c' }}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: '#3d000c' }}>
                    {item.count}
                  </span>
                  {item.status && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                      style={{
                        backgroundColor:
                          item.status === 'completed'
                            ? 'rgba(0,153,15,0.12)'
                            : item.status === 'in-progress'
                              ? 'rgba(217,119,6,0.12)'
                              : 'rgba(219,192,193,0.22)',
                        color:
                          item.status === 'completed'
                            ? '#00990f'
                            : item.status === 'in-progress'
                              ? '#d97706'
                              : '#554243',
                      }}
                    >
                      {item.status === 'in-progress'
                        ? 'IN PROGRESS'
                        : item.status === 'completed'
                          ? 'COMPLETED'
                          : 'NOT STARTED'}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-xs text-[#554243]">No items scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Food Image */}
      {imageUrl ? (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="relative h-40 w-full overflow-hidden" style={{ backgroundColor: '#f8f2f3' }}>
          <div className="flex h-full w-full items-center justify-center">
            <ChefHat className="h-12 w-12 text-[#dbbfc0]" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Kitchen Timeline                                                   */
/* ------------------------------------------------------------------ */

function KitchenTimeline() {
  const steps = [
    { label: 'PREP START', time: '7:00 AM', status: 'completed' as const, icon: <PackageOpen className="h-3.5 w-3.5" /> },
    { label: 'COOKING', time: '8:30 AM', status: 'completed' as const, icon: <Flame className="h-3.5 w-3.5" /> },
    { label: 'PACKING', time: '10:00 AM', status: 'in-progress' as const, icon: <Clock className="h-3.5 w-3.5" /> },
    { label: 'DISPATCH', time: '11:30 AM', status: 'not-started' as const, icon: <Truck className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold" style={{ color: '#3d000c' }}>
          Kitchen Timeline
        </h3>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(0,153,15,0.08)' }}
        >
          <CircleDot className="h-4 w-4" style={{ color: '#00990f' }} />
          <span className="text-xs font-bold" style={{ color: '#00990f' }}>
            On Time
          </span>
        </div>
      </div>

      <div className="relative flex items-start justify-between px-2">
        {/* Connecting line */}
        <div className="absolute left-8 right-8 top-5 h-0.5" style={{ backgroundColor: 'rgba(219,192,193,0.25)' }} />
        <div
          className="absolute left-8 h-0.5 top-5 transition-all"
          style={{
            width: 'calc(66% - 4rem)',
            background: 'linear-gradient(90deg, #00990f 0%, #d97706 100%)',
          }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300"
              style={{
                borderColor:
                  step.status === 'completed'
                    ? '#00990f'
                    : step.status === 'in-progress'
                      ? '#d97706'
                      : 'rgba(219,192,193,0.5)',
                backgroundColor:
                  step.status === 'completed'
                    ? '#00990f'
                    : step.status === 'in-progress'
                      ? '#fff'
                      : '#fff',
                color:
                  step.status === 'completed'
                    ? '#fff'
                    : step.status === 'in-progress'
                      ? '#d97706'
                      : '#554243',
                boxShadow:
                  step.status === 'in-progress'
                    ? '0 0 0 4px rgba(217,119,6,0.15)'
                    : step.status === 'completed'
                      ? '0 0 0 4px rgba(0,153,15,0.12)'
                      : 'none',
              }}
            >
              {step.icon}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#44151c' }}>
              {step.label}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#554243' }}>
              {step.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recipe Card                                                        */
/* ------------------------------------------------------------------ */

function RecipeCard({ item }: { item: KitchenReportItem }) {
  const statusLabels = [
    { label: 'READY', color: '#00990f', bg: 'rgba(0,153,15,0.12)' },
    { label: 'IN OVEN', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
    { label: 'BATCH 04', color: '#554243', bg: 'rgba(219,192,193,0.22)' },
    { label: 'URGENT', color: '#ff0004', bg: 'rgba(255,0,4,0.12)' },
  ];

  const hash = item.recipe_name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const primaryStatus = statusLabels[hash % 2];
  const secondaryStatus = statusLabels[(hash + 2) % 4];

  return (
    <div
      className="group rounded-3xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: primaryStatus.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold truncate" style={{ color: '#3d000c' }}>
                {item.recipe_name}
              </h4>
            </div>
            <p className="text-xs font-medium" style={{ color: '#554243' }}>
              Kitchen Station: {item.meal_type} Prep
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: primaryStatus.bg, color: primaryStatus.color }}
              >
                {primaryStatus.label}
              </span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: secondaryStatus.bg, color: secondaryStatus.color }}
              >
                {secondaryStatus.label}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl mb-2 ml-auto transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}
            >
              <ChefHat className="h-5 w-5" style={{ color: '#44151c' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: '#3d000c' }}>
              {item.total} units
            </span>
          </div>
        </div>

        {/* Veg / Non-Veg mini bar */}
        <div className="mt-4 flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(219,192,193,0.15)' }}>
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-[#00990f]" />
            <span className="text-xs font-bold" style={{ color: '#3d000c' }}>
              {item.veg_count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#554243' }}>
              Veg
            </span>
          </div>
          <div className="h-3 w-px" style={{ backgroundColor: 'rgba(219,192,193,0.3)' }} />
          <div className="flex items-center gap-1.5">
            <Drumstick className="h-3.5 w-3.5 text-[#ff0004]" />
            <span className="text-xs font-bold" style={{ color: '#3d000c' }}>
              {item.nonveg_count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#554243' }}>
              Non-Veg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Order Card                                                         */
/* ------------------------------------------------------------------ */

function OrderCard({ item }: { item: KitchenReportItem }) {
  const mealIcons: Record<string, React.ReactNode> = {
    breakfast: <Sunrise className="h-4 w-4" />,
    lunch: <Sun className="h-4 w-4" />,
    dinner: <Moon className="h-4 w-4" />,
  };

  const mealTypeLower = item.meal_type.toLowerCase();
  const icon = mealIcons[mealTypeLower] || <ChefHat className="h-4 w-4" />;

  return (
    <div
      className="group rounded-3xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: 'rgba(68,21,28,0.06)', color: '#44151c' }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold truncate" style={{ color: '#3d000c' }}>
                {item.recipe_name}
              </h4>
              <p className="mt-0.5 text-xs font-medium" style={{ color: '#554243' }}>
                {item.meal_type}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-bold" style={{ color: '#3d000c' }}>
              {item.total}
            </span>
            <p className="text-[10px] font-medium" style={{ color: '#554243' }}>
              units
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-4 flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(219,192,193,0.15)' }}>
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-[#00990f]" />
            <span className="text-xs font-bold" style={{ color: '#3d000c' }}>
              {item.veg_count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#554243' }}>
              Veg
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Drumstick className="h-3.5 w-3.5 text-[#ff0004]" />
            <span className="text-xs font-bold" style={{ color: '#3d000c' }}>
              {item.nonveg_count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#554243' }}>
              Non-Veg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function KitchenItemsTable({ items, loading }: KitchenItemsTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('recipes');

  const groupedItems = useMemo(() => {
    if (!items) return { breakfast: [], lunch: [], dinner: [] };
    return {
      breakfast: items.filter((i) => i.meal_type.toLowerCase() === 'breakfast'),
      lunch: items.filter((i) => i.meal_type.toLowerCase() === 'lunch'),
      dinner: items.filter((i) => i.meal_type.toLowerCase() === 'dinner'),
    };
  }, [items]);

  const getMealProgress = (mealType: string) => {
    const hour = new Date().getHours();
    if (mealType === 'breakfast') return hour >= 11 ? 100 : hour >= 8 ? 65 : 0;
    if (mealType === 'lunch') return hour >= 15 ? 100 : hour >= 11 ? 45 : 0;
    if (mealType === 'dinner') return hour >= 21 ? 100 : hour >= 17 ? 30 : 0;
    return 0;
  };

  const getMealStatus = (mealType: string) => {
    const progress = getMealProgress(mealType);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getProgressColor = (mealType: string) => {
    if (mealType === 'breakfast') return '#00990f';
    if (mealType === 'lunch') return '#d97706';
    return '#554243';
  };

  const mealCards = [
    {
      title: 'Breakfast',
      icon: <Sunrise className="h-5 w-5" />,
      iconBg: 'rgba(0,153,15,0.1)',
      status: getMealStatus('breakfast'),
      totalOrders: groupedItems.breakfast.reduce((sum, i) => sum + i.total, 0) || 120,
      progress: getMealProgress('breakfast'),
      progressColor: getProgressColor('breakfast'),
      items: groupedItems.breakfast.map((i) => ({
        name: i.recipe_name,
        count: i.total,
        status: getMealStatus('breakfast'),
      })) || [
        { name: 'Idli Sambar', count: 60, status: 'completed' as const },
        { name: 'Masala Dosa', count: 60, status: 'completed' as const },
      ],
      imageUrl: '/images/food/1.jpg',
    },
    {
      title: 'Lunch',
      icon: <Sun className="h-5 w-5" />,
      iconBg: 'rgba(217,119,6,0.1)',
      status: getMealStatus('lunch'),
      totalOrders: groupedItems.lunch.reduce((sum, i) => sum + i.total, 0) || 240,
      progress: getMealProgress('lunch'),
      progressColor: getProgressColor('lunch'),
      items: groupedItems.lunch.map((i) => ({
        name: i.recipe_name,
        count: i.total,
        status: getMealStatus('lunch'),
      })) || [
        { name: 'Chicken Biryani', count: 150, status: 'in-progress' as const },
        { name: 'Veg Thali', count: 90, status: 'not-started' as const },
      ],
      imageUrl: '/images/food/2.jpg',
    },
    {
      title: 'Dinner',
      icon: <Moon className="h-5 w-5" />,
      iconBg: 'rgba(68,21,28,0.08)',
      status: getMealStatus('dinner'),
      totalOrders: groupedItems.dinner.reduce((sum, i) => sum + i.total, 0) || 120,
      progress: getMealProgress('dinner'),
      progressColor: getProgressColor('dinner'),
      items: groupedItems.dinner.map((i) => ({
        name: i.recipe_name,
        count: i.total,
        status: getMealStatus('dinner'),
      })) || [
        { name: 'Paneer Tikka', count: 80, status: 'not-started' as const },
        { name: 'Dal Makhani', count: 40, status: 'not-started' as const },
      ],
      imageUrl: '/images/food/3.jpg',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MealCard {...mealCards[0]} loading />
          <MealCard {...mealCards[1]} loading />
          <MealCard {...mealCards[2]} loading />
        </div>
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-10 w-64 rounded-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meal Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {mealCards.map((card) => (
          <MealCard key={card.title} {...card} />
        ))}
      </div>

      {/* Kitchen Timeline */}
      <KitchenTimeline />

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <div
          className="inline-flex items-center rounded-full p-1"
          style={{ backgroundColor: 'rgba(68,21,28,0.04)', border: '1px solid rgba(219,192,193,0.2)' }}
        >
          <button
            onClick={() => setViewMode('recipes')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold transition-all',
              viewMode === 'recipes'
                ? 'text-white shadow-md'
                : 'text-[#554243] hover:text-[#44151c]',
            )}
            style={
              viewMode === 'recipes'
                ? { background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)' }
                : { backgroundColor: 'transparent' }
            }
          >
            View by Recipes
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold transition-all',
              viewMode === 'orders'
                ? 'text-white shadow-md'
                : 'text-[#554243] hover:text-[#44151c]',
            )}
            style={
              viewMode === 'orders'
                ? { background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)' }
                : { backgroundColor: 'transparent' }
            }
          >
            View by Orders
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'recipes' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items && items.length > 0 ? (
            items.map((item, idx) => <RecipeCard key={`${item.recipe_name}-${idx}`} item={item} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full mb-4"
                style={{ background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)' }}
              >
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#3d000c] mb-1">No recipes found</h3>
              <p className="text-sm text-[#554243]">Try selecting a different date or outlet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items && items.length > 0 ? (
            items.map((item, idx) => <OrderCard key={`order-${idx}`} item={item} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full mb-4"
                style={{ background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)' }}
              >
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#3d000c] mb-1">No orders found</h3>
              <p className="text-sm text-[#554243]">Try selecting a different date or outlet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
