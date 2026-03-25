"use client";

import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Store,
  LocateIcon as MyLocation,
} from "lucide-react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Marker } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoogleMap } from "@/components/customer/profile/GoogleMap";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

interface ServiceabilityInfo {
  isServiceable: boolean;
  outletName?: string;
  message: string;
}

export interface DeliverySectionProps {
  register: UseFormRegister<CreateCorporateOrderFormData>;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  setValue: UseFormSetValue<CreateCorporateOrderFormData>;
  coordinates: { lat: number; lng: number } | null;
  mapCenter: { lat: number; lng: number };
  isGettingLocation: boolean;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onGetCurrentLocation: () => void;
  serviceabilityInfo: ServiceabilityInfo | null;
  isCheckingServiceability: boolean;
}

export function DeliverySection({
  register,
  errors,
  setValue,
  coordinates,
  mapCenter,
  isGettingLocation,
  onMapClick,
  onGetCurrentLocation,
  serviceabilityInfo,
  isCheckingServiceability,
}: DeliverySectionProps) {
  return (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="p-6 pt-7 space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="h-5 w-5 text-primary" />
            Delivery Details
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select your delivery location on the map or enter the pincode. The
            kitchen outlet will be auto-assigned.
          </p>
        </div>

        {/* Map Section */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Pin your delivery location
            </h3>
            <p className="text-xs text-muted-foreground">
              Click on the map to mark your exact delivery location, or use your
              current location.
            </p>
          </div>

          <GoogleMap
            center={mapCenter}
            height="h-48"
            onClick={onMapClick}
          >
            {coordinates && <Marker position={coordinates} />}
          </GoogleMap>

          <Button
            type="button"
            variant="ghost"
            className="w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl gap-2"
            onClick={onGetCurrentLocation}
            disabled={isGettingLocation}
          >
            <MyLocation className="h-4 w-4" />
            {isGettingLocation
              ? "Getting location..."
              : "Use Current Location"}
          </Button>

          {/* Selected coordinates display */}
          {coordinates && (
            <div className="flex items-center gap-2 text-xs text-success bg-success/5 border border-success/20 rounded-xl px-3 py-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Location pinned: {coordinates.lat.toFixed(6)},{" "}
                {coordinates.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        {/* Serviceability Status */}
        {serviceabilityInfo && (
          <div
            className={`rounded-xl p-3 flex items-start gap-3 ${
              serviceabilityInfo.isServiceable
                ? "bg-success/5 border border-success/20"
                : "bg-warning/5 border border-warning/20"
            }`}
          >
            {serviceabilityInfo.isServiceable ? (
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  serviceabilityInfo.isServiceable
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {serviceabilityInfo.isServiceable
                  ? "Serviceable Area"
                  : "Not Serviceable"}
              </p>
              <p
                className={`text-xs ${
                  serviceabilityInfo.isServiceable
                    ? "text-success/80"
                    : "text-warning/80"
                }`}
              >
                {serviceabilityInfo.message}
              </p>
              {serviceabilityInfo.isServiceable &&
                serviceabilityInfo.outletName && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Store className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-medium text-success">
                      {serviceabilityInfo.outletName}
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Address form fields */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Address Details
          </h3>
          <p className="text-xs text-muted-foreground">
            {coordinates
              ? "Fields below were auto-filled from the map. You can edit them if needed."
              : "Enter your delivery address manually or use the map above."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address_line">Address Line</Label>
            <Input
              id="address_line"
              placeholder="Building name, street, etc."
              {...register("delivery_address.address_line")}
            />
            {errors.delivery_address?.address_line && (
              <p className="text-sm text-destructive">
                {errors.delivery_address.address_line.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <div className="relative">
              <FaMapMarkerAlt
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                className="pl-9"
                {...register("delivery_address.pincode", {
                  onChange: (e) => {
                    const onlyDigits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setValue("delivery_address.pincode", onlyDigits, {
                      shouldValidate: true,
                    });
                  },
                })}
              />
              {isCheckingServiceability && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {errors.delivery_address?.pincode && (
              <p className="text-sm text-destructive">
                {errors.delivery_address.pincode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area / Locality</Label>
            <Input
              id="area"
              placeholder="e.g., T. Nagar"
              {...register("delivery_address.area")}
            />
            {errors.delivery_address?.area && (
              <p className="text-sm text-destructive">
                {errors.delivery_address.area.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              placeholder="e.g., Near Metro Station"
              {...register("delivery_address.landmark")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g., Chennai"
              {...register("delivery_address.city")}
            />
            {errors.delivery_address?.city && (
              <p className="text-sm text-destructive">
                {errors.delivery_address.city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="e.g., Tamil Nadu"
              {...register("delivery_address.state")}
            />
            {errors.delivery_address?.state && (
              <p className="text-sm text-destructive">
                {errors.delivery_address.state.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
