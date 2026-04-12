'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { OutletTemplateSelector } from '@/components/admin/templates/OutletTemplateSelector';
import { WeeklyGrid } from '@/components/admin/templates/WeeklyGrid';
import { TemplateEditDialog } from '@/components/admin/templates/TemplateEditDialog';
import { BulkCopyDialog } from '@/components/admin/templates/BulkCopyDialog';
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

export default function TemplatesPage() {
  const [outletId, setOutletId] = useState('');
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));

  const [editOpen, setEditOpen] = useState(false);
  const [editDay, setEditDay] = useState<WeekDay | null>(null);
  const [editMealType, setEditMealType] = useState<MealType | null>(null);
  const [editExisting, setEditExisting] = useState<WeeklyMealTemplate | undefined>(undefined);

  const [bulkCopyOpen, setBulkCopyOpen] = useState(false);

  const effectiveFrom = useMemo(() => currentMonday.toISOString().split('T')[0], [currentMonday]);

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meal Templates</h1>
            <p className="text-sm text-muted-foreground">
              Plan weekly menus for each outlet
            </p>
          </div>
          <OutletTemplateSelector onOutletChange={handleOutletChange} />
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatWeekRange(currentMonday)}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkCopyOpen(true)}
            disabled={!outletId}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Bulk Copy
          </Button>
        </div>

        {/* Grid */}
        {outletId ? (
          <WeeklyGrid
            outletId={outletId}
            effectiveFrom={effectiveFrom}
            onEdit={handleEdit}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
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
