"use client";

import { MapPin, SearchCheck, Users } from "lucide-react";
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
        "relative overflow-hidden rounded-[2rem] border border-orange-100/50 p-6 shadow-lg sm:p-8 lg:p-10",
        className,
      )}
      style={{ backgroundColor: "#F8F3E9" }}
    >
      <div className="pointer-events-none absolute -left-12 top-8 h-44 w-44 rounded-full bg-orange-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-8">
        {/* Left Column - Text Content */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl" style={{ color: "#333333" }}>
            Authentic Chennai Meals,
            <span className="block" style={{ color: "#FF6B35" }}>
              Delivered Daily.
            </span>
          </h1>

          <p className="max-w-xl text-sm sm:text-base lg:text-lg" style={{ color: "#6B7280" }}>
            Healthy, homestyle South Indian delicacies prepared with love and zero preservatives. Your daily
            nutrition, simplified.
          </p>

          {/* Pincode Check Form */}
          <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCheck)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                          <div className="relative flex-1">
                            <MapPin
                              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 sm:left-4"
                              style={{ color: "#FF6B35" }}
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
                              placeholder="Enter your pincode"
                              className="h-12 w-full rounded-xl border-orange-200 bg-white pl-11 text-base sm:pl-12"
                              style={{ borderColor: "#FF6B3533" }}
                              aria-label="Pincode"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="h-12 min-w-0 rounded-xl px-4 text-sm font-semibold text-white hover:opacity-90 sm:px-6 sm:flex-shrink-0"
                            style={{ backgroundColor: "#FF6B35" }}
                            disabled={isChecking || !isValid}
                            aria-label="Check pincode serviceability"
                          >
                            <SearchCheck className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                            <span className="hidden sm:inline">{isChecking ? "Checking..." : "Check Serviceability"}</span>
                            <span className="sm:hidden">{isChecking ? "Checking..." : "Check"}</span>
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
                <AlertTitle>Could not verify this pincode</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {result ? (
              result.isServiceable ? (
                <Alert className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-800">
                  <AlertTitle>Service available in your area</AlertTitle>
                  <AlertDescription>
                    {outletName
                      ? `Orders from this pincode will be handled by ${outletName}.`
                      : "Your pincode is serviceable."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mt-3 border-amber-200 bg-amber-50 text-amber-800">
                  <AlertTitle>Service not available yet</AlertTitle>
                  <AlertDescription>
                    We are not delivering to this pincode at this moment. Try a nearby pincode.
                  </AlertDescription>
                </Alert>
              )
            ) : null}

            {/* Social Proof */}
            {!result && !errorMessage && (
              <div className="mt-4 flex items-center gap-2" style={{ color: "#6B7280" }}>
                <Users className="h-5 w-5" style={{ color: "#FF6B35" }} />
                <span className="text-sm font-medium">500+ happy households in Chennai</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Meal Image */}
        <div className="relative">
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
              alt="South Indian meal platter with traditional dishes"
              className="h-full w-full object-cover"
            />
            {/* Today's Special Badge */}
            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF6B35" }}>
                Today's Special
              </span>
            </div>
            {/* Price Badge */}
            <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="text-lg font-bold" style={{ color: "#333333" }}>
                ₹149
                <span className="text-sm font-normal" style={{ color: "#6B7280" }}>
                  /meal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
