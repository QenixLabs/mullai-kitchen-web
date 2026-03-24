"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  MapPin,
  CalendarDays,
  Users,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  IndianRupee,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateCorporateOrder } from "@/api/hooks/useCorporate";
import { createCorporateOrderSchema, type CreateCorporateOrderFormData } from "@/lib/validations/corporate.schema";
import { addWeeks, addDays, format, isAfter, startOfDay } from "date-fns";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
] as const;

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
] as const;

// Default pricing placeholders (server will return actual values in response)
const DEFAULT_VEG_PRICE = 120;
const DEFAULT_NONVEG_PRICE = 150;
const DEFAULT_DELIVERY_CHARGE = 50;
const DEFAULT_TAX_RATE = 0.05; // 5%

type Step = 1 | 2 | 3 | 4;

const STEP_CONFIG = [
  { number: 1 as Step, label: "Delivery Details", icon: MapPin },
  { number: 2 as Step, label: "Schedule", icon: CalendarDays },
  { number: 3 as Step, label: "Quantity", icon: Users },
  { number: 4 as Step, label: "Review & Submit", icon: ClipboardCheck },
];

function computeDeliveryDays(
  selectedDays: string[],
  startDate: string,
  durationWeeks: number
): number {
  if (!startDate || selectedDays.length === 0 || durationWeeks < 1) return 0;

  const start = new Date(startDate);
  const end = addWeeks(start, durationWeeks);
  let count = 0;

  const current = new Date(start);
  while (current < end) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    if (selectedDays.includes(dayName)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function computeEndDate(startDate: string, durationWeeks: number): string | null {
  if (!startDate || durationWeeks < 1) return null;
  const end = addDays(addWeeks(new Date(startDate), durationWeeks), -1);
  return format(end, "yyyy-MM-dd");
}

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrderMutation = useCreateCorporateOrder();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const form = useForm<CreateCorporateOrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createCorporateOrderSchema) as any,
    defaultValues: {
      outlet_id: "",
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

  // Computed values
  const totalDeliveryDays = useMemo(
    () => computeDeliveryDays(selectedDays, startDate, durationWeeks),
    [selectedDays, startDate, durationWeeks]
  );

  const endDate = useMemo(
    () => computeEndDate(startDate, durationWeeks),
    [startDate, durationWeeks]
  );

  // Pricing computation
  const pricing = useMemo(() => {
    const vegMeals = vegCount * mealTypes.length * totalDeliveryDays;
    const nonvegMeals = nonvegCount * mealTypes.length * totalDeliveryDays;
    const vegAmount = vegMeals * DEFAULT_VEG_PRICE;
    const nonvegAmount = nonvegMeals * DEFAULT_NONVEG_PRICE;
    const deliveryTotal = totalDeliveryDays * DEFAULT_DELIVERY_CHARGE;
    const subtotal = vegAmount + nonvegAmount + deliveryTotal;
    const tax = subtotal * DEFAULT_TAX_RATE;
    const grandTotal = subtotal + tax;

    return {
      vegMeals,
      nonvegMeals,
      vegAmount,
      nonvegAmount,
      deliveryTotal,
      subtotal,
      tax,
      grandTotal,
    };
  }, [vegCount, nonvegCount, mealTypes.length, totalDeliveryDays]);

  const validateStep = async (step: Step): Promise<boolean> => {
    switch (step) {
      case 1: {
        const result = await trigger([
          "delivery_address.address_line",
          "delivery_address.area",
          "delivery_address.pincode",
          "delivery_address.city",
          "delivery_address.state",
          "outlet_id",
        ]);
        return result;
      }
      case 2: {
        const result = await trigger([
          "selected_days",
          "meal_types",
          "start_date",
          "duration_weeks",
        ]);
        return result;
      }
      case 3: {
        const result = await trigger(["headcount", "veg_count", "nonveg_count"]);
        return result;
      }
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const onSubmit = (data: CreateCorporateOrderFormData) => {
    createOrderMutation.mutate(data, {
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

  const handleDayToggle = (day: string, checked: boolean) => {
    const current = selectedDays;
    if (checked) {
      setValue("selected_days", [...current, day], { shouldValidate: true });
    } else {
      setValue(
        "selected_days",
        current.filter((d) => d !== day),
        { shouldValidate: true }
      );
    }
  };

  const handleMealToggle = (meal: string, checked: boolean) => {
    const current = mealTypes;
    if (checked) {
      setValue("meal_types", [...current, meal], { shouldValidate: true });
    } else {
      setValue(
        "meal_types",
        current.filter((m) => m !== meal),
        { shouldValidate: true }
      );
    }
  };

  const isSubmitting = createOrderMutation.isPending;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => router.push("/corporate")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Create New Order
        </h1>
        <p className="text-muted-foreground">
          Set up a corporate bulk order with delivery schedule and meal preferences.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 px-4">
        {STEP_CONFIG.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEP_CONFIG.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 mt-[-1.5rem] transition-colors ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Delivery Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Details
              </CardTitle>
              <CardDescription>
                Enter the delivery address for your corporate order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Outlet ID */}
              <div className="space-y-2">
                <Label htmlFor="outlet_id">Outlet</Label>
                <Controller
                  control={control}
                  name="outlet_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an outlet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outlet-1">Main Kitchen</SelectItem>
                        <SelectItem value="outlet-2">City Center</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.outlet_id && (
                  <p className="text-sm text-destructive">{errors.outlet_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    {...register("delivery_address.pincode")}
                  />
                  {errors.delivery_address?.pincode && (
                    <p className="text-sm text-destructive">
                      {errors.delivery_address.pincode.message}
                    </p>
                  )}
                </div>

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
            </CardContent>
          </Card>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>
                Choose delivery days, meal types, and the order duration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Day Selector */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Delivery Days</Label>
                <p className="text-sm text-muted-foreground">
                  Select the days of the week for meal delivery.
                </p>
                <div className="flex flex-wrap gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-md border cursor-pointer transition-all ${
                        selectedDays.includes(day.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={(checked) =>
                          handleDayToggle(day.value, !!checked)
                        }
                        className={
                          selectedDays.includes(day.value)
                            ? "data-[state=checked]:bg-primary-foreground data-[state=checked]:border-primary-foreground data-[state=checked]:text-primary"
                            : ""
                        }
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.selected_days && (
                  <p className="text-sm text-destructive">{errors.selected_days.message}</p>
                )}
              </div>

              <Separator />

              {/* Meal Type Selector */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Meal Types</Label>
                <p className="text-sm text-muted-foreground">
                  Select which meals to include each delivery day.
                </p>
                <div className="flex flex-wrap gap-3">
                  {MEAL_TYPES.map((meal) => (
                    <label
                      key={meal.value}
                      className={`flex items-center gap-2 px-4 py-3 rounded-md border cursor-pointer transition-all ${
                        mealTypes.includes(meal.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:bg-accent"
                      }`}
                    >
                      <Checkbox
                        checked={mealTypes.includes(meal.value)}
                        onCheckedChange={(checked) =>
                          handleMealToggle(meal.value, !!checked)
                        }
                        className={
                          mealTypes.includes(meal.value)
                            ? "data-[state=checked]:bg-primary-foreground data-[state=checked]:border-primary-foreground data-[state=checked]:text-primary"
                            : ""
                        }
                      />
                      <span className="text-sm font-medium">{meal.label}</span>
                    </label>
                  ))}
                </div>
                {errors.meal_types && (
                  <p className="text-sm text-destructive">{errors.meal_types.message}</p>
                )}
              </div>

              <Separator />

              {/* Start Date and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Controller
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                        placeholder="Select start date"
                        minDate={addDays(startOfDay(new Date()), 1)}
                      />
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_weeks">Duration (Weeks)</Label>
                  <Controller
                    control={control}
                    name="duration_weeks"
                    render={({ field }) => (
                      <Select
                        value={String(field.value)}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 4, 6, 8, 12, 16, 24, 36, 52].map((weeks) => (
                            <SelectItem key={weeks} value={String(weeks)}>
                              {weeks} {weeks === 1 ? "week" : "weeks"}
                              {weeks >= 4 && (
                                <span className="text-muted-foreground ml-1">
                                  (~{Math.round((weeks * 7) / 30)} months)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.duration_weeks && (
                    <p className="text-sm text-destructive">
                      {errors.duration_weeks.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Computed Schedule Info */}
              {(totalDeliveryDays > 0 || endDate) && (
                <div className="bg-muted/50 rounded-md p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {endDate ? format(new Date(endDate), "MMM dd, yyyy") : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Delivery Days</span>
                    <span className="font-medium">{totalDeliveryDays} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Meals per Delivery Day</span>
                    <span className="font-medium">{mealTypes.length} meal(s)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Quantity */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Quantity
              </CardTitle>
              <CardDescription>
                Specify the number of people and the veg/non-veg meal split.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="headcount">Total Headcount</Label>
                <Input
                  id="headcount"
                  type="number"
                  min={1}
                  placeholder="e.g., 10"
                  {...register("headcount")}
                />
                {errors.headcount && (
                  <p className="text-sm text-destructive">{errors.headcount.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="veg_count">Vegetarian Meals</Label>
                  <Input
                    id="veg_count"
                    type="number"
                    min={0}
                    max={headcount || undefined}
                    placeholder="e.g., 6"
                    {...register("veg_count")}
                  />
                  {errors.veg_count && (
                    <p className="text-sm text-destructive">{errors.veg_count.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nonveg_count">Non-Vegetarian Meals</Label>
                  <Input
                    id="nonveg_count"
                    type="number"
                    min={0}
                    max={headcount || undefined}
                    placeholder="e.g., 4"
                    {...register("nonveg_count")}
                  />
                  {errors.nonveg_count && (
                    <p className="text-sm text-destructive">{errors.nonveg_count.message}</p>
                  )}
                </div>
              </div>

              {/* Headcount validation indicator */}
              {headcount > 0 && (
                <div
                  className={`rounded-md p-4 flex items-center justify-between text-sm ${
                    vegCount + nonvegCount === headcount
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : vegCount + nonvegCount > headcount
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <span>
                    Veg ({vegCount}) + Non-veg ({nonvegCount}) = {vegCount + nonvegCount} /{" "}
                    {headcount}
                  </span>
                  {vegCount + nonvegCount === headcount ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                      Match
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Mismatch</Badge>
                  )}
                </div>
              )}

              {/* Quick split buttons */}
              {headcount > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quick Split</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const veg = headcount;
                        setValue("veg_count", veg);
                        setValue("nonveg_count", 0);
                        trigger(["veg_count", "nonveg_count"]);
                      }}
                    >
                      All Veg ({headcount}V / 0NV)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const veg = 0;
                        setValue("veg_count", veg);
                        setValue("nonveg_count", headcount);
                        trigger(["veg_count", "nonveg_count"]);
                      }}
                    >
                      All Non-veg (0V / {headcount}NV)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const veg = Math.ceil(headcount / 2);
                        setValue("veg_count", veg);
                        setValue("nonveg_count", headcount - veg);
                        trigger(["veg_count", "nonveg_count"]);
                      }}
                    >
                      50-50 ({Math.ceil(headcount / 2)}V / {headcount - Math.ceil(headcount / 2)}NV)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const veg = Math.ceil(headcount * 0.6);
                        setValue("veg_count", veg);
                        setValue("nonveg_count", headcount - veg);
                        trigger(["veg_count", "nonveg_count"]);
                      }}
                    >
                      60-40 ({Math.ceil(headcount * 0.6)}V / {headcount - Math.ceil(headcount * 0.6)}NV)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const veg = Math.ceil(headcount * 0.7);
                        setValue("veg_count", veg);
                        setValue("nonveg_count", headcount - veg);
                        trigger(["veg_count", "nonveg_count"]);
                      }}
                    >
                      70-30 ({Math.ceil(headcount * 0.7)}V / {headcount - Math.ceil(headcount * 0.7)}NV)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Details */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Delivery Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Address: </span>
                      <span className="font-medium">{deliveryAddress.address_line}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Area: </span>
                      <span className="font-medium">{deliveryAddress.area}</span>
                    </div>
                    {deliveryAddress.landmark && (
                      <div>
                        <span className="text-muted-foreground">Landmark: </span>
                        <span className="font-medium">{deliveryAddress.landmark}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">City: </span>
                      <span className="font-medium">{deliveryAddress.city}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State: </span>
                      <span className="font-medium">{deliveryAddress.state}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pincode: </span>
                      <span className="font-medium">{deliveryAddress.pincode}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Schedule */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Schedule
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Days: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {DAYS_OF_WEEK.filter((d) => selectedDays.includes(d.value)).map((d) => (
                          <Badge key={d.value} variant="secondary">{d.label}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meals: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {MEAL_TYPES.filter((m) => mealTypes.includes(m.value)).map((m) => (
                          <Badge key={m.value} variant="secondary">{m.label}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start: </span>
                      <div className="font-medium mt-1">
                        {startDate ? format(new Date(startDate), "MMM dd, yyyy") : "--"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End: </span>
                      <div className="font-medium mt-1">
                        {endDate ? format(new Date(endDate), "MMM dd, yyyy") : "--"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quantity */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Quantity
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-muted/50 rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{headcount}</div>
                      <div className="text-muted-foreground">Total Headcount</div>
                    </div>
                    <div className="bg-green-50 rounded-md p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{vegCount}</div>
                      <div className="text-green-600">Veg Meals</div>
                    </div>
                    <div className="bg-orange-50 rounded-md p-3 text-center">
                      <div className="text-2xl font-bold text-orange-700">{nonvegCount}</div>
                      <div className="text-orange-600">Non-veg Meals</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Pricing Breakdown
                  </h3>
                  <div className="bg-muted/50 rounded-md p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Veg meals ({vegCount} x {mealTypes.length} meals x {totalDeliveryDays} days x Rs.{DEFAULT_VEG_PRICE})
                      </span>
                      <span className="font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {pricing.vegAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Non-veg meals ({nonvegCount} x {mealTypes.length} meals x {totalDeliveryDays} days x Rs.{DEFAULT_NONVEG_PRICE})
                      </span>
                      <span className="font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {pricing.nonvegAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Delivery charges ({totalDeliveryDays} days x Rs.{DEFAULT_DELIVERY_CHARGE})
                      </span>
                      <span className="font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {pricing.deliveryTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {pricing.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax (GST {(DEFAULT_TAX_RATE * 100).toFixed(0)}%)
                      </span>
                      <span className="font-medium">
                        <IndianRupee className="h-3 w-3 inline" />
                        {pricing.tax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Grand Total</span>
                      <span className="text-primary">
                        <IndianRupee className="h-4 w-4 inline" />
                        {pricing.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Final pricing will be confirmed by the kitchen. This is an estimated amount.
                  </p>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or notes for the kitchen..."
                    rows={3}
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2"
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
              className="gap-2"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="gap-2 bg-primary hover:bg-primary/90"
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
