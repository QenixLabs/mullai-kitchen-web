"use client";

import { MapPin, SearchCheck, Users, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { ServiceabilityResponse } from "@/api/types/customer.types";
import { pincodeSchema, type PincodeFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onPincodeCheck: (pincode: string) => Promise<ServiceabilityResponse>;
  onPincodeResult: (result: ServiceabilityResponse, pincode: string) => void;
  initialPincode?: string;
  className?: string;
}

// Module-level helper - no recreation on render
const getOutletName = (result: ServiceabilityResponse): string | null => {
  if (!result.outlet) {
    return null;
  }

  const outletName = result.outlet.name;
  if (typeof outletName === "string" && outletName.trim().length > 0) {
    return outletName;
  }

  return result.outlet._id;
};

export function HeroSection({
  onPincodeCheck,
  onPincodeResult,
  initialPincode = "",
  className,
}: HeroSectionProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ServiceabilityResponse | null>(null);

  // Memoize outlet name to prevent redundant getOutletName calls
  const outletName = useMemo(() => (result ? getOutletName(result) : null), [result]);

  const form = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: initialPincode,
    },
    mode: "onChange",
  });

  const { isValid } = form.formState;

  const handleCheck = async (values: PincodeFormData) => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const nextResult = await onPincodeCheck(values.pincode);
      setResult(nextResult);
      onPincodeResult(nextResult, values.pincode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to check serviceability right now.";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-sm border border-orange-100/50 bg-background p-5 shadow-lg sm:rounded-sm sm:p-6 lg:p-8",
        className,
      )}
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -left-12 top-8 h-32 w-32 rounded-full bg-orange-200/20 blur-3xl sm:h-44 sm:w-44" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl sm:h-52 sm:w-52" />

      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-8">
        {/* Left Column - Text Content */}
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <h1 className="text-xl font-black leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl xl:text-4xl">
              Authentic Chennai Meals,
              <span className="block text-primary">
                Delivered Daily.
              </span>
            </h1>

            <p className="max-w-xl text-sm text-muted-foreground sm:text-base lg:text-lg">
              Healthy, homestyle South Indian delicacies prepared with love. Your daily nutrition, simplified.
            </p>
          </div>

          {/* Pincode Check Form */}
          <div className="rounded-sm border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur sm:rounded-sm sm:p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCheck)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="relative flex-1">
                            <MapPin
                              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary sm:left-4 sm:h-5 sm:w-5"
                              aria-hidden="true"
                            />
                            <Input
                              {...field}
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              onChange={(event) => {
                                const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
                                field.onChange(digitsOnly);
                                setErrorMessage(null);
                                setResult(null);
                              }}
                              placeholder="Enter pincode to check delivery"
                              className={cn(
                                "h-11 w-full rounded-sm border-gray-200 bg-white pl-10 text-sm sm:h-12 sm:pl-12 sm:text-base",
                                "focus:border-primary focus:ring-primary/20"
                              )}
                              aria-label="Pincode"
                            />
                          </div>
                          <Button
                            type="submit"
                            className={cn(
                              "h-11 min-w-0 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-300 sm:h-12 sm:px-6 sm:text-base",
                              "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
                              "active:scale-[0.98]",
                              "disabled:opacity-70"
                            )}
                            disabled={isChecking || !isValid}
                            aria-label="Check pincode serviceability"
                          >
                            {isChecking ? (
                              "Checking..."
                            ) : (
                              <>
                                <span className="hidden sm:inline">Check Availability</span>
                                <span className="sm:hidden">Check</span>
                                <SearchCheck className="ml-2 h-4 w-4" aria-hidden="true" />
                              </>
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {errorMessage ? (
              <Alert variant="destructive" className="mt-3 border-red-200 bg-red-50 text-red-800">
                <AlertTitle className="text-sm">Could not verify this pincode</AlertTitle>
                <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {result ? (
              result.isServiceable ? (
                <Alert className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-800">
                  <AlertTitle className="text-sm">Service available in your area</AlertTitle>
                  <AlertDescription className="text-xs">
                    {outletName
                      ? `Orders from this pincode will be handled by ${outletName}.`
                      : "Your pincode is serviceable."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mt-3 border-amber-200 bg-amber-50 text-amber-800">
                  <AlertTitle className="text-sm">Service not available yet</AlertTitle>
                  <AlertDescription className="text-xs">
                    We are not delivering to this pincode at this moment.
                  </AlertDescription>
                </Alert>
              )
            ) : null}

            {/* Social Proof */}
            {!result && !errorMessage && (
              <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-orange-200 ring-2 ring-white" />
                  <div className="h-6 w-6 rounded-full bg-orange-300 ring-2 ring-white" />
                  <div className="h-6 w-6 rounded-full bg-orange-400 ring-2 ring-white" />
                </div>
                <span className="text-xs font-medium sm:text-sm">
                  <span className="font-bold text-foreground">500+</span> happy households in Chennai
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Meal Image */}
        <div className="relative hidden lg:block">
          <div className="relative h-80 w-full overflow-hidden rounded-sm shadow-xl xl:h-96">
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
              alt="South Indian meal platter with traditional dishes"
              className="h-full w-full object-cover"
            />
            {/* Today's Special Badge */}
            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm sm:px-4 sm:py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary sm:text-xs">
                Today's Special
              </span>
            </div>
            {/* Price Badge */}
            <div className="absolute bottom-4 right-4 rounded-sm bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-3">
              <div className="text-base font-bold text-foreground sm:text-lg">
                ₹149
                <span className="text-xs font-normal text-muted-foreground sm:text-sm">
                  /meal
                </span>
              </div>
            </div>
            {/* Quick info overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-black/50 px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-1 text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Fresh Daily
              </div>
              <div className="h-3 w-px bg-white/30" />
              <div className="text-xs text-white">Zero Preservatives</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
