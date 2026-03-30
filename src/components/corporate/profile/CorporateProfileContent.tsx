"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  PlusCircle,
  Plus,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 rounded-2xl" />
            <Skeleton className="h-6 w-96 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-60 rounded-full" />
        </div>
        <Skeleton className="h-72 w-full rounded-3xl mb-8" />
        <Skeleton className="h-80 w-full rounded-3xl mb-8" />
        <Skeleton className="h-72 w-full rounded-3xl mb-8" />
        <Skeleton className="h-52 w-full rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-24 lg:px-8 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-full bg-destructive/10 text-destructive mb-8 border border-destructive/20"
        >
          <Building2 className="h-16 w-16" />
        </motion.div>
        <h2 className="text-3xl font-black mb-4">Profile Unavailable</h2>
        <p className="text-muted-foreground mb-12 text-center font-medium">
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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-6 mb-12">
          <h1 className="text-4xl sm:text-[36px] font-extrabold tracking-tight uppercase text-primary">
            Corporate Profile
          </h1>
          <p className="text-lg text-[#554243] font-normal">
            Welcome, {user?.name || "Corporate Partner"}
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-3xl bg-secondary/10 border-2 border-dashed border-border/40 py-32 px-6">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] blur-3xl" />
          </div>
          <div className="p-8 rounded-3xl bg-primary/5 text-primary mb-8 relative">
            <Building2 className="h-16 w-16" />
          </div>
          <h3 className="text-3xl font-black mb-4">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-12 text-center font-medium leading-relaxed">
            Set up your corporate identity to unlock order management, billing,
            and delivery configuration for your organization.
          </p>
          <Button
            onClick={handleCreateProfile}
            disabled={createProfile.isPending}
            className="h-12 px-8 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[36px] font-extrabold tracking-[-0.9px] uppercase text-primary">
            Corporate Profile
          </h1>
          <p className="text-lg text-[#554243] font-normal leading-7">
            Manage your organization&apos;s identity, billing parameters,
            and high-frequency delivery locations
          </p>
        </div>

        <Button
          onClick={() => setIsEditDialogOpen(true)}
          className="h-12 w-fit px-8 rounded-full bg-gradient-to-br from-[#3d000c] to-[#5d101d] text-white font-semibold text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Pencil className="h-[18px] w-[18px]" />
          Edit Organization Info
        </Button>
      </div>

      {/* Organization Details + Delegate */}
      <OrganizationDetails profile={profile} />

      {/* Billing Address */}
      <BillingAddress profile={profile} />

      {/* Delivery Addresses */}
      {/* <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-primary">Delivery Addresses</h2>
          <button
            onClick={() => {
              setEditingDeliveryIndex(null);
              setIsDeliveryDialogOpen(true);
            }}
            className="flex items-center gap-1 text-sm font-bold text-[#3d000c] hover:text-primary/70 transition-colors"
          >
            <Plus className="h-[10.5px] w-[10.5px]" />
            Add New Address
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
      </div> */}

      {/* Account Security */}
      <div className="flex flex-col gap-6">
        <div className="px-2">
          <h2 className="text-xl font-bold text-primary">Account Security</h2>
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
