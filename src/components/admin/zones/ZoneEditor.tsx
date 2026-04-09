"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Circle,
  Marker,
} from "@react-google-maps/api";
import {
  Circle as CircleIcon,
  LocateFixed,
  MapPin,
  Square,
  Trash2,
} from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Refs for map instances
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const isEditing = !!zone;

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const selectedOutlet = useMemo(
    () => outlets.find((outlet) => outlet._id === outletId),
    [outletId, outlets]
  );

  const polygonVertexCount = useMemo(() => {
    if (polygonPaths.length === 0) return 0;

    const first = polygonPaths[0];
    const last = polygonPaths[polygonPaths.length - 1];
    const isClosed = first.lat === last.lat && first.lng === last.lng;

    return isClosed ? polygonPaths.length - 1 : polygonPaths.length;
  }, [polygonPaths]);

  const hasValidShape =
    zoneType === "POLYGON"
      ? polygonVertexCount >= 3
      : !!circleCenter && radiusKm > 0;

  const isFormValid = !!name.trim() && !!outletId && hasValidShape;

  const mapShapeStyle = useMemo(
    () => ({
      fillColor: "hsl(var(--primary))",
      fillOpacity: 0.25,
      strokeColor: "hsl(var(--primary))",
      strokeWeight: 2,
      editable: true,
      draggable: true,
    }),
    []
  );

  // Initialize form with existing zone data when editing
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const paths = polygon.getPath();
      const coordinates: google.maps.LatLngLiteral[] = [];

      for (let i = 0; i < paths.getLength(); i++) {
        const point = paths.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      // Always ensure the polygon is closed (first point === last point)
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
        setCircleCenter({ 
          lat: Math.round(center.lat() * 1e6) / 1e6, 
          lng: Math.round(center.lng() * 1e6) / 1e6 
        });
        setRadiusKm(Math.round((radius / 1000) * 100) / 100); // Convert to km with 2 decimals
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
    setDrawingMode(null);
    setHasUnsavedChanges(true);
  };

  const recenterToOutlet = () => {
    if (!selectedOutlet?.location || !mapRef.current) return;

    mapRef.current.panTo(selectedOutlet.location);
    mapRef.current.setZoom(14);
  };

  const fitToShape = () => {
    if (!mapRef.current) return;

    if (zoneType === "POLYGON" && polygonPaths.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      polygonPaths.forEach((point) => bounds.extend(point));
      mapRef.current.fitBounds(bounds);
      return;
    }

    if (zoneType === "CIRCLE" && circleRef.current?.getBounds()) {
      mapRef.current.fitBounds(circleRef.current.getBounds()!);
    }
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
      // Convert to GeoJSON format with rounded coordinates
      const coordinates = polygonPaths.map((p) => [
        Math.round(p.lng * 1e6) / 1e6,  // Round to 6 decimal places
        Math.round(p.lat * 1e6) / 1e6,
      ]);
      payload.boundary = {
        type: "Polygon",
        coordinates: [coordinates],
      };
    } else if (zoneType === "CIRCLE" && circleCenter) {
      payload.center = {
        lat: Math.round(circleCenter.lat * 1e6) / 1e6,
        lng: Math.round(circleCenter.lng * 1e6) / 1e6,
      };
      payload.radius_km = Math.round(radiusKm * 100) / 100; // Round to 2 decimal places
    }

    try {
      await onSave(payload);
      toast.success(isEditing ? "Zone updated successfully" : "Zone created successfully");
      onClose();
    } catch {
      toast.error("Failed to save zone");
    }
  };

  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onClose();
  };

  if (loadError) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleRequestClose()}>
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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleRequestClose()}>
        <DialogContent className="max-w-5xl w-full sm:w-[95vw] h-[100dvh] sm:h-[90vh] sm:max-h-[800px] p-0 overflow-hidden flex flex-col gap-0 rounded-sm">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 shrink-0 border-b">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
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
            <DialogDescription className="text-xs sm:text-sm">
              Define precise coverage areas, then save when the zone summary is complete.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 border-b lg:border-b-0 lg:border-r border-border bg-card">
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

                <div className="space-y-2">
                  <Label htmlFor="outlet">Outlet *</Label>
                  <Select
                    value={outletId}
                    onValueChange={(value) => {
                      setOutletId(value);
                      const nextOutlet = outlets.find((outlet) => outlet._id === value);
                      if (nextOutlet?.location) {
                        setMapCenter(nextOutlet.location);
                      }
                      setHasUnsavedChanges(true);
                    }}
                  >
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

                <Card className="bg-muted/40">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-medium">Geometry Summary</p>
                    {zoneType === "POLYGON" ? (
                      <p className="text-sm text-muted-foreground">
                        Vertices: <span className="font-semibold text-foreground">{polygonVertexCount}</span>
                      </p>
                    ) : (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Radius: <span className="font-semibold text-foreground">{radiusKm.toFixed(2)} km</span>
                        </p>
                        <p>
                          Center: <span className="font-semibold text-foreground">{circleCenter ? `${circleCenter.lat.toFixed(4)}, ${circleCenter.lng.toFixed(4)}` : "Not set"}</span>
                        </p>
                      </div>
                    )}
                    <Badge variant={hasValidShape ? "default" : "secondary"}>
                      {hasValidShape ? "Shape ready" : "Draw shape to continue"}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-medium">Workflow</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Select zone type above</li>
                      <li>Choose outlet, name, and optional notes</li>
                      <li>Click &quot;Draw {zoneType === "POLYGON" ? "Polygon" : "Circle"}&quot; on map</li>
                      <li>
                        {zoneType === "POLYGON"
                          ? "Click on map to create polygon points, click first point to close"
                          : "Click and drag on map to create circle"}
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <div className="relative h-[350px] sm:h-[400px] lg:h-full lg:min-h-[400px]">
                {isLoaded ? (
                  <>
                    <GoogleMap
                      mapContainerClassName="w-full h-full"
                      center={mapCenter}
                      zoom={DEFAULT_ZOOM}
                      onLoad={(map) => {
                        mapRef.current = map;
                      }}
                      options={{
                        mapTypeId: "roadmap",
                        mapTypeControl: true,
                        mapTypeControlOptions: {
                          position: google.maps.ControlPosition.RIGHT_TOP,
                        },
                        streetViewControl: false,
                        fullscreenControl: true,
                        fullscreenControlOptions: {
                          position: google.maps.ControlPosition.RIGHT_BOTTOM,
                        },
                      }}
                    >
                      <DrawingManager
                        onLoad={handleDrawingManagerLoad}
                        options={{
                          drawingControl: false,
                          drawingMode: drawingMode
                            ? google.maps.drawing.OverlayType[
                                drawingMode === "polygon" ? "POLYGON" : "CIRCLE"
                              ]
                            : null,
                          polygonOptions: { ...mapShapeStyle },
                          circleOptions: { ...mapShapeStyle },
                        }}
                        onPolygonComplete={handlePolygonComplete}
                        onCircleComplete={handleCircleComplete}
                      />

                      {zoneType === "POLYGON" && polygonPaths.length > 0 && (
                        <Polygon
                          paths={polygonPaths}
                          options={mapShapeStyle}
                          onLoad={(polygon) => {
                            polygonRef.current = polygon;
                          }}
                          onMouseUp={() => {
                            if (polygonRef.current) {
                              const paths = polygonRef.current.getPath();
                              const coordinates: google.maps.LatLngLiteral[] = [];
                              for (let i = 0; i < paths.getLength(); i++) {
                                const point = paths.getAt(i);
                                coordinates.push({
                                  lat: Math.round(point.lat() * 1e6) / 1e6,
                                  lng: Math.round(point.lng() * 1e6) / 1e6,
                                });
                              }
                              setPolygonPaths(coordinates);
                              setHasUnsavedChanges(true);
                            }
                          }}
                        />
                      )}

                      {zoneType === "CIRCLE" && circleCenter && (
                        <Circle
                          center={circleCenter}
                          radius={radiusKm * 1000}
                          options={mapShapeStyle}
                          onLoad={(circle) => {
                            circleRef.current = circle;
                          }}
                          onRadiusChanged={() => {
                            if (circleRef.current) {
                              const radius = circleRef.current.getRadius();
                              setRadiusKm(Math.round((radius / 1000) * 100) / 100);
                              setHasUnsavedChanges(true);
                            }
                          }}
                          onCenterChanged={() => {
                            if (circleRef.current) {
                              const center = circleRef.current.getCenter();
                              if (center) {
                                setCircleCenter({
                                  lat: Math.round(center.lat() * 1e6) / 1e6,
                                  lng: Math.round(center.lng() * 1e6) / 1e6,
                                });
                                setHasUnsavedChanges(true);
                              }
                            }
                          }}
                        />
                      )}

                      {selectedOutlet?.location && (
                        <Marker
                          position={selectedOutlet.location}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillOpacity: 1,
                            fillColor: "hsl(var(--primary))",
                            strokeColor: "hsl(var(--background))",
                            strokeWeight: 2,
                          }}
                        />
                      )}
                    </GoogleMap>

                    <div className="absolute left-4 top-4 z-[5] flex max-w-[calc(100%-1rem)] flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={drawingMode === "polygon" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => startDrawing("polygon")}
                        disabled={zoneType !== "POLYGON"}
                        className="shadow-md"
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
                        className="shadow-md"
                      >
                        <CircleIcon className="h-4 w-4 mr-2" />
                        Draw Circle
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDrawingMode(null)}
                        disabled={!drawingMode}
                        className="shadow-md"
                      >
                        Stop Drawing
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fitToShape}
                        disabled={!hasValidShape}
                        className="shadow-md"
                      >
                        Fit Zone
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={recenterToOutlet}
                        disabled={!selectedOutlet?.location}
                        className="shadow-md"
                      >
                        <LocateFixed className="h-4 w-4 mr-2" />
                        Outlet
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={clearShape}
                        disabled={polygonPaths.length === 0 && !circleCenter}
                        className="shadow-md"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-sm border p-3 shadow-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Outlet Location</span>
                      </div>
                    </div>

                    {drawingMode && (
                      <div className="absolute right-4 top-16 bg-primary text-primary-foreground px-4 py-2 rounded-sm shadow-lg text-sm font-medium">
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
          </div>

          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-card">
            <Button variant="outline" onClick={handleRequestClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !isFormValid}>
              {isLoading ? "Saving..." : isEditing ? "Update Zone" : "Create Zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent  className="!max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits in this zone. If you close now, those changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
