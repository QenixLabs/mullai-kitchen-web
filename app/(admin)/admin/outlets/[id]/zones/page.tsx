'use client';

import { use, useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Circle,
  MapPinned,
  Plus,
  RefreshCw,
  Square,
  Store,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';

import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ZoneList } from '@/components/admin/zones/ZoneList';
import { ZoneEditor } from '@/components/admin/zones/ZoneEditor';
import {
  type DeliveryZone,
  type CreateZonePayload,
  adminDeliveryZoneApi,
} from '@/api/delivery-zone.api';
import { outletApi } from '@/api/outlet.api';
import type { Outlet } from '@/api/outlet.api';

export default function OutletZonesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: outletId } = use(params);

  // State
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoadingOutlet, setIsLoadingOutlet] = useState(true);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [outletError, setOutletError] = useState<string | null>(null);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const zoneStats = useMemo(() => {
    const total = zones.length;
    const active = zones.filter((zone) => zone.is_active).length;
    const inactive = total - active;
    const polygon = zones.filter((zone) => zone.zone_type === 'POLYGON').length;
    const circle = zones.filter((zone) => zone.zone_type === 'CIRCLE').length;

    return { total, active, inactive, polygon, circle };
  }, [zones]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) return 'Not synced yet';
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastSyncedAt);
  }, [lastSyncedAt]);

  // Fetch outlet details
  useEffect(() => {
    let cancelled = false;
    setIsLoadingOutlet(true);
    setOutletError(null);
    outletApi
      .getById(outletId)
      .then((data) => {
        if (!cancelled) setOutlet(data);
      })
      .catch(() => {
        if (!cancelled) {
          setOutlet(null);
          setOutletError('Unable to load outlet details right now.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOutlet(false);
      });
    return () => {
      cancelled = true;
    };
  }, [outletId]);

  // Fetch zones
  const fetchZones = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setIsLoadingZones(true);
    }

    setZonesError(null);

    try {
      const data = await adminDeliveryZoneApi.list(outletId);
      setZones(data);
      setLastSyncedAt(new Date());
    } catch {
      setZones([]);
      setZonesError('Unable to fetch delivery zones. Please retry.');
      throw new Error('Failed to fetch zones');
    } finally {
      if (!silent) {
        setIsLoadingZones(false);
      }
    }
  }, [outletId]);

  useEffect(() => {
    fetchZones().catch(() => undefined);
  }, [fetchZones]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await fetchZones();
      toast.success('Zones refreshed');
    } catch {
      toast.error('Could not refresh zones');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchZones]);

  // Handlers
  const handleCreate = useCallback(() => {
    setEditingZone(null);
    setIsEditorOpen(true);
  }, []);

  const handleEdit = useCallback((zone: DeliveryZone) => {
    setEditingZone(zone);
    setIsEditorOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (zoneId: string) => {
      try {
        await adminDeliveryZoneApi.delete(outletId, zoneId);
        await fetchZones({ silent: true });
        toast.success('Zone deleted successfully');
      } catch {
        toast.error('Failed to delete zone');
        throw new Error('Failed to delete zone');
      }
    },
    [outletId, fetchZones],
  );

  const handleToggleActive = useCallback(
    async (zoneId: string, currentState: boolean) => {
      try {
        await adminDeliveryZoneApi.toggle(outletId, zoneId);
        await fetchZones({ silent: true });
        toast.success(
          currentState
            ? 'Zone disabled successfully'
            : 'Zone enabled successfully',
        );
      } catch {
        toast.error('Unable to update zone status');
      }
    },
    [outletId, fetchZones],
  );

  const handleSave = useCallback(
    async (payload: CreateZonePayload) => {
      setIsSaving(true);
      try {
        if (editingZone) {
          await adminDeliveryZoneApi.update(
            outletId,
            editingZone._id,
            payload,
          );
        } else {
          await adminDeliveryZoneApi.create(outletId, payload);
        }
        await fetchZones({ silent: true });
      } finally {
        setIsSaving(false);
      }
    },
    [editingZone, outletId, fetchZones],
  );

  // Prepare outlets list for ZoneEditor (single outlet in admin context)
  const outletsForEditor = outlet
    ? [{ _id: outlet._id, name: outlet.name, location: outlet.location }]
    : [];

  return (
    <Can
      permission="outlet:zones"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-xl bg-destructive/10 mb-6">
            <Store className="h-10 w-10 text-destructive" />
          </div>
          <h2
            className="text-2xl font-bold mb-2 text-primary"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to manage delivery zones.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="space-y-3">
            <Link
              href="/admin/outlets"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Outlets
            </Link>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Delivery Zone Editor
                  {outlet ? ` - ${outlet.name}` : ''}
                </h1>
                <Badge variant="secondary" className="gap-1">
                  <MapPinned className="h-3.5 w-3.5" />
                  {zoneStats.total} zones
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground sm:text-base">
                Create, refine, and monitor delivery coverage with faster feedback
                and safer operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span>Last synced: {lastSyncedLabel}</span>
              {zoneStats.inactive > 0 && (
                <Badge variant="outline" className="font-medium">
                  {zoneStats.inactive} inactive
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoadingZones || isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoadingZones || isRefreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>

            <Can permission="outlet:zones">
              <Button
                onClick={handleCreate}
                className="gap-2"
                disabled={isLoadingOutlet || !!outletError}
              >
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </Can>
          </div>
        </motion.div>

        {isLoadingOutlet ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-6 h-4 w-96 max-w-full" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Zones
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {zoneStats.total}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {zoneStats.active}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Square className="h-3.5 w-3.5" />
                    Polygon
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {zoneStats.polygon}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Circle className="h-3.5 w-3.5" />
                    Circle
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {zoneStats.circle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {outletError && (
              <Alert className="mb-4 border-destructive/40 bg-destructive/10 text-destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Outlet unavailable</AlertTitle>
                <AlertDescription>
                  {outletError} Please go back and try opening this outlet again.
                </AlertDescription>
              </Alert>
            )}

            {zonesError && (
              <Alert className="mb-4 border-warning/40 bg-warning/10 text-warning-foreground">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Could not load zones</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>{zonesError}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    className="h-8"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <ZoneList
                zones={zones}
                outlets={outletsForEditor}
                isLoading={isLoadingZones}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onCreate={handleCreate}
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Zone Editor Dialog */}
      <ZoneEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSave}
        zone={editingZone}
        outlets={outletsForEditor}
        isLoading={isSaving}
      />
    </Can>
  );
}
