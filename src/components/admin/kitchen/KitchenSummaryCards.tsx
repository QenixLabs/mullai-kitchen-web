'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sunrise, Sun, Moon, UtensilsCrossed } from 'lucide-react';
import type { KitchenReportSummary } from '@/api/admin-kitchen.api';

interface KitchenSummaryCardsProps {
  summary?: KitchenReportSummary;
  combined_summary?: Record<string, number>;
  loading?: boolean;
}

interface MealCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function MealCard({ title, count, icon, loading }: MealCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-12" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}

export function KitchenSummaryCards({ summary, combined_summary, loading }: KitchenSummaryCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MealCard
          title="Breakfast"
          count={summary?.breakfast_count ?? 0}
          icon={<Sunrise className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MealCard
          title="Lunch"
          count={summary?.lunch_count ?? 0}
          icon={<Sun className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MealCard
          title="Dinner"
          count={summary?.dinner_count ?? 0}
          icon={<Moon className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MealCard
          title="Total Meals"
          count={summary?.total ?? 0}
          icon={<UtensilsCrossed className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {combined_summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MealCard
            title="Combined Breakfast"
            count={combined_summary.breakfast_count ?? 0}
            icon={<Sunrise className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
          />
          <MealCard
            title="Combined Lunch"
            count={combined_summary.lunch_count ?? 0}
            icon={<Sun className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
          />
          <MealCard
            title="Combined Dinner"
            count={combined_summary.dinner_count ?? 0}
            icon={<Moon className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
          />
          <MealCard
            title="Combined Total"
            count={combined_summary.total ?? 0}
            icon={<UtensilsCrossed className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
