'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { TemplateCard } from '@/components/admin/templates/TemplateCard';
import { NewTemplateCard } from '@/components/admin/templates/NewTemplateCard';
import { OutletTemplateSelector } from '@/components/admin/templates/OutletTemplateSelector';
import { WeeklyGrid } from '@/components/admin/templates/WeeklyGrid';
import { TemplateEditDialog } from '@/components/admin/templates/TemplateEditDialog';
import { BulkCopyDialog } from '@/components/admin/templates/BulkCopyDialog';
import { WeekDay, MealType } from '@/api/types/menu.types';
import type { WeeklyMealTemplate, TemplateSummary } from '@/api/types/menu.types';

// Static mock data for UI preview
const MOCK_TEMPLATES: TemplateSummary[] = [
  {
    _id: 'tmpl-001',
    name: 'Week 1 - Veg Plan',
    status: 'active',
    scope: 'Global',
    mealsMapped: 21,
    updatedAt: 'Oct 12, 2023',
  },
  {
    _id: 'tmpl-002',
    name: 'High Protein Elite',
    status: 'active',
    scope: 'Global',
    mealsMapped: 21,
    updatedAt: 'Oct 10, 2023',
  },
  {
    _id: 'tmpl-003',
    name: 'Festive Special Week',
    status: 'draft',
    scope: 'Global',
    mealsMapped: 14,
    updatedAt: 'Oct 15, 2023',
  },
  {
    _id: 'tmpl-004',
    name: 'Summer Wellness Week',
    status: 'active',
    scope: 'Chennai Central',
    mealsMapped: 21,
    updatedAt: 'Oct 18, 2023',
  },
  {
    _id: 'tmpl-005',
    name: 'Corporate Standard',
    status: 'draft',
    scope: 'Anna Nagar',
    mealsMapped: 18,
    updatedAt: 'Oct 20, 2023',
  },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TemplatesPage() {
  const [outletId, setOutletId] = useState('');
  const [currentMonday] = useState<Date>(() => getMonday(new Date()));

  // List view state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [outletFilter, setOutletFilter] = useState<string>('all');

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editDay, setEditDay] = useState<WeekDay | null>(null);
  const [editMealType, setEditMealType] = useState<MealType | null>(null);
  const [editExisting, setEditExisting] = useState<WeeklyMealTemplate | undefined>(undefined);

  const [bulkCopyOpen, setBulkCopyOpen] = useState(false);

  // Detail view metadata form state
  const [templateName, setTemplateName] = useState('');
  const [targetOutlet, setTargetOutlet] = useState('');
  const [templateStatus, setTemplateStatus] = useState<'active' | 'draft'>('draft');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const effectiveFrom = useMemo(() => currentMonday.toISOString().split('T')[0], [currentMonday]);

  // Filter mock templates
  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesOutlet = outletFilter === 'all' || t.scope === outletFilter;
      return matchesSearch && matchesStatus && matchesOutlet;
    });
  }, [search, statusFilter, outletFilter]);

  const handleOutletChange = useCallback((id: string) => {
    setOutletId(id);
  }, []);

  const handleView = useCallback((id: string) => {
    setSelectedTemplateId(id);
    setViewMode('detail');
  }, []);

  const handleEdit = useCallback((id: string) => {
    setSelectedTemplateId(id);
    setViewMode('detail');
    // Could also open edit dialog directly
  }, []);

  const handleDelete = useCallback((id: string) => {
    // In a real app, this would call an API
    console.log('Delete template:', id);
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    console.log('Duplicate template:', id);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplateId(null);
    setViewMode('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedTemplateId(null);
  }, []);

  const handleGridEdit = useCallback((day: WeekDay, mealType: MealType, existing?: WeeklyMealTemplate) => {
    setEditDay(day);
    setEditMealType(mealType);
    setEditExisting(existing);
    setEditOpen(true);
  }, []);

  return (
    <Can
      permission="template:manage"
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-[#3d000c]">Access Denied</h2>
            <p className="text-sm text-[#554243]">
              You do not have permission to manage templates.
            </p>
          </div>
        </div>
      }
    >
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <AdminPageHeader
              title="WEEKLY TEMPLATES"
              subtitle="Manage weekly meal schedules and nutritional distributions"
            />
            <Button
              className="shrink-0 rounded-full px-6 text-sm font-semibold"
              style={{ backgroundColor: '#44151c', color: '#fff' }}
              onClick={handleCreateTemplate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          {/* Filter Bar */}
          <div
            className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-center"
            style={{
              borderColor: 'rgba(219,192,193,0.2)',
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}
          >
            {/* Search */}
            <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
              <Input
                placeholder="Search templates by name or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Outlet Filter */}
              <Select value={outletFilter} onValueChange={setOutletFilter}>
                <SelectTrigger className="w-full rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-36">
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                  <SelectItem value="Anna Nagar">Anna Nagar</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm sm:w-36">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter icon button */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(219,192,193,0.3)] bg-white text-[#554243] transition-colors hover:bg-[#f8f5f5]"
                title="More filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
            <NewTemplateCard onClick={handleCreateTemplate} />
          </div>
        </div>
      ) : (
        /* Detail / Edit View */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <button
                onClick={handleBackToList}
                className="mb-2 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: '#554243' }}
              >
                ← Back to Templates
              </button>
              <AdminPageHeader
                title="WEEKLY TEMPLATES"
                subtitle="Manage weekly meal schedules and nutritional distributions"
              />
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className="rounded-full border-[rgba(219,192,193,0.3)] bg-white px-6 text-sm font-semibold"
                style={{ color: '#554243' }}
              >
                Save as Draft
              </Button>
              <Button
                className="rounded-full px-6 text-sm font-semibold"
                style={{ backgroundColor: '#44151c', color: '#fff' }}
              >
                Publish Template
              </Button>
            </div>
          </div>

          {/* Template Metadata Card */}
          <div
            className="rounded-xl border p-4 sm:p-6"
            style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              {/* Template Name */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#554243' }}
                >
                  TEMPLATE NAME
                </label>
                <Input
                  placeholder="e.g., Summer Wellness Week 04"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
                />
              </div>

              {/* Target Outlet */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#554243' }}
                >
                  TARGET OUTLET
                </label>
                <Select value={targetOutlet} onValueChange={setTargetOutlet}>
                  <SelectTrigger className="rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central-south">Central Kitchen - South</SelectItem>
                    <SelectItem value="chennai-central">Chennai Central</SelectItem>
                    <SelectItem value="anna-nagar">Anna Nagar</SelectItem>
                    <SelectItem value="adyar">Adyar Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: '#554243' }}
                >
                  STATUS
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTemplateStatus('active')}
                    className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                    style={{
                      backgroundColor:
                        templateStatus === 'active'
                          ? 'rgba(0,153,15,0.12)'
                          : 'rgba(85,66,67,0.08)',
                      color: templateStatus === 'active' ? '#00990f' : '#554243',
                    }}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setTemplateStatus('draft')}
                    className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                    style={{
                      backgroundColor:
                        templateStatus === 'draft'
                          ? 'rgba(217,119,6,0.12)'
                          : 'rgba(85,66,67,0.08)',
                      color: templateStatus === 'draft' ? '#d97706' : '#554243',
                    }}
                  >
                    Draft
                  </button>
                </div>
              </div>

              {/* Copy Template */}
              <div className="flex items-end justify-start lg:justify-end">
                <button
                  onClick={() => {
                    setCopiedTemplate(true);
                    setTimeout(() => setCopiedTemplate(false), 1500);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ color: '#44151c' }}
                >
                  {copiedTemplate ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div
            className="rounded-xl bg-white p-4 sm:p-6"
            style={{ border: '1px solid rgba(219,192,193,0.2)' }}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: '#3d000c' }}
                >
                  WEEKLY SCHEDULE
                </h3>
                <div className="hidden h-4 w-px bg-[rgba(219,192,193,0.4)] sm:block" />
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-70"
                  style={{ color: '#44151c' }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Bulk Assign
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-70"
                  style={{ color: '#44151c' }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Entire Week
                </button>
              </div>
              <div className="relative w-full sm:w-auto sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
                <Input
                  placeholder="Quick find recipe..."
                  className="pl-10 rounded-xl border-[rgba(219,192,193,0.3)] bg-[#f8f5f5] text-sm"
                />
              </div>
            </div>
            <WeeklyGrid
              outletId={outletId || 'default'}
              effectiveFrom={effectiveFrom}
              onEdit={handleGridEdit}
            />
          </div>
        </div>
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
    </Can>
  );
}
