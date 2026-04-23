'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Sunrise, Sun, Moon } from 'lucide-react';

interface KitchenCorporateSummaryProps {
  corporate_summary?: Record<string, number>;
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

export function KitchenCorporateSummary({ corporate_summary, loading }: KitchenCorporateSummaryProps) {
  if (!corporate_summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MealCard
        title="Corporate Breakfast"
        count={corporate_summary.breakfast_count ?? 0}
        icon={<Sunrise className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <MealCard
        title="Corporate Lunch"
        count={corporate_summary.lunch_count ?? 0}
        icon={<Sun className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <MealCard
        title="Corporate Dinner"
        count={corporate_summary.dinner_count ?? 0}
        icon={<Moon className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <MealCard
        title="Corporate Total"
        count={corporate_summary.total ?? 0}
        icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
    </div>
  );
}
