"use client";

import { MapPin, SearchCheck } from "lucide-react";
import { useState } from "react";
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
    <section className={cn("relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50/60 p-6 sm:p-10", className)}>
      <div className="absolute inset-0 bg-[url('/images/plan_bg.png')] bg-cover bg-center opacity-20" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <Badge variant="outline" className="mb-4 border-orange-300 bg-white/90 text-orange-800">
          <MapPin className="mr-1 h-3 w-3" />
          Serving across Chennai
        </Badge>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Fresh, Home-Cooked Meals
          <span className="block text-orange-600">Delivered Daily</span>
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-700 sm:text-xl">
          Discover healthy, chef-curated meal plans tailored to your taste. Flexible subscriptions, transparent pricing, and delivery right to your doorstep.
        </p>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheck)} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <div className="relative">
                          <MapPin
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
                            className="h-14 rounded-xl border-gray-300 bg-white pl-12 text-lg"
                            aria-label="Pincode"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="h-14 rounded-xl bg-orange-600 px-8 text-lg font-semibold text-white hover:bg-orange-700"
                disabled={isChecking || !isValid}
                aria-label="Check pincode serviceability"
              >
                <SearchCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                {isChecking ? "Checking..." : "Check Serviceability"}
              </Button>
            </form>
          </Form>

          {errorMessage ? (
            <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Could not verify this pincode</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {result ? (
            result.isServiceable ? (
              <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800">
                <AlertTitle>Service available in your area</AlertTitle>
                <AlertDescription>
                  {getOutletName(result)
                    ? `Orders from this pincode will be handled by ${getOutletName(result)}.`
                    : "Your pincode is serviceable."}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mt-4 border-amber-200 bg-amber-50 text-amber-800">
                <AlertTitle>Service not available yet</AlertTitle>
                <AlertDescription>
                  We are not delivering to this pincode at the moment. Try a nearby pincode.
                </AlertDescription>
              </Alert>
            )
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            Adyar
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            Besant Nagar
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            T. Nagar
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            Velachery
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            R.A. Puram
          </Badge>
          <span className="text-sm text-gray-600">and 30+ areas</span>
        </div>
      </div>
    </section>
  );
}
