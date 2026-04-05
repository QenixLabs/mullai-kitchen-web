"use client";

import { MapPin } from "lucide-react";
import type { ICorporateProfile } from "@/api/types/corporate.types";

interface BillingAddressProps {
  profile: ICorporateProfile;
}

function FieldCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value?.trim()) return null;
  return (
    <div className="bg-secondary/20 border border-border/10 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[11px] font-bold text-primary uppercase leading-[16.8px]">
        {label}
      </p>
      <p className="text-sm font-medium text-[#1d1b1c] leading-5">
        {value}
      </p>
    </div>
  );
}

export function BillingAddress({ profile }: BillingAddressProps) {
  const addr = profile.billing_address;
  const hasAnyField = Object.values(addr).some((v) => v?.trim());

  if (!hasAnyField) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-[0px_20px_40px_0px_rgba(68,21,28,0.04)] sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="h-9 w-9 text-primary" />
          <h2 className="text-xl font-bold text-[#3d000c] capitalize">
            Billing Address
          </h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground text-center py-8">
          No billing address configured. Edit your organization info to add a
          billing address.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-white p-5 shadow-[0px_20px_40px_0px_rgba(68,21,28,0.04)] sm:p-8">
      {/* Title */}
      <div className="flex items-center gap-2">
        <MapPin className="h-9 w-9 text-primary" />
        <h2 className="text-xl font-bold text-[#3d000c] capitalize">
          Billing Address
        </h2>
      </div>

      {/* Address Fields Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Left Column: Street + Area */}
        <div className="flex flex-col gap-4">
          <FieldCard label="Street Address" value={addr.street_address} />
          <FieldCard label="Area / Landmark" value={addr.area_landmark} />
        </div>

        {/* Right Column: City + Pincode + State */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldCard label="City" value={addr.city} />
          <FieldCard label="Pincode" value={addr.pincode} />
          <div className="sm:col-span-2">
            <FieldCard label="State / Country" value={addr.state_country} />
          </div>
        </div>
      </div>
    </div>
  );
}
