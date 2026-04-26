'use client';

import { Sun, Sunset, Moon, UtensilsCrossed, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { KitchenReportSummary } from '@/api/admin-kitchen.api';

interface KitchenSummaryCardsProps {
  summary?: KitchenReportSummary;
  combined_summary?: Record<string, number>;
  loading?: boolean;
}

type Tone = 'breakfast' | 'lunch' | 'dinner' | 'total';

const TONE_STYLES: Record<Tone, string> = {
  breakfast: 'bg-amber-50 text-amber-700 ring-amber-100',
  lunch: 'bg-orange-50 text-orange-700 ring-orange-100',
  dinner: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  total: 'bg-primary/10 text-primary ring-primary/15',
};

interface MealCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  tone: Tone;
  loading?: boolean;
  sub?: string;
}

function MealCard({ label, count, icon, tone, loading, sub }: MealCardProps) {
  if (loading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">{count}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
              TONE_STYLES[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KitchenSummaryCards({ summary, combined_summary, loading }: KitchenSummaryCardsProps) {
  const total = summary?.total ?? 0;
  const breakfast = summary?.breakfast_count ?? 0;
  const lunch = summary?.lunch_count ?? 0;
  const dinner = summary?.dinner_count ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MealCard
          label="Breakfast"
          count={breakfast}
          icon={<Sun className="h-4 w-4" />}
          tone="breakfast"
          loading={loading}
          sub={breakfast === 0 ? 'No meals' : 'meals to prep'}
        />
        <MealCard
          label="Lunch"
          count={lunch}
          icon={<Sunset className="h-4 w-4" />}
          tone="lunch"
          loading={loading}
          sub={lunch === 0 ? 'No meals' : 'meals to prep'}
        />
        <MealCard
          label="Dinner"
          count={dinner}
          icon={<Moon className="h-4 w-4" />}
          tone="dinner"
          loading={loading}
          sub={dinner === 0 ? 'No meals' : 'meals to prep'}
        />
        <MealCard
          label="Total Meals"
          count={total}
          icon={<UtensilsCrossed className="h-4 w-4" />}
          tone="total"
          loading={loading}
          sub={total === 0 ? 'Nothing scheduled' : 'across all slots'}
        />
      </div>

      {combined_summary && (
        <Card className="border-border/70 bg-muted/20 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
                <Layers className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Combined (Daily + Add-ons)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <CombinedStat
                label="Breakfast"
                count={combined_summary.breakfast_count ?? 0}
                icon={<Sun className="h-3.5 w-3.5" />}
                tone="breakfast"
                loading={loading}
              />
              <CombinedStat
                label="Lunch"
                count={combined_summary.lunch_count ?? 0}
                icon={<Sunset className="h-3.5 w-3.5" />}
                tone="lunch"
                loading={loading}
              />
              <CombinedStat
                label="Dinner"
                count={combined_summary.dinner_count ?? 0}
                icon={<Moon className="h-3.5 w-3.5" />}
                tone="dinner"
                loading={loading}
              />
              <CombinedStat
                label="Total"
                count={combined_summary.total ?? 0}
                icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
                tone="total"
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CombinedStatProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  tone: Tone;
  loading?: boolean;
}

function CombinedStat({ label, count, icon, tone, loading }: CombinedStatProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5">
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
          TONE_STYLES[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-5 w-10" />
        ) : (
          <p className="text-base font-bold leading-tight text-foreground">{count}</p>
        )}
      </div>
    </div>
  );
}
