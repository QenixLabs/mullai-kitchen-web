"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Marker } from "@react-google-maps/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaMapMarkerAlt, FaSearch, FaCheckCircle, FaHome, FaBuilding, FaEllipsisH } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { GoogleMap } from "./GoogleMap";
import { addressFormSchema, type AddressFormData } from "@/lib/validations";
import { useServiceability } from "@/api/hooks/useCustomer";
import { useCreateAddress } from "@/api/hooks/useCreateAddress";
import { useUpdateAddress } from "@/api/hooks/useUpdateAddress";
import { toast } from "sonner";
import type { Address } from "@/api/types/customer.types";

export interface AddressSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** Pass an existing address to open the modal in edit mode */
  editAddress?: Address;
}

const EMPTY_ADDRESS: AddressFormData = {
  type: "Home",
  flat_house_no: "",
  floor: "",
  full_address: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  landmark: "",
};

// Chennai default coordinates
const DEFAULT_COORDS = { lat: 13.0827, lng: 80.2707 };

export function AddressSelectionModal({
  open,
  onOpenChange,
  onSuccess,
  editAddress,
}: AddressSelectionModalProps) {
  const { mutateAsync: checkServiceability } = useServiceability();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const isEditMode = !!editAddress;

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState(
    editAddress?.lat && editAddress?.lng
      ? { lat: editAddress.lat, lng: editAddress.lng }
      : DEFAULT_COORDS
  );
  const [serviceabilityInfo, setServiceabilityInfo] = useState<{
    isServiceable: boolean;
    message: string;
  } | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    editAddress?.lat && editAddress?.lng
      ? { lat: editAddress.lat, lng: editAddress.lng }
      : null
  );
  const [coordinatesRequired, setCoordinatesRequired] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: EMPTY_ADDRESS,
  });

  // When editAddress changes (modal opens in edit mode), pre-fill the form
  useEffect(() => {
    if (open && editAddress) {
      form.reset({
        type: editAddress.type,
        flat_house_no: "",
        floor: "",
        full_address: editAddress.full_address,
        area: editAddress.area,
        pincode: editAddress.pincode,
        city: editAddress.city,
        state: editAddress.state,
        landmark: editAddress.landmark || "",
      });
      if (editAddress.lat && editAddress.lng) {
        const coords = { lat: editAddress.lat, lng: editAddress.lng };
        setMapCenter(coords);
        setCoordinates(coords);
      } else {
        setCoordinates(null);
        setMapCenter(DEFAULT_COORDS);
      }
    } else if (open && !editAddress) {
      form.reset(EMPTY_ADDRESS);
      setCoordinates(null);
      setMapCenter(DEFAULT_COORDS);
    }
  }, [open, editAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const pincodeValue = form.watch("pincode");

  // Serviceability check on pincode change or coordinates update
  useEffect(() => {
    const hasValidPincode = pincodeValue.length === 6;
    const hasCoordinates = coordinates !== null;

    if (!hasValidPincode && !hasCoordinates) {
      setServiceabilityInfo(null);
      return;
    }

    const pincodeToCheck = pincodeValue;
    const coordsToCheck = coordinates;
    const timeoutId = setTimeout(() => {
      const payload = coordsToCheck
        ? { lat: coordsToCheck.lat, lng: coordsToCheck.lng }
        : { pincode: pincodeToCheck };

      checkServiceability(payload)
        .then((result) => {
          const currentPincode = form.getValues("pincode");
          if (!coordsToCheck && currentPincode !== pincodeToCheck) return;

          if (result.isServiceable) {
            setServiceabilityInfo({
              isServiceable: true,
              message: coordsToCheck
                ? "We are currently delivering to this location."
                : `We are currently delivering in this location (Pincode: ${pincodeToCheck}).`,
            });
          } else {
            setServiceabilityInfo({
              isServiceable: false,
              message: "We do not serve this location yet. You can still save this address.",
            });
          }
        })
        .catch(() => {
          setServiceabilityInfo({
            isServiceable: false,
            message: "Unable to verify serviceability right now.",
          });
        });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [checkServiceability, form, pincodeValue, coordinates]);

  const buildFullAddress = () => {
    const flat = form.getValues("flat_house_no") || "";
    const floor = form.getValues("floor") || "";
    const fullAddress = form.getValues("full_address") || "";
    return [flat, floor, fullAddress].filter(Boolean).join(", ");
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results?.[0]) {
        const addressComponents = data.results[0].address_components || [];
        const findComponent = (types: string[]) =>
          addressComponents.find((comp: google.maps.GeocoderAddressComponent | undefined) =>
            comp?.types?.some((type: string) => types.includes(type))
          );

        const streetNumber = findComponent(["street_number"])?.long_name || "";
        const route = findComponent(["route"])?.long_name || "";
        const locality = findComponent(["locality"])?.long_name || "";
        const sublocality = findComponent(["sublocality"])?.long_name || "";
        const administrativeAreaLevel2 = findComponent(["administrative_area_level_2"])?.long_name || "";
        const administrativeAreaLevel1 = findComponent(["administrative_area_level_1"])?.long_name || "";
        const postalCode = findComponent(["postal_code"])?.long_name || "";

        const areaParts = [streetNumber, route, sublocality].filter(Boolean);
        const area = areaParts.join(" ") || locality;

        form.setValue("area", area, { shouldValidate: false });
        form.setValue("city", locality, { shouldValidate: false });
        form.setValue("state", administrativeAreaLevel1 || administrativeAreaLevel2, { shouldValidate: false });
        form.setValue("pincode", postalCode, { shouldValidate: false });
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast.error("Unable to get address details from location");
    }
  };

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setMapCenter(newCoords);
        setCoordinates(newCoords);
        setCoordinatesRequired(false);
        await reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);
        toast.success("Location updated and address filled");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to get your location. Please enable location permissions.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    if (!coordinates) {
      setCoordinatesRequired(true);
      toast.error("Please select a location on the map");
      return;
    }

    const fullAddress = buildFullAddress();
    const formData = form.getValues();

    const payload = {
      type: formData.type,
      full_address: fullAddress,
      area: formData.area,
      pincode: formData.pincode,
      city: formData.city,
      state: formData.state,
      landmark: formData.landmark,
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    try {
      if (isEditMode && editAddress) {
        await updateAddress.mutateAsync({ id: editAddress._id, payload });
      } else {
        await createAddress.mutateAsync(payload);
      }

      handleClose();
      onSuccess?.();
    } catch {
      toast.error(`Failed to ${isEditMode ? "update" : "save"} address. Please try again.`);
    }
  };

  const handleClose = () => {
    form.reset(EMPTY_ADDRESS);
    setSearchQuery("");
    setServiceabilityInfo(null);
    setMapCenter(DEFAULT_COORDS);
    setCoordinates(null);
    setCoordinatesRequired(false);
    onOpenChange(false);
  };

  const isPending = createAddress.isPending || updateAddress.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-primary/10 text-primary">
              <FaMapMarkerAlt className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {isEditMode ? "Edit Delivery Address" : "Select Delivery Address"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Map Section */}
          <div className="space-y-2">
            <GoogleMap
              center={mapCenter}
              height="h-48"
              onClick={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setCoordinates({ lat, lng });
                  setMapCenter({ lat, lng });
                  setCoordinatesRequired(false);
                  reverseGeocode(lat, lng);
                }
              }}
            >
              {coordinates && <Marker position={coordinates} />}
            </GoogleMap>
            {coordinatesRequired && (
              <p className="text-xs text-destructive font-medium">
                Please select a location on the map by clicking on it
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg gap-2"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              <FaMapMarkerAlt className="h-5 w-5" />
              {isGettingLocation ? "Getting location..." : "Use Current Location"}
            </Button>
          </div>

          {/* Search Section */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              placeholder="Search for area, street name or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg"
            />
          </div>

          {/* Serviceability Info */}
          {serviceabilityInfo && (
            <div
              className={`rounded-lg p-3 flex items-start gap-3 ${
                serviceabilityInfo.isServiceable
                  ? "bg-green-50 border border-green-100"
                  : "bg-amber-50 border border-amber-100"
              }`}
            >
              <FaCheckCircle
                className={`text-xl ${
                  serviceabilityInfo.isServiceable ? "text-green-600" : "text-amber-600"
                }`}
              />
              <div>
                <p className={`text-sm font-semibold ${serviceabilityInfo.isServiceable ? "text-green-800" : "text-amber-800"}`}>
                  {serviceabilityInfo.isServiceable ? "Serviceable Area" : "Limited Service"}
                </p>
                <p className={`text-xs ${serviceabilityInfo.isServiceable ? "text-green-700" : "text-amber-700"}`}>
                  {serviceabilityInfo.message}
                </p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Address Details</h3>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="flat_house_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Flat / House No / Building Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Flat 101, Block A" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Floor (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2nd Floor" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Landmark</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Near Temple, School" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Area *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Anna Nagar" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">City *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Chennai" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">State *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Tamil Nadu" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Pincode *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                            field.onChange(onlyDigits);
                          }}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="full_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-500">Additional Address Details (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Gate color, building number" className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Type */}
                <div>
                  <FormLabel className="text-xs font-medium text-slate-500 mb-2 block uppercase tracking-wide">Save As</FormLabel>
                  <div className="flex gap-3">
                    {(["Home", "Office", "Other"] as const).map((type) => (
                      <label key={type} className="flex-1 cursor-pointer">
                        <input type="radio" {...form.register("type")} value={type} className="hidden peer" />
                        <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          // eslint-disable-next-line react-hooks/incompatible-library
                          form.watch("type") === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                          {type === "Home" && <FaHome className="h-4 w-4" />}
                          {type === "Office" && <FaBuilding className="h-4 w-4" />}
                          {type === "Other" && <FaEllipsisH className="h-4 w-4" />}
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {isPending ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Address" : "Save & Proceed")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
