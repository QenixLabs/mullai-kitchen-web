"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ZoneList } from "@/components/admin/zones/ZoneList";
import { ZoneEditor } from "@/components/admin/zones/ZoneEditor";
import {
  deliveryZoneApi,
  DeliveryZone,
  CreateZonePayload,
} from "@/api/delivery-zone.api";
import { apiClient } from "@/api/client";

// Outlet interface
interface Outlet {
  _id: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Query keys
const ZONES_QUERY_KEY = ["delivery-zones"];
const OUTLETS_QUERY_KEY = ["outlets"];

export default function ZonesPage() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Fetch delivery zones
  const {
    data: zones = [],
    isLoading: isLoadingZones,
    error: zonesError,
  } = useQuery({
    queryKey: ZONES_QUERY_KEY,
    queryFn: () => deliveryZoneApi.list(),
  });

  // Fetch outlets for dropdown
  const {
    data: outlets = [],
    isLoading: isLoadingOutlets,
  } = useQuery({
    queryKey: OUTLETS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get("/outlets");
      return response.data as Outlet[];
    },
  });

  // Create zone mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateZonePayload) => deliveryZoneApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
      toast.success("Zone created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create zone");
    },
  });

  // Update zone mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateZonePayload> }) =>
      deliveryZoneApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
      toast.success("Zone updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update zone");
    },
  });

  // Delete zone mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deliveryZoneApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
      toast.success("Zone deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete zone");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      deliveryZoneApi.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ZONES_QUERY_KEY });
      toast.success("Zone status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update zone status");
    },
  });

  // Handle create/edit zone
  const handleSaveZone = async (payload: CreateZonePayload) => {
    if (editingZone) {
      await updateMutation.mutateAsync({ id: editingZone._id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  // Handle delete zone
  const handleDeleteZone = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  // Handle toggle active
  const handleToggleActive = async (id: string, isActive: boolean) => {
    await toggleActiveMutation.mutateAsync({ id, isActive });
  };

  // Handle edit button click
  const handleEdit = useCallback((zone: DeliveryZone) => {
    setEditingZone(zone);
    setIsEditorOpen(true);
  }, []);

  // Handle create button click
  const handleCreate = useCallback(() => {
    setEditingZone(null);
    setIsEditorOpen(true);
  }, []);

  // Handle editor close
  const handleEditorClose = useCallback(() => {
    setIsEditorOpen(false);
    setEditingZone(null);
  }, []);

  // Show error toast if zones fail to load
  useEffect(() => {
    if (zonesError) {
      toast.error("Failed to load delivery zones");
    }
  }, [zonesError]);

  const isLoading = isLoadingZones || isLoadingOutlets;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Delivery Zone Management</h1>
        <p className="text-muted-foreground">
          Create and manage delivery zones to define where your outlets deliver.
          Use polygon zones for custom shapes or circle zones for radial delivery areas.
        </p>
      </div>

      <ZoneList
        zones={zones}
        outlets={outlets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteZone}
        onToggleActive={handleToggleActive}
        onCreate={handleCreate}
      />

      <ZoneEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        onSave={handleSaveZone}
        zone={editingZone}
        outlets={outlets}
        isLoading={isSaving}
      />
    </div>
  );
}
