"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  LayersControl,
  LayerGroup,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icon for kitchen
export const kitchenIcon = L.divIcon({
  className: "kitchen-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 60px; height: 60px; background: #39070F; border-radius: 50%; opacity: 0.15; animation: kitchenPing 2s ease-out infinite;"></div>
      <div style="position: absolute; width: 48px; height: 48px; background: #39070F; border-radius: 50%; opacity: 0.25; animation: kitchenPulse 2s ease-in-out infinite;"></div>
      <div style="position: relative; width: 40px; height: 40px; background: linear-gradient(135deg, #39070F 0%, #5a0f1a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(57, 7, 15, 0.4); border: 3px solid white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
          <line x1="6" y1="17" x2="18" y2="17"/>
        </svg>
      </div>
    </div>
    <style>
      @keyframes kitchenPing {
        0% { transform: scale(1); opacity: 0.15; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes kitchenPulse {
        0%, 100% { transform: scale(1); opacity: 0.25; }
        50% { transform: scale(1.2); opacity: 0.15; }
      }
    </style>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -30],
});

// Custom marker icon for active delivery zones
export const activeZoneIcon = L.divIcon({
  className: "zone-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 20px; height: 20px; background: #10B981; border-radius: 50%; animation: zonePing 1.5s ease-out infinite;"></div>
      <div style="position: relative; width: 12px; height: 12px; background: #10B981; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);"></div>
    </div>
    <style>
      @keyframes zonePing {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Custom marker icon for inactive delivery zones
export const inactiveZoneIcon = L.divIcon({
  className: "zone-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="width: 10px; height: 10px; background: #9CA3AF; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>
    </div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Map Context
interface MapContextValue {
  map: L.Map | null;
}

const MapContext = React.createContext<MapContextValue>({ map: null });

function useMapContext() {
  return React.useContext(MapContext);
}

// Map Controller Component
function MapController({
  center,
  zoom,
  className,
  children,
  ...props
}: {
  center: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<typeof MapContainer>, "center" | "zoom">) {
  const [map, setMap] = React.useState<L.Map | null>(null);

  return (
    <MapContext.Provider value={{ map }}>
      <MapContainer
        center={center}
        zoom={zoom ?? 13}
        className={cn("h-full w-full rounded-2xl", className)}
        zoomControl={false}
        scrollWheelZoom={true}
        ref={(mapInstance) => {
          if (mapInstance) {
            setMap(mapInstance);
          }
        }}
        {...props}
      >
        {children}
      </MapContainer>
    </MapContext.Provider>
  );
}

// Tile Layer Component
function MapTileLayer({
  url,
  attribution,
  name,
}: {
  url?: string;
  attribution?: string;
  name?: string;
}) {
  const defaultUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const defaultAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <TileLayer
      url={url ?? defaultUrl}
      attribution={attribution ?? defaultAttribution}
    />
  );
}

// Satellite Tile Layer Component
function MapSatelliteLayer() {
  return (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    />
  );
}

// Hybrid Layer (Satellite + Labels)
function MapHybridLayer() {
  return (
    <>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri"
      />
      <TileLayer
        url="https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png"
        attribution=""
        opacity={0.5}
      />
    </>
  );
}

// Dark Map Layer
function MapDarkLayer() {
  return (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    />
  );
}

// Marker Component
function MapMarker({
  position,
  children,
  icon,
}: {
  position: [number, number];
  children?: React.ReactNode;
  icon?: L.Icon | L.DivIcon;
}) {
  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
}

// Popup Component
function MapPopup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popup className={cn("custom-popup", className)}>
      <div className="min-w-[180px]">{children}</div>
    </Popup>
  );
}

// Circle Component for delivery zones
function MapCircle({
  center,
  radius,
  color = "#39070F",
  fillColor = "#39070F",
  fillOpacity = 0.15,
  children,
}: {
  center: [number, number];
  radius: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  children?: React.ReactNode;
}) {
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color,
        fillColor,
        fillOpacity,
        weight: 2,
      }}
    >
      {children}
    </Circle>
  );
}

// Zoom Control Component
function MapZoomControl({ position = "bottomright" }: { position?: "topleft" | "topright" | "bottomleft" | "bottomright" }) {
  return <ZoomControl position={position} />;
}

// Layer Control Component
function MapLayerControl({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayersControl position="topright">{children}</LayersControl>;
}

// Base Layer Component
function MapBaseLayer({
  name,
  children,
  checked = false,
}: {
  name: string;
  children: React.ReactNode;
  checked?: boolean;
}) {
  return (
    <LayersControl.BaseLayer name={name} checked={checked}>
      <LayerGroup>{children}</LayerGroup>
    </LayersControl.BaseLayer>
  );
}

// Export compound component
export const Map = Object.assign(MapController, {
  TileLayer: MapTileLayer,
  SatelliteLayer: MapSatelliteLayer,
  HybridLayer: MapHybridLayer,
  DarkLayer: MapDarkLayer,
  Marker: MapMarker,
  Popup: MapPopup,
  Circle: MapCircle,
  ZoomControl: MapZoomControl,
  LayerControl: MapLayerControl,
  BaseLayer: MapBaseLayer,
});

export { useMapContext };
