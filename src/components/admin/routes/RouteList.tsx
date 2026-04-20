'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Play, CheckCircle2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Can } from '@/components/Auth/can';
import { RouteStatusBadge } from './RouteStatusBadge';
import { RouteDetailPanel } from './RouteDetailPanel';
import { AssignPartnerDialog } from './AssignPartnerDialog';
import { useStartRoute, useCompleteRoute, useDeleteRoute } from '@/api/hooks/useAdminRoutes';
import type { DeliveryRoute } from '@/api/admin-route.api';

interface RouteListProps {
  routes: DeliveryRoute[];
  outletId: string;
  isLoading: boolean;
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        No routes found. Generate routes to get started.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {routes.map((route) => {
          const isExpanded = expandedId === route._id;
          const progressPercent =
            route.order_count > 0
              ? Math.round((route.completed_stops / route.order_count) * 100)
              : 0;

          return (
            <Collapsible
              key={route._id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedId(open ? route._id : null)}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <h3 className="font-semibold text-base">{route.name}</h3>
                        <RouteStatusBadge status={route.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground ml-9">
                        <span>{route.order_count} orders</span>
                        {route.assigned_partner ? (
                          <span>
                            Partner: {route.assigned_partner.name}{route.assigned_partner.vehicle_number ? ` (${route.assigned_partner.vehicle_number})` : ''}
                          </span>
                        ) : (
                          <span className="text-warning">No partner assigned</span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="ml-9 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                      {route.status === 'DRAFT' && (
                        <>
                          <Can permission="route:assign">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAssignDialogRouteId(route._id)}
                              className="w-full sm:w-auto"
                            >
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              Assign Partner
                            </Button>
                          </Can>
                          <Can permission="route:generate">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfirmId(route._id)}
                              disabled={deleteRoute.isPending}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </Can>
                        </>
                      )}
                      {route.status === 'PUBLISHED' && (
                        <Can permission="route:assign">
                          <Button
                            size="sm"
                            onClick={() => startRoute.mutate(route._id)}
                            disabled={startRoute.isPending}
                            className="w-full sm:w-auto"
                          >
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                            Start Route
                          </Button>
                        </Can>
                      )}
                      {route.status === 'IN_PROGRESS' && (
                        <Can permission="route:assign">
                          <Button
                            size="sm"
                            onClick={() => setCompleteConfirmId(route._id)}
                            disabled={completeRoute.isPending}
                            className="w-full sm:w-auto bg-success text-success-foreground hover:bg-success/90"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Complete Route
                          </Button>
                        </Can>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <Separator />
                  <CardContent className="pt-4">
                    <RouteDetailPanel route={route} outletId={outletId} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Assign Partner Dialog */}
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

      {/* Delete Route Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will remove the route and clear route assignments from linked orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId) deleteRoute.mutate(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Route Confirmation */}
      <AlertDialog open={!!completeConfirmId} onOpenChange={(open) => { if (!open) setCompleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this route as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => {
                if (completeConfirmId) completeRoute.mutate(completeConfirmId);
                setCompleteConfirmId(null);
              }}
            >
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
