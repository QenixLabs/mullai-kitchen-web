"use client";

import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ICorporateProfile } from "@/api/types/corporate.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface OrganizationDetailsProps {
  profile: ICorporateProfile;
}

export function OrganizationDetails({ profile }: OrganizationDetailsProps) {
  const delegate = profile.delegate;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0px_20px_40px_0px_rgba(68,21,28,0.04)]">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Organization Info */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Company Name */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold text-[#7a4b4e] uppercase tracking-[1.2px]">
              Organization Name
            </p>
            <h3 className="text-[32px] font-bold leading-8 text-[#1d1b1c]">
              {profile.company_name}
            </h3>
          </div>

          {/* GST + PAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.gst_number && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-[#554243]">
                  GST Number
                </p>
                <p className="text-base font-semibold text-[#3d000c]">
                  {profile.gst_number}
                </p>
              </div>
            )}

            {profile.pan_number && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-[#554243]">
                  PAN Details
                </p>
                <p className="text-base font-semibold text-[#3d000c]">
                  {profile.pan_number}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Delegate Card */}
        {delegate && delegate.name && (
          <div className="bg-secondary/20 border border-border/10 rounded-xl p-6 w-full lg:w-64 shrink-0 flex flex-col gap-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary/10 overflow-hidden shrink-0">
                <span className="text-lg font-bold text-primary">
                  {getInitials(delegate.name)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <h4 className="text-base font-bold text-[#1d1b1c] truncate">
                  {delegate.name}
                </h4>
                <p className="text-[11px] font-medium text-[#554243] leading-[16.8px]">
                  {delegate.designation || "Corporate Delegate"}
                </p>
              </div>
            </div>

            {/* Contact Button */}
            {(delegate.phone || delegate.email) && (
              <Button
                className="w-full h-auto py-2.5 rounded-lg bg-primary !text-[--mid-secondary,#fbfbfb] text-xs font-bold hover:bg-primary/90 transition-all"
                onClick={() => {
                  if (delegate.phone) {
                    window.open(`tel:${delegate.phone}`, "_self");
                  } else if (delegate.email) {
                    window.open(`mailto:${delegate.email}`, "_self");
                  }
                }}
              >
                Contact Delegate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
