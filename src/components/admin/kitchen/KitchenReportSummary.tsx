'use client';

import { Sun, Sunset, Moon, UtensilsCrossed, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { KitchenReportSummary as SummaryType } from '@/api/admin-kitchen.api';

interface KitchenReportSummaryProps {
  summary?: SummaryType;
  combined_summary?: Record<string, number>;
  operationalHours?: {
    breakfast: { start_time: string; end_time: string };
    lunch: { start_time: string; end_time: string };
    dinner: { start_time: string; end_time: string };
  };
  loading?: boolean;
}

type SlotKey = 'breakfast' | 'lunch' | 'dinner';

interface SlotMeta {
  label: string;
  icon: React.ReactNode;
  tone: string;
  ring: string;
}

const SLOT_META: Record<SlotKey, SlotMeta> = {
  breakfast: {
    label: 'Breakfast',
    icon: <Sun className="h-4 w-4" />,
    tone: 'text-amber-700',
    ring: 'ring-amber-100',
  },
  lunch: {
    label: 'Lunch',
    icon: <Sunset className="h-4 w-4" />,
    tone: 'text-orange-700',
    ring: 'ring-orange-100',
  },
  dinner: {
    label: 'Dinner',
    icon: <Moon className="h-4 w-4" />,
    tone: 'text-indigo-700',
    ring: 'ring-indigo-100',
  },
};

function SlotMiniCard({
  slotKey,
  count,
  hours,
  loading,
}: {
  slotKey: SlotKey;
  count: number;
  hours?: { start_time: string; end_time: string };
  loading?: boolean;
}) {
  const meta = SLOT_META[slotKey];

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5">
        <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5">
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted ring-1',
          meta.ring,
          meta.tone,
        )}
      >
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {meta.label}
        </p>
        <p className="text-lg font-bold leading-tight text-foreground">{count}</p>
        {hours && (
          <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {hours.start_time}–{hours.end_time}
          </p>
        )}
      </div>
    </div>
  );
}

export function KitchenReportSummary({
  summary,
  combined_summary,
  operationalHours,
  loading,
}: KitchenReportSummaryProps) {
  const total = combined_summary?.total ?? summary?.total ?? 0;
  const breakfast = combined_summary?.breakfast_count ?? summary?.breakfast_count ?? 0;
  const lunch = combined_summary?.lunch_count ?? summary?.lunch_count ?? 0;
  const dinner = combined_summary?.dinner_count ?? summary?.dinner_count ?? 0;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        {/* Total meals — left side */}
        <div className="flex items-center gap-3 lg:w-48 lg:shrink-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-20" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold leading-none tracking-tight text-foreground">
                  {total}
                </p>
                <p className="text-xs text-muted-foreground">
                  total meal{total === 1 ? '' : 's'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Slot mini-cards — right side */}
        <div className="grid flex-1 grid-cols-3 gap-3">
          <SlotMiniCard
            slotKey="breakfast"
            count={breakfast}
            hours={operationalHours?.breakfast}
            loading={loading}
          />
          <SlotMiniCard
            slotKey="lunch"
            count={lunch}
            hours={operationalHours?.lunch}
            loading={loading}
          />
          <SlotMiniCard
            slotKey="dinner"
            count={dinner}
            hours={operationalHours?.dinner}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
