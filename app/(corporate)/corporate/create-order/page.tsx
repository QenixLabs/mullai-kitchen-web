"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Step1Delivery } from "@/components/corporate/create-order/Step1Delivery";
import { Step2Schedule } from "@/components/corporate/create-order/Step2Schedule";
import { Step3Preferences } from "@/components/corporate/create-order/Step3Preferences";
import { OrderSummarySidebar } from "@/components/corporate/create-order/OrderSummarySidebar";
import { useCreateCorporateOrder } from "@/api/hooks/useCorporate";
import { useServiceability } from "@/api/hooks/useCustomer";
import { useOrderDraftStore } from "@/stores/orderDraftStore";
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

type Step = 1 | 2 | 3;

const STEPS = [
  { id: "delivery", title: "Delivery Details" },
  { id: "schedule", title: "Schedule" },
  { id: "preferences", title: "Meal Preferences" },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrderMutation = useCreateCorporateOrder();
  const { mutateAsync: checkServiceability, isPending: isCheckingServiceability } =
    useServiceability();
  const draftStore = useOrderDraftStore();

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

  // Restore draft on mount
  useEffect(() => {
    if (draftStore.draft.step && draftStore.draft.step >= 1 && draftStore.draft.step <= 3) {
      setCurrentStep(draftStore.draft.step as Step);
    }
  }, [draftStore.draft.step]);

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
        address_line: draftStore.draft.deliveryAddress.addressLine,
        area: draftStore.draft.deliveryAddress.area,
        landmark: draftStore.draft.deliveryAddress.landmark,
        pincode: draftStore.draft.deliveryAddress.pincode,
        city: draftStore.draft.deliveryAddress.city,
        state: draftStore.draft.deliveryAddress.state,
      },
      selected_days: draftStore.draft.selectedDays,
      meal_types: draftStore.draft.mealTypes,
      start_date: draftStore.draft.startDate,
      duration_weeks: draftStore.draft.durationWeeks,
      headcount: draftStore.draft.headcount || 1,
      veg_count: draftStore.draft.vegCount,
      nonveg_count: draftStore.draft.nonvegCount,
      notes: draftStore.draft.notes,
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
  const notes = watch("notes");
  const pincodeValue = watch("delivery_address.pincode");

  // Auto-save to draft store
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.delivery_address) {
        draftStore.updateDeliveryAddress({
          addressLine: value.delivery_address.address_line || "",
          area: value.delivery_address.area || "",
          city: value.delivery_address.city || "",
          state: value.delivery_address.state || "",
          pincode: value.delivery_address.pincode || "",
          landmark: value.delivery_address.landmark || "",
        });
      }
      draftStore.updateSchedule({
        selectedDays: (value.selected_days || []).filter((d): d is string => !!d),
        mealTypes: (value.meal_types || []).filter((m): m is string => !!m),
        startDate: value.start_date || "",
        durationWeeks: value.duration_weeks || 4,
      });
      draftStore.updatePreferences({
        headcount: value.headcount || 0,
        vegCount: value.veg_count || 0,
        nonvegCount: value.nonveg_count || 0,
        notes: value.notes || "",
      });
      draftStore.setStep(currentStep);
    });
    return () => subscription.unsubscribe();
  }, [form, draftStore, currentStep]);

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
        vegCount: vegCount || 0,
        nonvegCount: nonvegCount || 0,
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
        return true;
      }
      case 2: {
        const scheduleValid = await trigger([
          "selected_days",
          "meal_types",
          "start_date",
          "duration_weeks",
        ]);
        return scheduleValid;
      }
      case 3: {
        const result = await trigger(["headcount", "veg_count", "nonveg_count"]);
        return result;
      }
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved", { description: "Your order progress has been saved." });
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
        draftStore.clearDraft();
        // Response structure: { order: {...}, invoice: {...} }
        const order = response.order;
        const orderId = order?._id || order?.order_id;
        toast.success("Order created successfully!", {
          description: `Order ${order?.order_id} has been created.`,
        });
        if (orderId) {
          router.push(`/corporate/orders/${orderId}`);
        } else {
          toast.error("Order created but unable to redirect. Please check your orders list.");
          router.push("/corporate/orders");
        }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#44151C]">CREATE NEW ORDER</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your corporate delivery schedule and preferences.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/corporate/orders")}
              className="gap-2 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Stepper items={STEPS} currentStep={currentStep - 1} className="mb-6 sm:mb-10" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
            {/* Left: Form Content */}
            <div className="space-y-6 order-2 xl:order-1">
              {currentStep === 1 && (
                <Step1Delivery
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  coordinates={coordinates}
                  mapCenter={mapCenter}
                  isGettingLocation={isGettingLocation}
                  onMapClick={handleMapClick}
                  onGetCurrentLocation={handleGetCurrentLocation}
                />
              )}
              {currentStep === 2 && (
                <Step2Schedule
                  selectedDays={selectedDays}
                  mealTypes={mealTypes}
                  startDate={startDate}
                  durationWeeks={durationWeeks}
                  errors={errors}
                  control={control}
                  onDayToggle={handleDayToggle}
                  onMealToggle={handleMealToggle}
                />
              )}
              {currentStep === 3 && (
                <Step3Preferences
                  headcount={headcount}
                  vegCount={vegCount}
                  nonvegCount={nonvegCount}
                  notes={notes || ""}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  trigger={trigger}
                />
              )}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="order-1 xl:order-2">
              <OrderSummarySidebar
                deliveryAddress={deliveryAddress.address_line ? {
                  addressLine: deliveryAddress.address_line,
                  area: deliveryAddress.area,
                  city: deliveryAddress.city,
                  state: deliveryAddress.state,
                  pincode: deliveryAddress.pincode,
                } : null}
                schedule={selectedDays.length > 0 ? {
                  selectedDays,
                  mealTypes,
                  startDate,
                  durationWeeks,
                } : null}
                headcount={headcount > 0 ? {
                  total: headcount,
                  veg: vegCount || 0,
                  nonVeg: nonvegCount || 0,
                } : null}
                pricing={pricing}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 sm:mt-10 pt-6 border-t border-border gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentStep === 1) {
                  router.push("/corporate/orders");
                } else {
                  handleBack();
                }
              }}
              disabled={isSubmitting}
              className="gap-2 rounded-full px-6 order-2 sm:order-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="gap-2 rounded-full px-6"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                >
                  Next: {STEPS[currentStep].title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Order
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
