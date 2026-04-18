'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Building2, Route, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Auth/can';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useOutletRoutes, useGenerateRoutes } from '@/api/hooks/useAdminRoutes';
import { UserRole } from '@/api/types/user.types';
import { RouteList } from '@/components/admin/routes/RouteList';

export default function RoutesPage() {
  const user = useCurrentUser();
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  // For non-super-admin users (Hub Owners, Outlet Admins), pre-select their assigned outlet
  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  // Auto-select first outlet for admin/super-admin when list loads
  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: routesData, isLoading: routesLoading } = useOutletRoutes(selectedOutletId, dateParam);

  const generateRoutes = useGenerateRoutes(selectedOutletId ?? '');

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedOutletId || !dateParam) return;
    generateRoutes.mutate({ date: dateParam });
  }, [selectedOutletId, dateParam, generateRoutes]);

  if (!isSuperAdmin && !selectedOutletId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Routes</h1>
          <p className="text-sm text-muted-foreground">Loading outlet information...</p>
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Routes</h1>
        <p className="text-sm text-muted-foreground">
          Plan and manage delivery routes, assign drivers, and optimize delivery schedules.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Outlet Selector - only for users who can view any outlet */}
        {canViewAnyOutlet && (
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {outletsLoading ? (
              <Skeleton className="h-10 w-64" />
            ) : (
              <Select
                value={selectedOutletId ?? ''}
                onValueChange={handleOutletChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select an outlet" />
                </SelectTrigger>
                <SelectContent>
                  {(outletsData?.data || []).map((outlet) => (
                    <SelectItem key={outlet._id} value={outlet._id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Date Picker */}
        <DatePicker
          date={selectedDate}
          onDateChange={setSelectedDate}
          placeholder="Select date"
          className="w-56"
        />

        {/* Generate Routes */}
        <Can permission="route:generate">
          <Button
            onClick={handleGenerate}
            disabled={!selectedOutletId || !dateParam || generateRoutes.isPending}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {generateRoutes.isPending ? 'Generating...' : 'Generate Routes'}
          </Button>
        </Can>
      </div>

      {/* Route List */}
      <RouteList
        routes={routesData || []}
        outletId={selectedOutletId ?? ''}
        isLoading={routesLoading}
      />
    </div>
  );
}
