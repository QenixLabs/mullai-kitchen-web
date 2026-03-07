"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap as GoogleMapComponent,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { FaMapMarkerAlt } from "react-icons/fa";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (Chennai, India)
const defaultCenter = {
  lat: 13.0827,
  lng: 80.2707,
};

const defaultZoom = 14;

export interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

export function GoogleMap({
  center = defaultCenter,
  zoom = defaultZoom,
  onLocationChange,
  className,
  height = "h-48",
  onClick,
  children,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [mapCenter, setMapCenter] = useState(center);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Sync the center prop to local state when it changes
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (loadError) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center ${height} ${className}`}
      >
        <div className="text-center p-4">
          <FaMapMarkerAlt className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Unable to load map</p>
          <p className="text-xs text-slate-400 mt-1">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center ${height} ${className}`}
      >
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${height} rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {children ? children : <Marker position={mapCenter} />}
      </GoogleMapComponent>

      {/* Pin with pulse animation overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm text-slate-700 pointer-events-none">
        Location marker
      </div>
    </div>
  );
}
