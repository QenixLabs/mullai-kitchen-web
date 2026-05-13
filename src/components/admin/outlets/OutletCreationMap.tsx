'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Circle,
  Marker,
} from '@react-google-maps/api';
import { MapPin, Plus, Trash2, Circle as CircleIcon, Square, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PendingZone {
  id: string;
  name: string;
  description?: string;
  zone_type: 'POLYGON' | 'CIRCLE';
  boundary?: { type: 'Polygon'; coordinates: number[][][] };
  center?: { lat: number; lng: number };
  radius_km?: number;
  is_active: boolean;
}

interface OutletCreationMapProps {
  outletName: string;
  initialLocation?: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number } | undefined) => void;
  zones: PendingZone[];
  onZonesChange: (zones: PendingZone[]) => void;
  onBack: () => void;
  onCreateOutlet: () => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOOGLE_MAPS_LIBRARIES: ('drawing' | 'geometry')[] = ['drawing', 'geometry'];

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };
const DEFAULT_ZOOM = 12;

// Google Maps API requires hex strings for fill/stroke colors — CSS variables not supported
const ZONE_COLORS = {
  fillColor: '#39070F',
  fillOpacity: 0.2,
  strokeColor: '#39070F',
  strokeWeight: 2,
};

const OUTLET_MARKER_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OutletCreationMap({
  outletName,
  initialLocation,
  onLocationSelect,
  zones,
  onZonesChange,
  onBack,
  onCreateOutlet,
  isLoading = false,
}: OutletCreationMapProps) {
  // ----- Location state ---------------------------------------------------
  const [outletLocation, setOutletLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation ?? null,
  );

  // ----- Drawing state ----------------------------------------------------
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'circle' | null>(null);

  // ----- Zone creation flow -----------------------------------------------
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<'POLYGON' | 'CIRCLE'>('POLYGON');

  // ----- Temporary drawing state (before zone is named / confirmed) -------
  const [pendingPolygonPaths, setPendingPolygonPaths] = useState<google.maps.LatLngLiteral[]>([]);
  const [pendingCircleCenter, setPendingCircleCenter] = useState<google.maps.LatLngLiteral | null>(
    null,
  );
  const [pendingRadiusKm, setPendingRadiusKm] = useState(5);

  // ----- Refs for editable shapes -----------------------------------------
  const polygonRefs = useRef<Map<string, google.maps.Polygon | null>>(new Map());
  const circleRefs = useRef<Map<string, google.maps.Circle | null>>(new Map());
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  // ----- Google Maps loader -----------------------------------------------
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // ----- Map click handler (outlet location) ------------------------------
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (drawingMode) return; // Don't place marker while drawing
      if (e.latLng) {
        const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setOutletLocation(loc);
        onLocationSelect(loc);
      }
    },
    [drawingMode, onLocationSelect],
  );

  // ----- Drawing completion handlers (from ZoneEditor pattern) ------------
  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const paths = polygon.getPath();
    const coordinates: google.maps.LatLngLiteral[] = [];

    for (let i = 0; i < paths.getLength(); i++) {
      const point = paths.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    // Close the polygon
    if (coordinates.length > 0) {
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first.lat !== last.lat || first.lng !== last.lng) {
        coordinates.push(first);
      }
    }

    setPendingPolygonPaths(coordinates);
    setDrawingMode(null);
    polygon.setMap(null);
  }, []);

  const handleCircleComplete = useCallback((circle: google.maps.Circle) => {
    const center = circle.getCenter();
    const radius = circle.getRadius();

    if (center && radius >= 100) {
      setPendingCircleCenter({ lat: center.lat(), lng: center.lng() });
      setPendingRadiusKm(Math.round((radius / 1000) * 100) / 100);
      setDrawingMode(null);
    }

    circle.setMap(null);
  }, []);

  const handleDrawingManagerLoad = useCallback(
    (drawingManager: google.maps.drawing.DrawingManager) => {
      drawingManagerRef.current = drawingManager;
    },
    [],
  );

  // ----- Derived state: is the pending zone ready to confirm? -------------
  const pendingZoneReady =
    isAddingZone &&
    newZoneName.trim() !== '' &&
    ((newZoneType === 'POLYGON' && pendingPolygonPaths.length >= 3) ||
      (newZoneType === 'CIRCLE' && pendingCircleCenter !== null));

  // ----- Explicit zone confirmation (replaces auto-create useEffect) ------
  const handleConfirmZone = useCallback(() => {
    if (!newZoneName.trim()) return;

    const zone: PendingZone = {
      id: crypto.randomUUID(),
      name: newZoneName.trim(),
      zone_type: newZoneType,
      is_active: true,
    };

    if (newZoneType === 'POLYGON') {
      const coordinates = pendingPolygonPaths.map((p) => [p.lng, p.lat]);
      // Close the polygon
      if (coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates.push(first);
        }
      }
      zone.boundary = { type: 'Polygon', coordinates: [coordinates] };
    } else {
      zone.center = pendingCircleCenter!;
      zone.radius_km = pendingRadiusKm;
    }

    onZonesChange([...zones, zone]);

    // Reset form
    setIsAddingZone(false);
    setNewZoneName('');
    setPendingPolygonPaths([]);
    setPendingCircleCenter(null);
    setPendingRadiusKm(5);
  }, [newZoneName, newZoneType, pendingPolygonPaths, pendingCircleCenter, pendingRadiusKm, zones, onZonesChange]);

  // ----- Start drawing after user clicks "Start Drawing" ------------------
  const handleStartDrawing = useCallback(() => {
    if (!newZoneName.trim()) return;
    if (newZoneType === 'POLYGON') {
      setPendingPolygonPaths([]);
      setPendingCircleCenter(null);
      setDrawingMode('polygon');
    } else {
      setPendingCircleCenter(null);
      setPendingPolygonPaths([]);
      setDrawingMode('circle');
    }
  }, [newZoneName, newZoneType]);

  // ----- Remove a zone ----------------------------------------------------
  const handleRemoveZone = useCallback(
    (zoneId: string) => {
      onZonesChange(zones.filter((z) => z.id !== zoneId));
      polygonRefs.current.delete(zoneId);
      circleRefs.current.delete(zoneId);
    },
    [zones, onZonesChange],
  );

  // ----- Capture polygon edits --------------------------------------------
  const handlePolygonMouseUp = useCallback(
    (zoneId: string) => {
      const polygon = polygonRefs.current.get(zoneId);
      if (!polygon) return;

      const paths = polygon.getPath();
      const coordinates: google.maps.LatLngLiteral[] = [];
      for (let i = 0; i < paths.getLength(); i++) {
        const point = paths.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      const updatedZones = zones.map((z) => {
        if (z.id !== zoneId) return z;
        const coords = coordinates.map((p) => [p.lng, p.lat]);
        return { ...z, boundary: { type: 'Polygon' as const, coordinates: [coords] } };
      });
      onZonesChange(updatedZones);
    },
    [zones, onZonesChange],
  );

  // ----- Capture circle edits ---------------------------------------------
  const handleCircleRadiusChanged = useCallback(
    (zoneId: string) => {
      const circle = circleRefs.current.get(zoneId);
      if (!circle) return;

      const radius = circle.getRadius();
      const updatedZones = zones.map((z) =>
        z.id === zoneId ? { ...z, radius_km: Math.round((radius / 1000) * 100) / 100 } : z,
      );
      onZonesChange(updatedZones);
    },
    [zones, onZonesChange],
  );

  const handleCircleCenterChanged = useCallback(
    (zoneId: string) => {
      const circle = circleRefs.current.get(zoneId);
      if (!circle) return;

      const center = circle.getCenter();
      if (!center) return;

      const updatedZones = zones.map((z) =>
        z.id === zoneId ? { ...z, center: { lat: center.lat(), lng: center.lng() } } : z,
      );
      onZonesChange(updatedZones);
    },
    [zones, onZonesChange],
  );

  // ----- Cancel adding zone -----------------------------------------------
  const handleCancelAddZone = useCallback(() => {
    setIsAddingZone(false);
    setNewZoneName('');
    setPendingPolygonPaths([]);
    setPendingCircleCenter(null);
    setPendingRadiusKm(5);
    setDrawingMode(null);
  }, []);

  // ----- Memoized marker icon (guards against SSR / partial init) ---------
  const markerIcon = useMemo(() => {
    if (!isLoaded || typeof google === 'undefined' || !google.maps) return undefined;
    return {
      url: OUTLET_MARKER_ICON,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32),
    };
  }, [isLoaded]);

  // ----- Error state: missing API key ------------------------------------
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-white">
          <div>
            <h1
              className="text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Set Location &amp; Zones — {outletName}
            </h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <p className="text-destructive font-medium">Google Maps API key is missing</p>
            <p className="text-muted-foreground text-sm">
              Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-white">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
        </footer>
      </div>
    );
  }

  // ----- Error state: load error -----------------------------------------
  if (loadError) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-white">
          <div>
            <h1
              className="text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Set Location &amp; Zones — {outletName}
            </h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <p className="text-destructive font-medium">Failed to load Google Maps</p>
            <p className="text-muted-foreground text-sm">
              Please check your Google Maps API key configuration and try again.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-white">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
        </footer>
      </div>
    );
  }

  // ========================================================================
  // Main render
  // ========================================================================
  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-white">
        <div className="flex items-center gap-6">
          <h1 className="text-base font-semibold text-primary">
            Set Location &amp; Zones — {outletName}
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                1
              </span>
              <span className="text-xs text-muted-foreground">Details</span>
            </div>

            <div className="w-6 h-px bg-border" />

            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
                2
              </span>
              <span className="text-xs text-primary font-medium">Location &amp; Zones</span>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content: Sidebar + Map                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 min-h-0">
        {/* -------------------------------------------------------------- */}
        {/* Sidebar                                                        */}
        {/* -------------------------------------------------------------- */}
        <aside className="w-80 flex flex-col border-r border-border/40 bg-white overflow-y-auto">
          {/* Outlet Location card */}
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Outlet Location
            </p>
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {outletLocation ? 'Location selected' : 'Click map to set location'}
                </span>
              </div>
              {outletLocation && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lat:</span>
                    <span className="font-mono text-xs">{outletLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lng:</span>
                    <span className="font-mono text-xs">{outletLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
              )}
              {outletLocation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-xs text-muted-foreground"
                  onClick={() => {
                    setOutletLocation(null);
                    onLocationSelect(undefined);
                  }}
                >
                  Clear location
                </Button>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border/40" />

          {/* Zones section */}
          <div className="p-4 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Delivery Zones ({zones.length})
            </p>

            {/* Zone list */}
            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-2xl bg-white border border-border/40 shadow-sm p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{zone.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {zone.zone_type === 'POLYGON' ? (
                        <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                          <Square className="h-2.5 w-2.5" />
                          Polygon
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                          <CircleIcon className="h-2.5 w-2.5" />
                          {zone.radius_km}km
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveZone(zone.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Zone inline form */}
            {isAddingZone ? (
              <div className="mt-3 rounded-2xl bg-white border border-border/40 shadow-sm p-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Zone Name
                  </Label>
                  <Input
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="e.g., Anna Nagar Zone"
                    className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Zone Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={newZoneType === 'POLYGON' ? 'default' : 'outline'}
                      onClick={() => setNewZoneType('POLYGON')}
                      className="gap-1.5 rounded-full text-xs"
                    >
                      <Square className="h-3.5 w-3.5" />
                      Polygon
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={newZoneType === 'CIRCLE' ? 'default' : 'outline'}
                      onClick={() => setNewZoneType('CIRCLE')}
                      className="gap-1.5 rounded-full text-xs"
                    >
                      <CircleIcon className="h-3.5 w-3.5" />
                      Circle
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 rounded-full text-xs"
                    disabled={!newZoneName.trim() || !!drawingMode}
                    onClick={handleStartDrawing}
                  >
                    {drawingMode ? (
                      <span className="flex items-center gap-1.5">
                        <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                        Drawing...
                      </span>
                    ) : (
                      <>
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        Start Drawing
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={handleCancelAddZone}
                  >
                    Cancel
                  </Button>
                </div>

                {drawingMode && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {drawingMode === 'polygon'
                      ? 'Click on the map to add polygon points. Click the first point or double-click to finish.'
                      : 'Click and drag on the map to draw a circle.'}
                  </p>
                )}

                {pendingZoneReady && (
                  <Button
                    type="button"
                    size="sm"
                    className="w-full rounded-full text-xs"
                    onClick={handleConfirmZone}
                  >
                    Confirm Zone
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full rounded-full gap-1.5 text-xs"
                onClick={() => setIsAddingZone(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Zone
              </Button>
            )}
          </div>
        </aside>

        {/* -------------------------------------------------------------- */}
        {/* Map                                                             */}
        {/* -------------------------------------------------------------- */}
        <div className="flex-1 relative">
          {isLoaded ? (
            <>
              <GoogleMap
                mapContainerClassName="w-full h-full"
                center={outletLocation ?? DEFAULT_CENTER}
                zoom={outletLocation ? 14 : DEFAULT_ZOOM}
                options={{
                  mapTypeId: 'roadmap',
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: true,
                }}
                onClick={handleMapClick}
              >
                {/* Drawing Manager (only active during zone creation) */}
                {isAddingZone && drawingMode && (
                  <DrawingManager
                    onLoad={handleDrawingManagerLoad}
                    options={{
                      drawingControl: false,
                      drawingMode: drawingMode
                        ? google.maps.drawing.OverlayType[
                            drawingMode === 'polygon' ? 'POLYGON' : 'CIRCLE'
                          ]
                        : null,
                      polygonOptions: {
                        ...ZONE_COLORS,
                        editable: true,
                        draggable: true,
                      },
                      circleOptions: {
                        ...ZONE_COLORS,
                        editable: true,
                        draggable: true,
                      },
                    }}
                    onPolygonComplete={handlePolygonComplete}
                    onCircleComplete={handleCircleComplete}
                  />
                )}

                {/* Outlet marker */}
                {outletLocation && (
                  <Marker
                    position={outletLocation}
                    icon={markerIcon}
                  />
                )}

                {/* Render zones */}
                {zones.map((zone) => {
                  if (zone.zone_type === 'POLYGON' && zone.boundary) {
                    const paths = zone.boundary.coordinates[0].map(([lng, lat]) => ({
                      lat,
                      lng,
                    }));
                    return (
                      <Polygon
                        key={zone.id}
                        paths={paths}
                        options={{
                          ...ZONE_COLORS,
                          editable: true,
                          draggable: true,
                        }}
                        onLoad={(polygon) => {
                          polygonRefs.current.set(zone.id, polygon);
                        }}
                        onMouseUp={() => handlePolygonMouseUp(zone.id)}
                      />
                    );
                  }

                  if (zone.zone_type === 'CIRCLE' && zone.center) {
                    return (
                      <Circle
                        key={zone.id}
                        center={zone.center}
                        radius={(zone.radius_km ?? 5) * 1000}
                        options={{
                          ...ZONE_COLORS,
                          editable: true,
                          draggable: true,
                        }}
                        onLoad={(circle) => {
                          circleRefs.current.set(zone.id, circle);
                        }}
                        onRadiusChanged={() => handleCircleRadiusChanged(zone.id)}
                        onCenterChanged={() => handleCircleCenterChanged(zone.id)}
                      />
                    );
                  }

                  return null;
                })}
              </GoogleMap>

              {/* Drawing controls overlay (top-left) */}
              {isAddingZone && !drawingMode && (
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    type="button"
                    variant={newZoneType === 'POLYGON' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setNewZoneType('POLYGON');
                    }}
                    className="shadow-lg rounded-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Draw Polygon
                  </Button>
                  <Button
                    type="button"
                    variant={newZoneType === 'CIRCLE' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setNewZoneType('CIRCLE');
                    }}
                    className="shadow-lg rounded-full"
                  >
                    <CircleIcon className="h-4 w-4 mr-2" />
                    Draw Circle
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelAddZone}
                    className="shadow-lg rounded-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Drawing mode indicator (top-right) */}
              {drawingMode && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium">
                  Click on map to draw {drawingMode}
                </div>
              )}

              {/* Location instruction */}
              {!outletLocation && !drawingMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-border/40 rounded-2xl px-5 py-3 shadow-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Click anywhere on the map to set the outlet location
                  </p>
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

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-white">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>

        <Button
          onClick={onCreateOutlet}
          disabled={isLoading || !outletLocation}
          className="rounded-full bg-primary text-white hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : zones.length > 0 ? (
            `Create Outlet with ${zones.length} Zone${zones.length > 1 ? 's' : ''}`
          ) : (
            'Create Outlet'
          )}
        </Button>
      </footer>
    </div>
  );
}
