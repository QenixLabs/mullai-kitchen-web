"use client";

import { MapPin, SearchCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { ServiceabilityResponse } from "@/api/types/customer.types";
import { pincodeSchema, type PincodeFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
        "relative overflow-hidden rounded-[2rem] border border-orange-100/80 bg-[radial-gradient(circle_at_15%_20%,#fff_0,#fff7ed_45%,#ffedd5_100%)] p-6 shadow-[0_22px_60px_-40px_rgba(234,88,12,0.45)] sm:p-8 lg:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-12 top-8 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <Badge variant="outline" className="mb-4 border-orange-300 bg-white/90 text-orange-800">
            <MapPin className="mr-1 h-3 w-3" />
            Serving across Chennai
          </Badge>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Fresh, home-cooked meals
            <span className="block text-orange-600">delivered daily.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base text-gray-700 sm:text-lg">
            Discover healthy, chef-curated meal plans tailored to your taste. Flexible subscriptions, transparent
            pricing, and doorstep delivery.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">Adyar</Badge>
            <Badge variant="secondary" className="bg-white/90 text-gray-700">Besant Nagar</Badge>
            <Badge variant="secondary" className="bg-white/90 text-gray-700">T. Nagar</Badge>
            <Badge variant="secondary" className="bg-white/90 text-gray-700">Velachery</Badge>
            <Badge variant="secondary" className="bg-white/90 text-gray-700">R.A. Puram</Badge>
            <span className="text-sm font-medium text-gray-600">and 30+ areas</span>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Check Serviceability</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheck)} className="space-y-3">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <div className="relative">
                        <MapPin
                          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400"
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
                          className="h-12 rounded-xl border-orange-200 bg-white pl-12 text-base"
                          aria-label="Pincode"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-orange-600 text-sm font-semibold text-white hover:bg-orange-700"
                disabled={isChecking || !isValid}
                aria-label="Check pincode serviceability"
              >
                <SearchCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                {isChecking ? "Checking..." : "Check serviceability"}
              </Button>
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
                  We are not delivering to this pincode at the moment. Try a nearby pincode.
                </AlertDescription>
              </Alert>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
