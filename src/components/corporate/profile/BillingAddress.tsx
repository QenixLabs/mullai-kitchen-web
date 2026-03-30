"use client";

import { motion } from "motion/react";
import {
  MapPin,
  Building,
  Map,
  Navigation,
  Globe,
} from "lucide-react";
import type { ICorporateProfile } from "@/api/types/corporate.types";

interface BillingAddressProps {
  profile: ICorporateProfile;
}

const BILLING_FIELDS = [
  {
    key: "street_address" as const,
    label: "Street Address",
    icon: MapPin,
  },
  {
    key: "city" as const,
    label: "City",
    icon: Building,
  },
  {
    key: "pincode" as const,
    label: "Pincode",
    icon: Map,
  },
  {
    key: "area_landmark" as const,
    label: "Area / Landmark",
    icon: Navigation,
  },
  {
    key: "state_country" as const,
    label: "State / Country",
    icon: Globe,
  },
] as const;

export function BillingAddress({ profile }: BillingAddressProps) {
  const { billing_address: addr } = profile;

  const hasAnyField = BILLING_FIELDS.some((f) => addr[f.key]?.trim());

  if (!hasAnyField) {
    return (
      <div className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 p-8 sm:p-10">
        <p className="text-sm font-medium text-muted-foreground text-center py-6">
          No billing address configured. Edit your organization info to add a
          billing address.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 p-8 sm:p-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BILLING_FIELDS.map((field) => {
          const value = addr[field.key]?.trim();
          if (!value) return null;

          return (
            <motion.div
              key={field.key}
              whileHover={{ y: -2 }}
              className="space-y-1.5 p-4 rounded-2xl bg-secondary/30 border border-border/40"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                <field.icon className="w-3 h-3" />
                <span>{field.label}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{value}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
