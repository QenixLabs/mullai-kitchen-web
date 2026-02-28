"use client";

import { MapPin, SearchCheck } from "lucide-react";
import { useState } from "react";
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

interface PincodeCheckerProps {
  onCheck: (pincode: string) => Promise<ServiceabilityResponse>;
  onCheckResult?: (result: ServiceabilityResponse, pincode: string) => void;
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

export function PincodeChecker({
  onCheck,
  onCheckResult,
  initialPincode = "",
  className,
}: PincodeCheckerProps) {
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
      const nextResult = await onCheck(values.pincode);
      setResult(nextResult);
      onCheckResult?.(nextResult, values.pincode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to check serviceability right now.";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className={cn("space-y-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Delivery availability</h2>
        <p className="text-sm text-gray-600">Enter your pincode to check if your area is serviceable.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheck)} className="flex flex-col gap-2 sm:flex-row">
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem className="relative flex-1">
                <FormControl>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                      placeholder="Enter 6-digit pincode"
                      className="h-11 rounded-lg border-gray-300 bg-white pl-9"
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
            className="h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90"
            disabled={isChecking || !isValid}
            aria-label="Check pincode serviceability"
          >
            <SearchCheck className="h-4 w-4" aria-hidden="true" />
            {isChecking ? "Checking..." : "Check"}
          </Button>
        </form>
      </Form>

      {errorMessage ? (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
          <AlertTitle>Could not verify this pincode</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        result.isServiceable ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <AlertTitle>Service available in your area</AlertTitle>
            <AlertDescription>
              {getOutletName(result)
                ? `Orders from this pincode will be handled by ${getOutletName(result)}.`
                : "Your pincode is serviceable."}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTitle>Service not available yet</AlertTitle>
            <AlertDescription>
              We are not delivering to this pincode at the moment. Try a nearby pincode.
            </AlertDescription>
          </Alert>
        )
      ) : null}
    </section>
  );
}
