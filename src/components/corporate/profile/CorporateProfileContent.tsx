"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  PlusCircle,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCorporateProfile,
  useCreateCorporateProfile,
} from "@/api/hooks/useCorporateProfile";
import { useCurrentUser } from "@/hooks/useUserStore";
import { OrganizationDetails } from "./OrganizationDetails";
import { BillingAddress } from "./BillingAddress";
import { DeliveryAddresses } from "./DeliveryAddresses";
import { AccountSecurity } from "./AccountSecurity";
import { EditOrganizationDialog } from "./EditOrganizationDialog";
import { DeliveryAddressDialog } from "./DeliveryAddressDialog";
import type { ICorporateProfile } from "@/api/types/corporate.types";

export function CorporateProfileContent() {
  const user = useCurrentUser();
  const { data: profile, isLoading, error } = useCorporateProfile();
  const createProfile = useCreateCorporateProfile();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [editingDeliveryIndex, setEditingDeliveryIndex] = useState<
    number | null
  >(null);

  const handleCreateProfile = () => {
    createProfile.mutate({
      company_name: user?.name || "My Organization",
      delegate: {
        name: user?.name || "",
        designation: "Administrator",
        phone: user?.phone || "",
        email: user?.email || "",
      },
      billing_address: {
        street_address: "",
        city: "",
        pincode: "",
        area_landmark: "",
        state_country: "",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-6">
            <Skeleton className="h-16 w-16 rounded-3xl" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-64 rounded-3xl" />
              <Skeleton className="h-4 w-40 rounded-xl" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-4xl mb-8" />
        <Skeleton className="h-64 w-full rounded-4xl mb-8" />
        <Skeleton className="h-48 w-full rounded-4xl mb-8" />
        <Skeleton className="h-32 w-full rounded-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full  px-4 sm:px-6 sm:py-24 lg:px-8 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-full bg-destructive/10 text-destructive mb-8 border border-destructive/20"
        >
          <Building2 className="h-16 w-16" />
        </motion.div>
        <h2 className="text-3xl font-black mb-4">Profile Unavailable</h2>
        <p className="text-muted-foreground mb-12 text-center  font-medium">
          {error instanceof Error
            ? error.message
            : "We encountered a temporary synchronization error. Your corporate data remains secure."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-10 h-14 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          RETRY CONNECTION
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full  px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -mr-80 -mt-40" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -ml-80 -mb-40" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-br from-primary to-primary/80 text-white shadow-2xl shadow-primary/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2">
                Corporate Profile
              </h1>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest"
                >
                  Mullai Corporate
                </Badge>
                <p className="text-sm font-bold text-muted-foreground">
                  Welcome, {user?.name || "Corporate Partner"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-4xl bg-secondary/10 border-2 border-dashed border-border/40 py-32 px-6">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] blur-3xl" />
          </div>
          <div className="p-8 rounded-4xl bg-primary/5 text-primary mb-8 relative">
            <Building2 className="h-16 w-16" />
          </div>
          <h3 className="text-3xl font-black mb-4">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-12 text-center  font-medium leading-relaxed">
            Set up your corporate identity to unlock order management, billing,
            and delivery configuration for your organization.
          </p>
          <Button
            onClick={handleCreateProfile}
            disabled={createProfile.isPending}
            className="h-14 px-10 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                CREATING PROFILE...
              </>
            ) : (
              <>
                <PlusCircle className="mr-3 h-5 w-5" />
                SET UP PROFILE
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -mr-80 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -ml-80 -mb-40" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-br from-primary to-primary/80 text-white shadow-2xl shadow-primary/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2">
              Corporate Profile
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest"
              >
                Mullai Corporate
              </Badge>
              <p className="text-sm font-bold text-muted-foreground">
                Manage your organization&apos;s identity, billing parameters, and
                high-frequency delivery locations
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsEditDialogOpen(true)}
          className="group relative h-14 px-8 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <ArrowRight className="mr-3 h-5 w-5 relative z-10" />
          <span className="relative z-10">Edit Organization Info</span>
        </Button>
      </div>

      {/* Organization Details */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
          <h2 className="text-3xl font-black tracking-tight">
            Organization Identity
          </h2>
        </div>
        <OrganizationDetails profile={profile} />
      </div>

      {/* Billing Address */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
          <h2 className="text-3xl font-black tracking-tight">Billing Address</h2>
        </div>
        <BillingAddress profile={profile} />
      </div>

      {/* Delivery Addresses */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
            <h2 className="text-3xl font-black tracking-tight">
              Delivery Locations
            </h2>
          </div>
          <button
            onClick={() => {
              setEditingDeliveryIndex(null);
              setIsDeliveryDialogOpen(true);
            }}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
        <DeliveryAddresses
          profile={profile}
          onAddNew={() => {
            setEditingDeliveryIndex(null);
            setIsDeliveryDialogOpen(true);
          }}
          onEdit={(index: number) => {
            setEditingDeliveryIndex(index);
            setIsDeliveryDialogOpen(true);
          }}
        />
      </div>

      {/* Account Security */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
          <h2 className="text-3xl font-black tracking-tight">
            Account Security
          </h2>
        </div>
        <AccountSecurity />
      </div>

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
      />

      {/* Delivery Address Dialog */}
      <DeliveryAddressDialog
        open={isDeliveryDialogOpen}
        onOpenChange={setIsDeliveryDialogOpen}
        editIndex={editingDeliveryIndex}
        existingAddress={
          editingDeliveryIndex !== null
            ? profile.delivery_addresses[editingDeliveryIndex]
            : null
        }
      />
    </div>
  );
}
