"use client";

import { MapPin, LocateFixed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoogleMap } from "@/components/customer/profile/GoogleMap";
import { Marker } from "@react-google-maps/api";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";

interface Step1DeliveryProps {
  register: UseFormRegister<CreateCorporateOrderFormData>;
  errors: FieldErrors<CreateCorporateOrderFormData>;
  setValue: UseFormSetValue<CreateCorporateOrderFormData>;
  coordinates: { lat: number; lng: number } | null;
  mapCenter: { lat: number; lng: number };
  isGettingLocation: boolean;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onGetCurrentLocation: () => void;
}

export function Step1Delivery({
  register,
  errors,
  setValue,
  coordinates,
  mapCenter,
  isGettingLocation,
  onMapClick,
  onGetCurrentLocation,
}: Step1DeliveryProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Map Section */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Pin Delivery Location</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Drag the marker or search for your corporate office.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGetCurrentLocation}
            disabled={isGettingLocation}
            className="gap-2 self-start"
          >
            <LocateFixed className="h-4 w-4" />
            {isGettingLocation ? "Getting location..." : "Use Current Location"}
          </Button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-border">
          <GoogleMap center={mapCenter} height="h-48 sm:h-64" onClick={onMapClick}>
            {coordinates && <Marker position={coordinates} />}
          </GoogleMap>
        </div>
      </div>

      {/* Address Details Form */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#44151C]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#44151C]">Address Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line" className="text-xs uppercase tracking-wider text-muted-foreground">
              Address Line
            </Label>
            <Input
              id="address_line"
              placeholder="e.g. Building name, floor, street details"
              {...register("delivery_address.address_line")}
            />
            {errors.delivery_address?.address_line && (
              <p className="text-sm text-destructive">{errors.delivery_address.address_line.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode" className="text-xs uppercase tracking-wider text-muted-foreground">
              Pincode
            </Label>
            <Input
              id="pincode"
              placeholder="6-digit pincode"
              maxLength={6}
              {...register("delivery_address.pincode", {
                onChange: (e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setValue("delivery_address.pincode", onlyDigits, { shouldValidate: true });
                },
              })}
            />
            {errors.delivery_address?.pincode && (
              <p className="text-sm text-destructive">{errors.delivery_address.pincode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-xs uppercase tracking-wider text-muted-foreground">
              Area / Locality
            </Label>
            <Input
              id="area"
              placeholder="e.g. T. Nagar"
              {...register("delivery_address.area")}
            />
            {errors.delivery_address?.area && (
              <p className="text-sm text-destructive">{errors.delivery_address.area.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">
              State
            </Label>
            <Input
              id="state"
              placeholder="e.g. Tamil Nadu"
              {...register("delivery_address.state")}
            />
            {errors.delivery_address?.state && (
              <p className="text-sm text-destructive">{errors.delivery_address.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">
              City
            </Label>
            <Input
              id="city"
              placeholder="e.g. Chennai"
              {...register("delivery_address.city")}
            />
            {errors.delivery_address?.city && (
              <p className="text-sm text-destructive">{errors.delivery_address.city.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="landmark" className="text-xs uppercase tracking-wider text-muted-foreground">
              Landmark (Optional)
            </Label>
            <Input
              id="landmark"
              placeholder="e.g. Near Metro Station"
              {...register("delivery_address.landmark")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
