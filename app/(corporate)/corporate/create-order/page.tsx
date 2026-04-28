"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
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
import { useCreateCorporateOrder, useCorporateOrderPricing } from "@/api/hooks/useCorporate";
import { useServiceability } from "@/api/hooks/useCustomer";
import { useOrderDraftStore } from "@/stores/orderDraftStore";
import {
  createCorporateOrderSchema,
  type CreateCorporateOrderFormData,
  type BillingCycleDays,
} from "@/lib/validations/corporate.schema";

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
  const { mutateAsync: checkServiceability } =
    useServiceability();
  const draftStore = useOrderDraftStore();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [serviceabilityInfo, setServiceabilityInfo] = useState<{
    isServiceable: boolean;
    outletId?: string;
    outletName?: string;
    message: string;
  } | null>(null);
  const serviceabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coordinate state for geo-fencing
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDS);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Always start fresh when visiting the create-order page
  useEffect(() => {
    useOrderDraftStore.getState().clearDraft();
    setCurrentStep(1);
  }, []);

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
      end_date: draftStore.draft.endDate || "",
      billing_cycle_days: draftStore.draft.billingCycleDays,
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
  const endDate = watch("end_date");
  const billingCycleDays = watch("billing_cycle_days");
  const headcount = watch("headcount");
  const vegCount = watch("veg_count");
  const nonvegCount = watch("nonveg_count");
  const deliveryAddress = watch("delivery_address");
  const notes = watch("notes");
  const pincodeValue = watch("delivery_address.pincode");

  // Auto-save to draft store
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = form.watch((value) => {
      const store = useOrderDraftStore.getState();
      if (value.delivery_address) {
        store.updateDeliveryAddress({
          addressLine: value.delivery_address.address_line || "",
          area: value.delivery_address.area || "",
          city: value.delivery_address.city || "",
          state: value.delivery_address.state || "",
          pincode: value.delivery_address.pincode || "",
          landmark: value.delivery_address.landmark || "",
        });
      }
      store.updateSchedule({
        selectedDays: (value.selected_days || []).filter((d): d is string => !!d),
        mealTypes: (value.meal_types || []).filter((m): m is string => !!m),
        startDate: value.start_date || "",
        endDate: value.end_date || "",
        billingCycleDays: value.billing_cycle_days || undefined,
      });
      store.updatePreferences({
        headcount: value.headcount || 0,
        vegCount: value.veg_count || 0,
        nonvegCount: value.nonveg_count || 0,
        notes: value.notes || "",
      });
      store.setStep(currentStep);
    });
    return () => subscription.unsubscribe();
  }, [form, currentStep]);

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
          const outletId = result.outlet?._id as string | undefined;
          setServiceabilityInfo({
            isServiceable: true,
            outletId,
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

  // Build pricing params for backend call — uses cycle end date for per-cycle pricing
  const pricingParams = useMemo(() => {
    if (
      !serviceabilityInfo?.isServiceable ||
      !serviceabilityInfo.outletId ||
      !startDate ||
      !billingCycleDays ||
      selectedDays.length === 0 ||
      mealTypes.length === 0 ||
      (vegCount || 0) + (nonvegCount || 0) === 0
    ) {
      return null;
    }

    // Compute cycle end date: start_date + billing_cycle_days
    const cycleEndDate = format(addDays(new Date(startDate), billingCycleDays), "yyyy-MM-dd");

    return {
      outlet_id: serviceabilityInfo.outletId,
      veg_count: vegCount || 0,
      nonveg_count: nonvegCount || 0,
      meal_types: mealTypes,
      selected_days: selectedDays,
      start_date: startDate,
      end_date: cycleEndDate,
    };
  }, [serviceabilityInfo, startDate, billingCycleDays, selectedDays, mealTypes, vegCount, nonvegCount]);

  const { data: pricingResponse, isLoading: isPricingLoading, error: pricingError } = useCorporateOrderPricing(pricingParams);

  // Provide zeroed defaults when pricing hasn't loaded yet
  const pricing = useMemo(() => pricingResponse ?? {
    veg_price_per_meal: 0,
    nonveg_price_per_meal: 0,
    delivery_charge_per_day: 0,
    tax_rate: 0,
    total_delivery_days: 0,
    veg_meals: 0,
    nonveg_meals: 0,
    veg_amount: 0,
    nonveg_amount: 0,
    delivery_total: 0,
    subtotal: 0,
    tax: 0,
    grand_total: 0,
  }, [pricingResponse]);

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

  const handleBillingCycleChange = (days: BillingCycleDays) => {
    setValue("billing_cycle_days", days, { shouldValidate: true });
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
          "billing_cycle_days",
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
    // Compute cycle end date as fallback if no explicit end date
    const cycleEndDate = data.start_date && data.billing_cycle_days
      ? format(addDays(new Date(data.start_date), data.billing_cycle_days), "yyyy-MM-dd")
      : undefined;

    const payload = {
      ...data,
      end_date: data.end_date || cycleEndDate || "",
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
        <div className="mx-auto max-w-350 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
      <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Stepper items={STEPS} currentStep={currentStep - 1} className="mb-6 sm:mb-10" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8">
            {/* Left: Form Content */}
            <div className="order-1 space-y-6">
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
                  endDate={endDate}
                  billingCycleDays={billingCycleDays}
                  errors={errors}
                  control={control}
                  onDayToggle={handleDayToggle}
                  onMealToggle={handleMealToggle}
                  onBillingCycleChange={handleBillingCycleChange}
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
            <div className="order-2 xl:order-2 xl:min-w-80">
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
                  endDate,
                  billingCycleDays,
                } : null}
                headcount={headcount > 0 ? {
                  total: headcount,
                  veg: vegCount || 0,
                  nonVeg: nonvegCount || 0,
                } : null}
                pricing={pricing}
                isLoading={isPricingLoading}
                error={pricingError}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:mt-10 md:flex-row md:items-center md:justify-between">
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
              className="order-2 gap-2 rounded-full px-6 md:order-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <div className="order-1 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:order-2 md:justify-end md:flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="gap-2 rounded-full px-6 md:flex-none"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 md:flex-none"
                >
                  Next: {STEPS[currentStep].title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 md:flex-none"
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
