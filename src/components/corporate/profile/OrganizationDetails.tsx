"use client";

import { motion } from "motion/react";
import { Phone, Mail, Briefcase, Hash, FileText } from "lucide-react";
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
    <div className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 p-8 sm:p-10">
      {/* Company Name */}
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
          Registered Entity
        </p>
        <h3 className="text-3xl font-black tracking-tight">
          {profile.company_name}
        </h3>
      </div>

      {/* GST + PAN Info Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {profile.gst_number && (
          <motion.div
            whileHover={{ y: -2 }}
            className="space-y-1.5 p-4 rounded-2xl bg-secondary/30 border border-border/40"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
              <Hash className="w-3 h-3" />
              <span>GST Number</span>
            </div>
            <p className="text-sm font-black text-foreground font-mono tracking-wider">
              {profile.gst_number}
            </p>
          </motion.div>
        )}

        {profile.pan_number && (
          <motion.div
            whileHover={{ y: -2 }}
            className="space-y-1.5 p-4 rounded-2xl bg-secondary/30 border border-border/40"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
              <FileText className="w-3 h-3" />
              <span>PAN Number</span>
            </div>
            <p className="text-sm font-black text-foreground font-mono tracking-wider">
              {profile.pan_number}
            </p>
          </motion.div>
        )}
      </div>

      {/* Delegate Card */}
      {delegate && delegate.name && (
        <div className="rounded-3xl bg-secondary/20 border border-border/40 p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-5">
            Authorized Delegate
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar Circle */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary shrink-0">
              <span className="text-lg font-black">
                {getInitials(delegate.name)}
              </span>
            </div>

            {/* Delegate Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-black text-foreground">
                {delegate.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground font-medium">
                  {delegate.designation || "Corporate Delegate"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                {delegate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-medium text-foreground">
                      {delegate.phone}
                    </span>
                  </div>
                )}
                {delegate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-medium text-foreground">
                      {delegate.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Button */}
            {(delegate.phone || delegate.email) && (
              <Button
                variant="outline"
                className="rounded-2xl h-11 px-6 border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80 shrink-0"
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
        </div>
      )}
    </div>
  );
}
