'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  CheckCircle2,
  UserPlus,
  Route as RouteIcon,
  Truck,
  Package,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import { RouteStatusBadge } from './RouteStatusBadge';
import { RouteDetailPanel } from './RouteDetailPanel';
import { AssignPartnerDialog } from './AssignPartnerDialog';
import {
  useStartRoute,
  useCompleteRoute,
  useDeleteRoute,
} from '@/api/hooks/useAdminRoutes';
import type { DeliveryRoute } from '@/api/admin-route.api';
import { cn } from '@/lib/utils';

interface RouteListProps {
  routes: DeliveryRoute[];
  outletId: string;
  isLoading: boolean;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function RouteList({ routes, outletId, isLoading }: RouteListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignDialogRouteId, setAssignDialogRouteId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [completeConfirmId, setCompleteConfirmId] = useState<string | null>(null);

  const startRoute = useStartRoute(outletId);
  const completeRoute = useCompleteRoute(outletId);
  const deleteRoute = useDeleteRoute(outletId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="space-y-3 p-4">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <RouteIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              No routes for this date
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Generate routes from the toolbar above to plan deliveries for the
              selected outlet and date.
            </p>
          </div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
            <Sparkles className="h-3 w-3" />
            Tap Generate Routes
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-3">
        {routes.map((route) => {
          const isExpanded = expandedId === route._id;
          const progressPercent =
            route.order_count > 0
              ? Math.round((route.completed_stops / route.order_count) * 100)
              : 0;
          const hasPartner = !!route.assigned_partner;

          return (
            <Collapsible
              key={route._id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedId(open ? route._id : null)}
            >
              <Card className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  {/* Header strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                        <RouteIcon className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {route.name}
                      </h3>
                      <RouteStatusBadge status={route.status} />
                      <span className="hidden items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline-flex">
                        <Package className="h-3 w-3" />
                        {route.order_count} {route.order_count === 1 ? 'order' : 'orders'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {route.status === 'DRAFT' && (
                        <>
                          <Can permission="route:assign">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() => setAssignDialogRouteId(route._id)}
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              {hasPartner ? 'Reassign' : 'Assign Partner'}
                            </Button>
                          </Can>
                          <Can permission="route:generate">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setDeleteConfirmId(route._id)}
                                  disabled={deleteRoute.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Delete route</p>
                              </TooltipContent>
                            </Tooltip>
                          </Can>
                        </>
                      )}
                      {route.status === 'PUBLISHED' && (
                        <Can permission="route:assign">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => startRoute.mutate(route._id)}
                            disabled={startRoute.isPending}
                          >
                            <Play className="h-3.5 w-3.5" />
                            Start Route
                          </Button>
                        </Can>
                      )}
                      {route.status === 'IN_PROGRESS' && (
                        <Can permission="route:assign">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => setCompleteConfirmId(route._id)}
                            disabled={completeRoute.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </Button>
                        </Can>
                      )}
                    </div>
                  </div>

                  {/* Body: progress + partner */}
                  <div className="space-y-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span>Progress</span>
                          <span className="tabular-nums text-foreground">
                            {route.completed_stops}/{route.order_count} stops
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                progressPercent === 100
                                  ? 'bg-success'
                                  : progressPercent > 0
                                    ? 'bg-primary'
                                    : 'bg-muted',
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {hasPartner ? (
                        <PartnerChip partner={route.assigned_partner!} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/20 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          No partner assigned
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground sm:hidden">
                        <Package className="h-3 w-3" />
                        {route.order_count} {route.order_count === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <Separator />
                    <div className="px-4 py-4">
                      <RouteDetailPanel route={route} outletId={outletId} />
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {assignDialogRouteId && (
        <AssignPartnerDialog
          open={!!assignDialogRouteId}
          onOpenChange={(open) => {
            if (!open) setAssignDialogRouteId(null);
          }}
          outletId={outletId}
          routeId={assignDialogRouteId}
        />
      )}

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                <Trash2 className="h-3.5 w-3.5" />
              </span>
              Delete Route
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the route and unlinks any orders assigned to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Linked orders will lose their route assignment and need to be re-routed.</span>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-9 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId) deleteRoute.mutate(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Route
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!completeConfirmId}
        onOpenChange={(open) => {
          if (!open) setCompleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success ring-1 ring-success/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              Complete Route
            </AlertDialogTitle>
            <AlertDialogDescription>
              Mark this route as completed. All remaining stops will be closed out and the partner will be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-9 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
              onClick={() => {
                if (completeConfirmId) completeRoute.mutate(completeConfirmId);
                setCompleteConfirmId(null);
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete Route
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

function PartnerChip({
  partner,
}: {
  partner: NonNullable<DeliveryRoute['assigned_partner']>;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background px-2 py-1">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary ring-1 ring-primary/15">
        {getInitials(partner.name)}
      </span>
      <div className="flex items-center gap-1.5 text-xs">
        <Truck className="h-3 w-3 text-muted-foreground" />
        <span className="font-semibold text-foreground">{partner.name}</span>
        {partner.vehicle_number && (
          <code className="rounded bg-muted/60 px-1 py-px font-mono text-[10px] text-muted-foreground">
            {partner.vehicle_number}
          </code>
        )}
      </div>
    </div>
  );
}
