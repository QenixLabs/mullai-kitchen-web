"use client";

import { MapPin, Info, ChevronDown } from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { EditProfileFormValues } from "./edit-org-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BillingAddressEditCardProps {
  register: UseFormRegister<EditProfileFormValues>;
  errors: FieldErrors<EditProfileFormValues>;
  setValue: UseFormSetValue<EditProfileFormValues>;
  watch: UseFormWatch<EditProfileFormValues>;
}

const inputClasses =
  "bg-[#f8f2f3] rounded-[12px] px-4 py-3 border-0 text-base font-medium text-[#1d1b1c] placeholder:text-[#554243]/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-0 outline-none w-full";

const labelClasses = "text-xs font-bold text-[#554243] uppercase tracking-[0.6px]";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
];

export function BillingAddressEditCard({
  register,
  errors,
  setValue,
  watch,
}: BillingAddressEditCardProps) {
  const selectedState = watch("state_country");

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary">
          <MapPin className="w-5 h-5" />
        </div>
        <h2 className="font-['Manrope',sans-serif] font-bold text-xl text-[#3d000c]">
          Billing Address
        </h2>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-6">
        {/* Street Address */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="street_address" className={labelClasses}>
            Street Address
          </Label>
          <Textarea
            id="street_address"
            placeholder="Office number, building, street"
            rows={3}
            className={cn(
              inputClasses,
              "resize-none field-sizing-content min-h-[84px]"
            )}
            {...register("street_address")}
          />
          {errors.street_address && (
            <p className="text-xs text-destructive mt-1">
              {errors.street_address.message}
            </p>
          )}
        </div>

        {/* City + Pincode */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="city" className={labelClasses}>
              City
            </Label>
            <Input
              id="city"
              placeholder="City name"
              className={cn(inputClasses)}
              {...register("city")}
            />
            {errors.city && (
              <p className="text-xs text-destructive mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pincode" className={labelClasses}>
              Pincode
            </Label>
            <Input
              id="pincode"
              placeholder="600001"
              className={cn(inputClasses, "font-mono")}
              {...register("pincode")}
            />
            {errors.pincode && (
              <p className="text-xs text-destructive mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
        </div>

        {/* Area / Landmark */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="area_landmark" className={labelClasses}>
            Area / Landmark
          </Label>
          <Input
            id="area_landmark"
            placeholder="Nearest landmark"
            className={cn(inputClasses)}
            {...register("area_landmark")}
          />
          {errors.area_landmark && (
            <p className="text-xs text-destructive mt-1">
              {errors.area_landmark.message}
            </p>
          )}
        </div>

        {/* State / Country Select */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="state_country" className={labelClasses}>
            State / Country
          </Label>
          <div className="relative">
            <select
              id="state_country"
              value={selectedState || ""}
              onChange={(e) => setValue("state_country", e.target.value)}
              className={cn(
                inputClasses,
                "appearance-none pr-10 cursor-pointer"
              )}
            >
              <option value="">Select a state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#554243] pointer-events-none" />
          </div>
          {errors.state_country && (
            <p className="text-xs text-destructive mt-1">
              {errors.state_country.message}
            </p>
          )}
        </div>

        {/* Info Alert */}
        <div className="bg-[rgba(189,235,236,0.3)] rounded-[12px] p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#204d4e] shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-[#204d4e] leading-relaxed">
            Changes to your GST or PAN details will undergo manual verification
            by our compliance team and may take up to 24 hours to reflect.
          </p>
        </div>
      </div>
    </div>
  );
}
