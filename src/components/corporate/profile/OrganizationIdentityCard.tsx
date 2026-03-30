"use client";

import { Building2 } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EditProfileFormValues } from "./edit-org-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OrganizationIdentityCardProps {
  register: UseFormRegister<EditProfileFormValues>;
  errors: FieldErrors<EditProfileFormValues>;
}

const inputClasses =
  "bg-[#f8f2f3] rounded-[12px] px-4 py-3 border-0 text-base font-medium text-[#1d1b1c] placeholder:text-[#554243]/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-0 outline-none w-full";

const labelClasses = "text-xs font-bold text-[#554243] uppercase tracking-[0.6px]";

export function OrganizationIdentityCard({
  register,
  errors,
}: OrganizationIdentityCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="w-5 h-5" />
        </div>
        <h2 className="font-['Manrope',sans-serif] font-bold text-xl text-[#3d000c]">
          Organization Identity
        </h2>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-6">
        {/* Organization Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="company_name" className={labelClasses}>
            Organization Name
          </Label>
          <Input
            id="company_name"
            placeholder="Enter your organization name"
            className={cn(inputClasses)}
            {...register("company_name")}
          />
          {errors.company_name && (
            <p className="text-xs text-destructive mt-1">
              {errors.company_name.message}
            </p>
          )}
        </div>

        {/* GST Number + PAN Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gst_number" className={labelClasses}>
              GST Number
            </Label>
            <Input
              id="gst_number"
              placeholder="22AAAAA0000A1Z5"
              className={cn(inputClasses, "font-mono")}
              {...register("gst_number")}
            />
            {errors.gst_number && (
              <p className="text-xs text-destructive mt-1">
                {errors.gst_number.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pan_number" className={labelClasses}>
              PAN Details
            </Label>
            <Input
              id="pan_number"
              placeholder="AAAAA0000A"
              className={cn(inputClasses, "font-mono")}
              {...register("pan_number")}
            />
            {errors.pan_number && (
              <p className="text-xs text-destructive mt-1">
                {errors.pan_number.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
