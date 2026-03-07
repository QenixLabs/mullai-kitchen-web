"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { MapPin, Circle as CircleIcon, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DeliveryZone,
  CreateZonePayload,
} from "@/api/delivery-zone.api";

// Google Maps libraries needed for drawing
const GOOGLE_MAPS_LIBRARIES: ("drawing" | "geometry")[] = ["drawing", "geometry"];

// Default map center (Chennai, India)
const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

// Default map zoom
const DEFAULT_ZOOM = 12;

interface Outlet {
  _id: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface ZoneEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateZonePayload) => Promise<void>;
  zone?: DeliveryZone | null;
  outlets: Outlet[];
  isLoading?: boolean;
}

type ZoneType = "POLYGON" | "CIRCLE";
type DrawingMode = "polygon" | "circle" | null;

export function ZoneEditor({
  isOpen,
  onClose,
  onSave,
  zone,
  outlets,
  isLoading = false,
}: ZoneEditorProps) {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [outletId, setOutletId] = useState("");
  const [zoneType, setZoneType] = useState<ZoneType>("POLYGON");
  const [isActive, setIsActive] = useState(true);
  const [radiusKm, setRadiusKm] = useState(5);

  // Map drawing state
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [polygonPaths, setPolygonPaths] = useState<google.maps.LatLngLiteral[]>([]);
  const [circleCenter, setCircleCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for map instances
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const isEditing = !!zone;

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Initialize form with existing zone data when editing
  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setDescription(zone.description || "");
      setOutletId(zone.outlet_id);
      setZoneType(zone.zone_type);
      setIsActive(zone.is_active);

      if (zone.zone_type === "POLYGON" && zone.boundary) {
        // Convert GeoJSON coordinates to Google Maps format
        const coords = zone.boundary.coordinates[0].map(([lng, lat]) => ({
          lat,
          lng,
        }));
        setPolygonPaths(coords);
        if (coords.length > 0) {
          setMapCenter(coords[0]);
        }
        setCircleCenter(null);
      } else if (zone.zone_type === "CIRCLE" && zone.center) {
        setCircleCenter(zone.center);
        setRadiusKm(zone.radius_km || 5);
        setMapCenter(zone.center);
        setPolygonPaths([]);
      }
    } else {
      // Reset form for new zone
      setName("");
      setDescription("");
      setOutletId("");
      setZoneType("POLYGON");
      setIsActive(true);
      setPolygonPaths([]);
      setCircleCenter(null);
      setRadiusKm(5);
      setMapCenter(DEFAULT_CENTER);
    }
    setHasUnsavedChanges(false);
    setDrawingMode(null);
  }, [zone, isOpen]);

  // Update map center when outlet changes
  useEffect(() => {
    const selectedOutlet = outlets.find((o) => o._id === outletId);
    if (selectedOutlet?.location) {
      setMapCenter(selectedOutlet.location);
    }
  }, [outletId, outlets]);

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const paths = polygon.getPath();
      const coordinates: google.maps.LatLngLiteral[] = [];

      for (let i = 0; i < paths.getLength(); i++) {
        const point = paths.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      // Close the polygon if not already closed
      if (coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        if (first.lat !== last.lat || first.lng !== last.lng) {
          coordinates.push(first);
        }
      }

      setPolygonPaths(coordinates);
      setHasUnsavedChanges(true);
      setDrawingMode(null);

      // Remove the drawing manager polygon
      polygon.setMap(null);
    },
    []
  );

  const handleCircleComplete = useCallback(
    (circle: google.maps.Circle) => {
      const center = circle.getCenter();
      const radius = circle.getRadius();

      if (center) {
        setCircleCenter({ lat: center.lat(), lng: center.lng() });
        setRadiusKm(Math.round(radius / 1000 * 100) / 100); // Convert to km with 2 decimals
        setHasUnsavedChanges(true);
        setDrawingMode(null);
      }

      // Remove the drawing manager circle
      circle.setMap(null);
    },
    []
  );

  const handleDrawingManagerLoad = useCallback(
    (drawingManager: google.maps.drawing.DrawingManager) => {
      drawingManagerRef.current = drawingManager;
    },
    []
  );

  const startDrawing = (mode: DrawingMode) => {
    // Clear existing shape when starting new drawing
    if (mode === "polygon") {
      setPolygonPaths([]);
      setCircleCenter(null);
    } else if (mode === "circle") {
      setCircleCenter(null);
      setPolygonPaths([]);
    }
    setDrawingMode(mode);
    setHasUnsavedChanges(true);
  };

  const clearShape = () => {
    setPolygonPaths([]);
    setCircleCenter(null);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Zone name is required");
      return;
    }

    if (!outletId) {
      toast.error("Please select an outlet");
      return;
    }

    if (zoneType === "POLYGON" && polygonPaths.length < 3) {
      toast.error("Please draw a polygon zone on the map");
      return;
    }

    if (zoneType === "CIRCLE" && !circleCenter) {
      toast.error("Please draw a circle zone on the map");
      return;
    }

    const payload: CreateZonePayload = {
      outlet_id: outletId,
      name: name.trim(),
      description: description.trim() || undefined,
      zone_type: zoneType,
      is_active: isActive,
    };

    if (zoneType === "POLYGON") {
      // Convert to GeoJSON format
      const coordinates = polygonPaths.map((p) => [p.lng, p.lat]);
      payload.boundary = {
        type: "Polygon",
        coordinates: [coordinates],
      };
    } else if (zoneType === "CIRCLE" && circleCenter) {
      payload.center = circleCenter;
      payload.radius_km = radiusKm;
    }

    try {
      await onSave(payload);
      toast.success(isEditing ? "Zone updated successfully" : "Zone created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save zone");
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (loadError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">
            <p className="text-destructive">Failed to load Google Maps</p>
            <p className="text-muted-foreground text-sm mt-2">
              Please check your Google Maps API key configuration
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Delivery Zone" : "Create Delivery Zone"}
            {zoneType === "POLYGON" ? (
              <Badge variant="secondary" className="gap-1">
                <Square className="h-3 w-3" />
                Polygon
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <CircleIcon className="h-3 w-3" />
                Circle
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Form Section */}
          <div className="p-6 space-y-5 border-r border-border overflow-y-auto max-h-[calc(95vh-8rem)]">
            {/* Zone Type Selection */}
            <div className="space-y-2">
              <Label>Zone Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={zoneType === "POLYGON" ? "default" : "outline"}
                  onClick={() => {
                    setZoneType("POLYGON");
                    clearShape();
                  }}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Polygon
                </Button>
                <Button
                  type="button"
                  variant={zoneType === "CIRCLE" ? "default" : "outline"}
                  onClick={() => {
                    setZoneType("CIRCLE");
                    clearShape();
                  }}
                  className="gap-2"
                >
                  <CircleIcon className="h-4 w-4" />
                  Circle
                </Button>
              </div>
            </div>

            {/* Outlet Selection */}
            <div className="space-y-2">
              <Label htmlFor="outlet">Outlet *</Label>
              <Select value={outletId} onValueChange={setOutletId}>
                <SelectTrigger id="outlet">
                  <SelectValue placeholder="Select an outlet" />
                </SelectTrigger>
                <SelectContent>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet._id} value={outlet._id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Zone Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="e.g., Anna Nagar Delivery Zone"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Optional description of this delivery zone"
                rows={3}
              />
            </div>

            {/* Circle Radius (only for circle zones) */}
            {zoneType === "CIRCLE" && circleCenter && (
              <div className="space-y-2">
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={radiusKm}
                  onChange={(e) => {
                    setRadiusKm(parseFloat(e.target.value) || 0);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is-active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={(checked) => {
                  setIsActive(checked);
                  setHasUnsavedChanges(true);
                }}
              />
            </div>

            {/* Instructions */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-medium">How to draw:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Select zone type above</li>
                  <li>Click &quot;Draw {zoneType === "POLYGON" ? "Polygon" : "Circle"}&quot; button</li>
                  <li>
                    {zoneType === "POLYGON"
                      ? "Click on map to create polygon points, click first point to close"
                      : "Click and drag on map to create circle"}
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2 relative h-[500px] lg:h-auto min-h-[500px]">
            {isLoaded ? (
              <>
                <GoogleMap
                  mapContainerClassName="w-full h-full"
                  center={mapCenter}
                  zoom={DEFAULT_ZOOM}
                  options={{
                    mapTypeId: "roadmap",
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {/* Drawing Manager */}
                  <DrawingManager
                    onLoad={handleDrawingManagerLoad}
                    options={{
                      drawingControl: false,
                      drawingMode: drawingMode
                        ? google.maps.drawing.OverlayType[
                            drawingMode === "polygon" ? "POLYGON" : "CIRCLE"
                          ]
                        : null,
                      polygonOptions: {
                        fillColor: "hsl(var(--primary))",
                        fillOpacity: 0.3,
                        strokeColor: "hsl(var(--primary))",
                        strokeWeight: 2,
                        editable: true,
                        draggable: true,
                      },
                      circleOptions: {
                        fillColor: "hsl(var(--primary))",
                        fillOpacity: 0.3,
                        strokeColor: "hsl(var(--primary))",
                        strokeWeight: 2,
                        editable: true,
                        draggable: true,
                      },
                    }}
                    onPolygonComplete={handlePolygonComplete}
                    onCircleComplete={handleCircleComplete}
                  />

                  {/* Render existing polygon */}
                  {zoneType === "POLYGON" && polygonPaths.length > 0 && (
                    <Polygon
                      paths={polygonPaths}
                      options={{
                        fillColor: "hsl(var(--primary))",
                        fillOpacity: 0.3,
                        strokeColor: "hsl(var(--primary))",
                        strokeWeight: 2,
                        editable: true,
                        draggable: true,
                      }}
                      onLoad={(polygon) => {
                        polygonRef.current = polygon;
                      }}
                      onMouseUp={() => {
                        if (polygonRef.current) {
                          const paths = polygonRef.current.getPath();
                          const coordinates: google.maps.LatLngLiteral[] = [];
                          for (let i = 0; i < paths.getLength(); i++) {
                            const point = paths.getAt(i);
                            coordinates.push({ lat: point.lat(), lng: point.lng() });
                          }
                          setPolygonPaths(coordinates);
                          setHasUnsavedChanges(true);
                        }
                      }}
                    />
                  )}

                  {/* Render existing circle */}
                  {zoneType === "CIRCLE" && circleCenter && (
                    <Circle
                      center={circleCenter}
                      radius={radiusKm * 1000}
                      options={{
                        fillColor: "hsl(var(--primary))",
                        fillOpacity: 0.3,
                        strokeColor: "hsl(var(--primary))",
                        strokeWeight: 2,
                        editable: true,
                        draggable: true,
                      }}
                      onLoad={(circle) => {
                        circleRef.current = circle;
                      }}
                      onRadiusChanged={() => {
                        if (circleRef.current) {
                          const radius = circleRef.current.getRadius();
                          setRadiusKm(Math.round(radius / 1000 * 100) / 100);
                          setHasUnsavedChanges(true);
                        }
                      }}
                      onCenterChanged={() => {
                        if (circleRef.current) {
                          const center = circleRef.current.getCenter();
                          if (center) {
                            setCircleCenter({ lat: center.lat(), lng: center.lng() });
                            setHasUnsavedChanges(true);
                          }
                        }
                      }}
                    />
                  )}

                  {/* Show outlet marker */}
                  {outlets.find((o) => o._id === outletId)?.location && (
                    <Marker
                      position={outlets.find((o) => o._id === outletId)!.location!}
                      icon={{
                        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E",
                        scaledSize: new google.maps.Size(32, 32),
                        anchor: new google.maps.Point(16, 32),
                      }}
                    />
                  )}
                </GoogleMap>

                {/* Map Controls */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={drawingMode === "polygon" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => startDrawing("polygon")}
                    disabled={zoneType !== "POLYGON"}
                    className="shadow-lg"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Draw Polygon
                  </Button>
                  <Button
                    type="button"
                    variant={drawingMode === "circle" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => startDrawing("circle")}
                    disabled={zoneType !== "CIRCLE"}
                    className="shadow-lg"
                  >
                    <CircleIcon className="h-4 w-4 mr-2" />
                    Draw Circle
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={clearShape}
                    disabled={polygonPaths.length === 0 && !circleCenter}
                    className="shadow-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-sm border p-3 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Outlet Location</span>
                  </div>
                </div>

                {/* Drawing mode indicator */}
                {drawingMode && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-sm shadow-lg text-sm font-medium">
                    Drawing mode: Click on map to draw {drawingMode}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Loading map...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Zone" : "Create Zone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
