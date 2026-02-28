"use client";

import { Home, MapPin, Trash2, Building2, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { CreateAddressDto } from "@/api/types/customer.types";
import { useServiceability } from "@/api/hooks/useCustomer";
import { addressFormSchema, type AddressFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EMPTY_ADDRESS: AddressFormData = {
  type: "Home",
  full_address: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  landmark: "",
};

const PINCODE_LENGTH = 6;

const normalizeAddressPayload = (payload: AddressFormData): CreateAddressDto => {
  const landmark = payload.landmark?.trim();

  return {
    type: payload.type,
    full_address: payload.full_address.trim(),
    area: payload.area.trim(),
    pincode: payload.pincode.trim(),
    city: payload.city.trim(),
    state: payload.state.trim(),
    landmark,
  };
};

const getAddressPreview = (address: CreateAddressDto): string => {
  const parts = [address.full_address, address.area, address.city, address.state, address.pincode]
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.join(", ");
};

export interface AddressFormStepProps {
  addresses: CreateAddressDto[];
  defaultAddressIndex: number;
  onAddAddress: (address: CreateAddressDto) => void;
  onRemoveAddress: (index: number) => void;
  onSetDefault: (index: number) => void;
  className?: string;
  showInlineContinue?: boolean;
  onContinue?: () => void;
}

export function AddressFormStep({
  addresses,
  defaultAddressIndex,
  onAddAddress,
  onRemoveAddress,
  onSetDefault,
  className,
  showInlineContinue = false,
  onContinue,
}: AddressFormStepProps) {
  const { mutateAsync: checkServiceability } = useServiceability();
  const [pincodeNotice, setPincodeNotice] = useState<{
    status: "not-serviceable" | "error";
    message: string;
  } | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: EMPTY_ADDRESS,
    mode: "onChange",
  });

  const canContinue = addresses.length > 0;
  const { isValid, dirtyFields } = form.formState;
  const isFormDirty = Object.keys(dirtyFields).length > 0;
  const pincodeValue = form.watch("pincode");

  const helperMessage = useMemo(() => {
    if (canContinue) {
      return `${addresses.length} address${addresses.length > 1 ? "es" : ""} added. You can continue or add more.`;
    }

    return "Add at least one address, then continue.";
  }, [addresses.length, canContinue]);

  useEffect(() => {
    if (pincodeValue.length !== PINCODE_LENGTH) {
      setPincodeNotice(null);
      return;
    }

    const pincodeToCheck = pincodeValue;
    const timeoutId = setTimeout(() => {
      void checkServiceability({ pincode: pincodeToCheck })
        .then((result) => {
          if (form.getValues("pincode") !== pincodeToCheck) {
            return;
          }

          if (!result.isServiceable) {
            setPincodeNotice({
              status: "not-serviceable",
              message: "We do not serve this pincode yet. You can still save this address.",
            });
            return;
          }

          setPincodeNotice(null);
        })
        .catch(() => {
          if (form.getValues("pincode") !== pincodeToCheck) {
            return;
          }

          setPincodeNotice({
            status: "error",
            message: "Unable to verify pincode serviceability right now.",
          });
        });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkServiceability, form, pincodeValue]);

  const handleAddAddress = async () => {
    const valid = await form.trigger();
    if (!valid) {
      return;
    }

    onAddAddress(normalizeAddressPayload(form.getValues()));
    form.reset(EMPTY_ADDRESS);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Delivery addresses</h2>
        <p className="text-sm text-gray-600">Address is required. You can add multiple addresses and pick a default.</p>
      </div>

      {!canContinue ? (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTitle>Add your first address</AlertTitle>
          <AlertDescription>You need at least one valid address before moving to the next step.</AlertDescription>
        </Alert>
      ) : null}

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address, index) => {
            const isDefault = index === defaultAddressIndex;

            return (
              <article
                key={`${address.type}-${address.pincode}-${index}`}
                className={cn(
                  "rounded-lg border bg-white p-4 shadow-sm",
                  isDefault ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {address.type === "Home" ? (
                        <Home className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {address.type}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{getAddressPreview(address)}</p>
                    {address.landmark ? <p className="text-xs text-gray-500">Landmark: {address.landmark}</p> : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                      <Checkbox checked={isDefault} onCheckedChange={() => onSetDefault(index)} />
                      Set as default
                    </label>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemoveAddress(index)}
                      disabled={addresses.length <= 1}
                      aria-label={`Remove address ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Add a new address</h3>
          <p className="text-xs text-gray-500">Fill all required fields and click Save address. Pincode must be exactly 6 digits.</p>
        </div>

        <Form {...form}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Address type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Home", "Office"] as const).map((type) => {
                        const isActive = field.value === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            className={cn(
                              "inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition",
                              isActive
                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400",
                            )}
                            onClick={() => field.onChange(type)}
                            aria-pressed={isActive}
                          >
                            {type === "Home" ? <Home className="h-4 w-4" aria-hidden="true" /> : <Building2 className="h-4 w-4" aria-hidden="true" />}
                            {type}
                          </button>
                        );
                      })}
                    </div>
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
                  <FormLabel className="text-gray-700">Full address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="House no, street, apartment details"
                      className="min-h-24 rounded-lg border-gray-300 bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Area</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Area or locality"
                        className="h-11 rounded-lg border-gray-300 bg-white"
                      />
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
                    <FormLabel className="text-gray-700">Pincode</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                        <Input
                          {...field}
                          inputMode="numeric"
                          maxLength={6}
                          onChange={(event) => {
                            const onlyDigits = event.target.value.replace(/\D/g, "").slice(0, 6);
                            field.onChange(onlyDigits);
                          }}
                          className="h-11 rounded-lg border-gray-300 bg-white pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {pincodeNotice ? (
                      <p
                        className={cn(
                          "text-xs",
                          pincodeNotice.status === "not-serviceable"
                            ? "text-amber-700"
                            : "text-gray-500",
                        )}
                      >
                        {pincodeNotice.message}
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="City name"
                        className="h-11 rounded-lg border-gray-300 bg-white"
                      />
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
                    <FormLabel className="text-gray-700">State</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="State name"
                        className="h-11 rounded-lg border-gray-300 bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="landmark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Landmark (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Near temple, school, metro station..."
                      className="h-11 rounded-lg border-gray-300 bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        <Button
          type="button"
          onClick={handleAddAddress}
          className="h-11 w-full bg-orange-600 text-white hover:bg-orange-700 sm:w-auto"
          disabled={!isValid || !isFormDirty}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Save address
        </Button>
      </section>

      <div className="space-y-3">
        <p className={cn("text-sm", canContinue ? "text-emerald-700" : "text-amber-700")}>{helperMessage}</p>

        {showInlineContinue ? (
          <Button
            type="button"
            className="h-11 w-full bg-orange-600 font-semibold text-white hover:bg-orange-700 sm:w-auto"
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continue
          </Button>
        ) : null}
      </div>
    </div>
  );
}
