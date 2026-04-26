'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Copy,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  ChefHat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Can } from '@/components/Auth/can';
import { OutletTemplateSelector } from '@/components/admin/templates/OutletTemplateSelector';
import { WeeklyGrid } from '@/components/admin/templates/WeeklyGrid';
import { TemplateEditDialog } from '@/components/admin/templates/TemplateEditDialog';
import { BulkCopyDialog } from '@/components/admin/templates/BulkCopyDialog';
import { useWeeklyGrid } from '@/api/hooks/useTemplates';
import { WeekDay, MealType } from '@/api/types/menu.types';
import type { WeeklyMealTemplate } from '@/api/types/menu.types';

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-IN', opts)} – ${sunday.toLocaleDateString('en-IN', opts)}`;
}

const TOTAL_SLOTS = 21; // 7 days x 3 meal types

export default function TemplatesPage() {
  const [outletId, setOutletId] = useState('');
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));

  const [editOpen, setEditOpen] = useState(false);
  const [editDay, setEditDay] = useState<WeekDay | null>(null);
  const [editMealType, setEditMealType] = useState<MealType | null>(null);
  const [editExisting, setEditExisting] = useState<WeeklyMealTemplate | undefined>(undefined);

  const [bulkCopyOpen, setBulkCopyOpen] = useState(false);

  const effectiveFrom = useMemo(() => currentMonday.toISOString().split('T')[0], [currentMonday]);

  const { data: templates } = useWeeklyGrid(outletId, effectiveFrom);

  const stats = useMemo(() => {
    const list = templates || [];
    const filled = list.filter((t) => t.veg_recipe_id || t.nonveg_recipe_id).length;
    const published = list.filter((t) => t.is_published).length;
    const empty = TOTAL_SLOTS - filled;
    const coverage = TOTAL_SLOTS > 0 ? Math.round((filled / TOTAL_SLOTS) * 100) : 0;
    return { filled, published, empty, coverage };
  }, [templates]);

  const isCurrentWeek = useMemo(() => {
    const today = getMonday(new Date());
    return today.getTime() === currentMonday.getTime();
  }, [currentMonday]);

  const handlePrevWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const handleEdit = useCallback((day: WeekDay, mealType: MealType, existing?: WeeklyMealTemplate) => {
    setEditDay(day);
    setEditMealType(mealType);
    setEditExisting(existing);
    setEditOpen(true);
  }, []);

  const handleOutletChange = useCallback((id: string) => {
    setOutletId(id);
  }, []);

  return (
    <Can permission="template:manage" fallback={<p className="p-8 text-muted-foreground">Access denied.</p>}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <ChefHat className="h-4.5 w-4.5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Meal Templates</h1>
                <p className="text-sm text-muted-foreground">
                  Plan weekly menus per outlet. Drafts go live when published.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkCopyOpen(true)}
              disabled={!outletId}
              className="h-9"
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Bulk Copy
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarRange className="h-4 w-4" />}
            label="Filled Slots"
            value={`${stats.filled}/${TOTAL_SLOTS}`}
            tone="primary"
            disabled={!outletId}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Published"
            value={`${stats.published}`}
            sub={stats.published > 0 ? 'Live to customers' : 'None live yet'}
            tone="success"
            disabled={!outletId}
          />
          <StatCard
            icon={<CircleDashed className="h-4 w-4" />}
            label="Empty Slots"
            value={`${stats.empty}`}
            sub={stats.empty === 0 ? 'Fully planned' : 'Awaiting meals'}
            tone="warning"
            disabled={!outletId}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="Week Coverage"
            value={`${stats.coverage}%`}
            sub={
              stats.coverage === 100
                ? 'Complete'
                : stats.coverage >= 60
                  ? 'On track'
                  : 'Needs attention'
            }
            tone="accent"
            disabled={!outletId}
            progress={stats.coverage}
          />
        </div>

        {/* Toolbar */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <OutletTemplateSelector onOutletChange={handleOutletChange} />
            </div>
            <Separator orientation="vertical" className="hidden h-9 lg:block" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevWeek}
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatWeekRange(currentMonday)}
                  {isCurrentWeek && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 border-0 bg-primary/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                    >
                      Now
                    </Badge>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextWeek}
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-9">
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        {outletId ? (
          <WeeklyGrid
            outletId={outletId}
            effectiveFrom={effectiveFrom}
            currentMonday={currentMonday}
            onEdit={handleEdit}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Select an outlet to begin</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an outlet from the toolbar above to plan its weekly menu.
                </p>
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        {editDay && editMealType && (
          <TemplateEditDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            outletId={outletId}
            dayOfWeek={editDay}
            mealType={editMealType}
            effectiveFrom={effectiveFrom}
            existing={editExisting}
          />
        )}

        {/* Bulk Copy Dialog */}
        {outletId && (
          <BulkCopyDialog
            open={bulkCopyOpen}
            onOpenChange={setBulkCopyOpen}
            outletId={outletId}
            currentEffectiveFrom={effectiveFrom}
          />
        )}
      </div>
    </Can>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'accent';
  disabled?: boolean;
  progress?: number;
}

function StatCard({ icon, label, value, sub, tone, disabled, progress }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-amber-600 ring-warning/20',
    accent: 'bg-accent/30 text-accent-foreground ring-accent/40',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
              {disabled ? '—' : value}
            </p>
            {sub && !disabled && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${toneStyles[tone]}`}>
            {icon}
          </span>
        </div>
        {progress !== undefined && !disabled && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
