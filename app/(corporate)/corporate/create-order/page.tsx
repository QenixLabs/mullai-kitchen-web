"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  MapPin,
  Users,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stepper } from "@/components/ui/stepper";
import { CorporatePageHeader } from "@/components/corporate/CorporatePageHeader";
import { DeliverySection } from "@/components/corporate/create-order/DeliverySection";
import { ScheduleSection } from "@/components/corporate/create-order/ScheduleSection";
import { QuantitySection } from "@/components/corporate/create-order/QuantitySection";
import { OrderSummary } from "@/components/corporate/create-order/OrderSummary";
import { useCreateCorporateOrder } from "@/api/hooks/useCorporate";
import { useServiceability } from "@/api/hooks/useCustomer";
import {
  createCorporateOrderSchema,
  type CreateCorporateOrderFormData,
} from "@/lib/validations/corporate.schema";
import {
  computeDeliveryDays,
  computeEndDate,
  computePricing,
} from "@/lib/corporate/pricing";

// Chennai default coordinates
const DEFAULT_COORDS = { lat: 13.0827, lng: 80.2707 };

type Step = 1 | 2;

const STEPS = [
  { id: "delivery-schedule", title: "Delivery & Schedule" },
  { id: "quantity-preferences", title: "Headcount & Preferences" },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrderMutation = useCreateCorporateOrder();
  const { mutateAsync: checkServiceability, isPending: isCheckingServiceability } =
    useServiceability();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [serviceabilityInfo, setServiceabilityInfo] = useState<{
    isServiceable: boolean;
    outletName?: string;
    message: string;
  } | null>(null);
  const serviceabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coordinate state for geo-fencing
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDS);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Reverse geocoding to auto-fill address fields from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.results?.[0]) {
        const addressComponents = data.results[0].address_components || [];

        const findComponent = (types: string[]) =>
          addressComponents.find((comp: google.maps.GeocoderAddressComponent | undefined) =>
            comp?.types?.some((type: string) => types.includes(type)),
          );

        const streetNumber = findComponent(["street_number"])?.long_name || "";
        const route = findComponent(["route"])?.long_name || "";
        const sublocality = findComponent(["sublocality"])?.long_name || "";
        const locality = findComponent(["locality"])?.long_name || "";
        const administrativeAreaLevel1 =
          findComponent(["administrative_area_level_1"])?.long_name || "";
        const postalCode = findComponent(["postal_code"])?.long_name || "";

        const areaParts = [streetNumber, route, sublocality].filter(Boolean);
        const area = areaParts.join(" ") || locality;

        setValue("delivery_address.area", area, { shouldValidate: false });
        setValue("delivery_address.city", locality, { shouldValidate: false });
        setValue("delivery_address.state", administrativeAreaLevel1, {
          shouldValidate: false,
        });
        setValue("delivery_address.pincode", postalCode, { shouldValidate: false });
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast.error("Unable to get address details from location");
    }
  };

  // Handle map click to capture coordinates
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCoordinates({ lat, lng });
      setMapCenter({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  // Handle getting current location
  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);
        setMapCenter(newCoords);
        reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);
        toast.success("Location updated and address filled");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(
          "Unable to get your location. Please enable location permissions.",
        );
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const form = useForm<CreateCorporateOrderFormData>({
    resolver: zodResolver(createCorporateOrderSchema) as never,
    defaultValues: {
      delivery_address: {
        address_line: "",
        area: "",
        landmark: "",
        pincode: "",
        city: "",
        state: "",
      },
      selected_days: [],
      meal_types: [],
      start_date: "",
      duration_weeks: 4,
      headcount: 1,
      veg_count: 0,
      nonveg_count: 0,
      notes: "",
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = form;

  const selectedDays = watch("selected_days");
  const mealTypes = watch("meal_types");
  const startDate = watch("start_date");
  const durationWeeks = watch("duration_weeks");
  const headcount = watch("headcount");
  const vegCount = watch("veg_count");
  const nonvegCount = watch("nonveg_count");
  const deliveryAddress = watch("delivery_address");
  const pincodeValue = watch("delivery_address.pincode");

  // Clear stale refine error when veg + nonveg matches headcount
  useEffect(() => {
    const hc = Number(headcount) || 0;
    const vc = Number(vegCount) || 0;
    const nvc = Number(nonvegCount) || 0;
    if (hc > 0 && vc + nvc === hc) {
      clearErrors("veg_count");
    }
  }, [vegCount, nonvegCount, headcount, clearErrors]);

  // Serviceability check on pincode change or coordinates update
  useEffect(() => {
    if (serviceabilityTimerRef.current) {
      clearTimeout(serviceabilityTimerRef.current);
    }

    const hasValidPincode = pincodeValue.length === 6;
    const hasCoordinates = coordinates !== null;

    if (!hasValidPincode && !hasCoordinates) {
      setServiceabilityInfo(null);
      return;
    }

    const pincodeToCheck = pincodeValue;
    const coordsToCheck = coordinates;
    serviceabilityTimerRef.current = setTimeout(async () => {
      const payload = coordsToCheck
        ? { lat: coordsToCheck.lat, lng: coordsToCheck.lng }
        : { pincode: pincodeToCheck };

      try {
        const result = await checkServiceability(payload);

        // Validate response is still relevant
        if (!coordsToCheck) {
          const currentPincode = form.getValues("delivery_address.pincode");
          if (currentPincode !== pincodeToCheck) return;
        }

        if (result.isServiceable) {
          const outletName = (result.outlet?.name as string) || undefined;
          setServiceabilityInfo({
            isServiceable: true,
            outletName,
            message: coordsToCheck
              ? "We are currently delivering to this location."
              : `We deliver to this area via ${outletName || "our kitchen"}.`,
          });
        } else {
          setServiceabilityInfo({
            isServiceable: false,
            message:
              "We do not serve this location yet. Please try a different pincode or location.",
          });
        }
      } catch {
        if (!coordsToCheck) {
          const currentPincode = form.getValues("delivery_address.pincode");
          if (currentPincode !== pincodeToCheck) return;
        }
        setServiceabilityInfo({
          isServiceable: false,
          message: "Unable to verify serviceability. Please try again.",
        });
      }
    }, 400);

    return () => {
      if (serviceabilityTimerRef.current) {
        clearTimeout(serviceabilityTimerRef.current);
      }
    };
  }, [pincodeValue, coordinates, checkServiceability, form]);

  // Computed values using pricing utilities
  const totalDeliveryDays = useMemo(
    () => computeDeliveryDays(selectedDays, startDate, durationWeeks),
    [selectedDays, startDate, durationWeeks],
  );

  const endDate = useMemo(
    () => computeEndDate(startDate, durationWeeks),
    [startDate, durationWeeks],
  );

  const pricing = useMemo(
    () =>
      computePricing({
        vegCount,
        nonvegCount,
        mealTypesCount: mealTypes.length,
        totalDeliveryDays,
      }),
    [vegCount, nonvegCount, mealTypes.length, totalDeliveryDays],
  );

  // Day/meal toggle handlers
  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setValue("selected_days", [...selectedDays, day], { shouldValidate: true });
    } else {
      setValue(
        "selected_days",
        selectedDays.filter((d) => d !== day),
        { shouldValidate: true },
      );
    }
  };

  const handleMealToggle = (meal: string, checked: boolean) => {
    if (checked) {
      setValue("meal_types", [...mealTypes, meal], { shouldValidate: true });
    } else {
      setValue(
        "meal_types",
        mealTypes.filter((m) => m !== meal),
        { shouldValidate: true },
      );
    }
  };

  // Step validation
  const validateStep = async (step: Step): Promise<boolean> => {
    switch (step) {
      case 1: {
        const addressValid = await trigger([
          "delivery_address.address_line",
          "delivery_address.area",
          "delivery_address.pincode",
          "delivery_address.city",
          "delivery_address.state",
        ]);
        if (!addressValid) return false;

        if (!serviceabilityInfo?.isServiceable) {
          toast.error("Location not serviceable", {
            description:
              "Please select a location on the map or enter a serviceable pincode.",
          });
          return false;
        }

        const scheduleValid = await trigger([
          "selected_days",
          "meal_types",
          "start_date",
          "duration_weeks",
        ]);
        return scheduleValid;
      }
      case 2: {
        const result = await trigger(["headcount", "veg_count", "nonveg_count"]);
        return result;
      }
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 2) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const onSubmit = (data: CreateCorporateOrderFormData) => {
    const payload = {
      ...data,
      delivery_address: {
        ...data.delivery_address,
        ...(coordinates
          ? { latitude: coordinates.lat, longitude: coordinates.lng }
          : {}),
      },
    };
    createOrderMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success("Order created successfully!", {
          description: `Order ${response.order_id} has been created.`,
        });
        router.push(`/corporate/orders/${response._id}`);
      },
      onError: (error: Error) => {
        toast.error("Failed to create order", {
          description: error.message || "Please try again.",
        });
      },
    });
  };

  const isSubmitting = createOrderMutation.isPending;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CorporatePageHeader
        icon={MapPin}
        title="Create New Order"
        subtitle="Set up a corporate bulk order with delivery schedule and meal preferences."
      />

      <Stepper items={STEPS} currentStep={currentStep - 1} className="mb-10" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Form sections */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <DeliverySection
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  coordinates={coordinates}
                  mapCenter={mapCenter}
                  isGettingLocation={isGettingLocation}
                  onMapClick={handleMapClick}
                  onGetCurrentLocation={handleGetCurrentLocation}
                  serviceabilityInfo={serviceabilityInfo}
                  isCheckingServiceability={isCheckingServiceability}
                />
                <ScheduleSection
                  selectedDays={selectedDays}
                  mealTypes={mealTypes}
                  startDate={startDate}
                  durationWeeks={durationWeeks}
                  totalDeliveryDays={totalDeliveryDays}
                  endDate={endDate}
                  errors={errors}
                  control={control}
                  onDayToggle={handleDayToggle}
                  onMealToggle={handleMealToggle}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <QuantitySection
                  headcount={headcount}
                  vegCount={vegCount}
                  nonvegCount={nonvegCount}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  trigger={trigger}
                />
                {/* Notes (only shown in step 2) */}
                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
                  <div className="p-6 pt-7 space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions..."
                      rows={3}
                      {...register("notes")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary (sticky) */}
          <OrderSummary
            selectedDays={selectedDays}
            mealTypes={mealTypes}
            startDate={startDate}
            endDate={endDate}
            totalDeliveryDays={totalDeliveryDays}
            durationWeeks={durationWeeks}
            headcount={headcount}
            vegCount={vegCount}
            nonvegCount={nonvegCount}
            addressLine={deliveryAddress.address_line}
            area={deliveryAddress.area}
            outletName={serviceabilityInfo?.outletName}
            pricing={pricing}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2 rounded-xl"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/corporate")}
              className="gap-2 rounded-xl"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
          )}

          {currentStep < 2 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Order
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
