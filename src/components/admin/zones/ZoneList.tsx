"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Circle,
  Square,
  Pencil,
  Trash2,
  Search,
  Filter,
  Plus,
  Store,
  Power,
  PowerOff,
  MapPinned,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryZone } from "@/api/delivery-zone.api";

interface Outlet {
  _id: string;
  name: string;
}

interface ZoneListProps {
  zones: DeliveryZone[];
  outlets: Outlet[];
  isLoading: boolean;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onCreate: () => void;
}

export function ZoneList({
  zones,
  outlets,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
}: ZoneListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [outletFilter, setOutletFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "POLYGON" | "CIRCLE">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter zones based on search and filters
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.outlet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (zone.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Outlet filter
      const matchesOutlet =
        outletFilter === "all" || zone.outlet_id === outletFilter;

      // Type filter
      const matchesType =
        typeFilter === "all" || zone.zone_type === typeFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && zone.is_active) ||
        (statusFilter === "inactive" && !zone.is_active);

      return matchesSearch && matchesOutlet && matchesType && matchesStatus;
    });
  }, [zones, searchQuery, outletFilter, typeFilter, statusFilter]);

  // Get outlet name by ID
  const getOutletName = (outletId: string) => {
    return outlets.find((o) => o._id === outletId)?.name || "Unknown Outlet";
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteZoneId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteZoneId);
    } finally {
      setIsDeleting(false);
      setDeleteZoneId(null);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>
                Manage delivery zones for your outlets. Define polygon or circle
                areas to control where you deliver.
              </CardDescription>
            </div>
            <Button onClick={onCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Outlet Filter */}
            <Select value={outletFilter} onValueChange={setOutletFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Outlets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outlets</SelectItem>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
            >
              <SelectTrigger className="w-[150px]">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="POLYGON">Polygon</SelectItem>
                <SelectItem value="CIRCLE">Circle</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-[150px]">
                <Power className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery ||
              outletFilter !== "all" ||
              typeFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setOutletFilter("all");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredZones.length} of {zones.length} zones
          </div>

          {/* Zones Table */}
          {filteredZones.length > 0 ? (
            <div className="border rounded-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-[200px]">Zone</TableHead>
                    <TableHead className="w-[100px] hidden sm:table-cell">Type</TableHead>
                    <TableHead className="min-w-[150px]">Outlet</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px] hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZones.map((zone) => (
                    <TableRow key={zone._id}>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{zone.name}</p>
                          {zone.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {zone.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className="gap-1 whitespace-nowrap"
                        >
                          {zone.zone_type === "POLYGON" ? (
                            <>
                              <Square className="h-3 w-3" />
                              <span className="hidden lg:inline">Polygon</span>
                            </>
                          ) : (
                            <>
                              <Circle className="h-3 w-3" />
                              <span className="hidden lg:inline">Circle</span>
                              {zone.radius_km && (
                                <span className="ml-1">({zone.radius_km} km)</span>
                              )}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="line-clamp-1">{getOutletName(zone.outlet_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={zone.is_active}
                            onCheckedChange={(checked) =>
                              onToggleActive(zone._id, checked)
                            }
                          />
                          <Badge
                            variant={zone.is_active ? "default" : "secondary"}
                            className="text-xs hidden sm:inline-flex"
                          >
                            {zone.is_active ? (
                              <>
                                <Power className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <PowerOff className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell whitespace-nowrap">
                        {format(new Date(zone.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(zone)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteZoneId(zone._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-sm bg-muted/30">
              <MapPinned className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No zones found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {zones.length === 0
                  ? "Get started by creating your first delivery zone"
                  : "Try adjusting your filters to see more results"}
              </p>
              {zones.length === 0 && (
                <Button onClick={onCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Zone
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteZoneId}
        onOpenChange={() => setDeleteZoneId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery zone? This action
              cannot be undone and may affect active deliveries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
