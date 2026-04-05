"use client";

import { User, Camera } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EditProfileFormValues } from "./edit-org-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ContactDelegateCardProps {
  register: UseFormRegister<EditProfileFormValues>;
  errors: FieldErrors<EditProfileFormValues>;
}

const inputClasses =
  "bg-[#f8f2f3] rounded-[12px] px-4 py-3 border-0 text-base font-medium text-[#1d1b1c] placeholder:text-[#554243]/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-0 outline-none w-full";

const labelClasses = "text-xs font-bold text-[#554243] uppercase tracking-[0.6px]";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ContactDelegateCard({
  register,
  errors,
}: ContactDelegateCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary">
          <User className="w-5 h-5" />
        </div>
        <h2 className="font-['Manrope',sans-serif] font-bold text-xl text-[#3d000c]">
          Contact Delegate
        </h2>
      </div>

      {/* Delegate Content */}
      <div className="flex flex-col gap-6">
        {/* Top Row: Avatar + Name/Designation */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-[103px] h-[103px] rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {getInitials("Delegate Name")}
              </span>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#1d1b1c] flex items-center justify-center text-white hover:bg-[#3d000c] transition-colors"
              aria-label="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name + Designation */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delegate_name" className={labelClasses}>
                Delegate Name
              </Label>
              <Input
                id="delegate_name"
                placeholder="Enter delegate's full name"
                className={cn(inputClasses)}
                {...register("delegate_name")}
              />
              {errors.delegate_name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.delegate_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="delegate_designation" className={labelClasses}>
                Designation / Role
              </Label>
              <Input
                id="delegate_designation"
                placeholder="e.g., HR Manager"
                className={cn(inputClasses)}
                {...register("delegate_designation")}
              />
              {errors.delegate_designation && (
                <p className="text-xs text-destructive mt-1">
                  {errors.delegate_designation.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Email + Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Card */}
          <div className="bg-[#f2eced] rounded-[12px] p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.6px]">
              Email Address
            </span>
            <Input
              id="delegate_email"
              placeholder="delegate@company.com"
              type="email"
              className="bg-transparent border-0 px-0 py-1 text-xs font-medium text-[#3d000c] placeholder:text-[#3d000c]/40 focus-visible:ring-0 focus-visible:border-0 outline-none shadow-none h-auto w-full"
              {...register("delegate_email")}
            />
            {errors.delegate_email && (
              <p className="text-xs text-destructive mt-0.5">
                {errors.delegate_email.message}
              </p>
            )}
          </div>

          {/* Contact No Card */}
          <div className="bg-[#f2eced] rounded-[12px] p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.6px]">
              Contact No.
            </span>
            <Input
              id="delegate_phone"
              placeholder="+91 98765 43210"
              type="tel"
              className="bg-transparent border-0 px-0 py-1 text-xs font-medium text-[#3d000c] placeholder:text-[#3d000c]/40 focus-visible:ring-0 focus-visible:border-0 outline-none shadow-none h-auto w-full"
              {...register("delegate_phone")}
            />
            {errors.delegate_phone && (
              <p className="text-xs text-destructive mt-0.5">
                {errors.delegate_phone.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
