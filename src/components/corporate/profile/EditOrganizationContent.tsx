"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useCorporateProfile,
  useUpdateCorporateProfile,
} from "@/api/hooks/useCorporateProfile";
import { editProfileSchema } from "./edit-org-schema";
import type { EditProfileFormValues } from "./edit-org-schema";
import { OrganizationIdentityCard } from "./OrganizationIdentityCard";
import { ContactDelegateCard } from "./ContactDelegateCard";
import { BillingAddressEditCard } from "./BillingAddressEditCard";

const defaultValues: EditProfileFormValues = {
  company_name: "",
  gst_number: "",
  pan_number: "",
  delegate_name: "",
  delegate_designation: "",
  delegate_phone: "",
  delegate_email: "",
  street_address: "",
  city: "",
  pincode: "",
  area_landmark: "",
  state_country: "",
};

function getDefaultValuesFromProfile(
  profile: NonNullable<ReturnType<typeof useCorporateProfile>["data"]>
): EditProfileFormValues {
  return {
    company_name: profile.company_name || "",
    gst_number: profile.gst_number || "",
    pan_number: profile.pan_number || "",
    delegate_name: profile.delegate?.name || "",
    delegate_designation: profile.delegate?.designation || "",
    delegate_phone: profile.delegate?.phone || "",
    delegate_email: profile.delegate?.email || "",
    street_address: profile.billing_address?.street_address || "",
    city: profile.billing_address?.city || "",
    pincode: profile.billing_address?.pincode || "",
    area_landmark: profile.billing_address?.area_landmark || "",
    state_country: profile.billing_address?.state_country || "",
  };
}

export function EditOrganizationContent() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useCorporateProfile();
  const updateProfile = useUpdateCorporateProfile();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset(getDefaultValuesFromProfile(profile));
    }
  }, [profile, form]);

  const handleDiscard = () => {
    if (profile) {
      form.reset(getDefaultValuesFromProfile(profile));
      toast.info("Changes discarded");
    }
  };

  const handleSave = (values: EditProfileFormValues) => {
    updateProfile.mutate(
      {
        company_name: values.company_name,
        gst_number: values.gst_number || undefined,
        pan_number: values.pan_number || undefined,
        delegate: {
          name: values.delegate_name,
          designation: values.delegate_designation || undefined,
          phone: values.delegate_phone || undefined,
          email: values.delegate_email || undefined,
        },
        billing_address: {
          street_address: values.street_address || undefined,
          city: values.city || undefined,
          pincode: values.pincode || undefined,
          area_landmark: values.area_landmark || undefined,
          state_country: values.state_country || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Organization info updated successfully");
          router.push("/corporate/profile");
        },
        onError: () => {
          toast.error("Failed to update organization info. Please try again.");
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-10 w-80 rounded-2xl" />
            <Skeleton className="h-6 w-96 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <Skeleton className="h-72 w-full rounded-[16px]" />
            <Skeleton className="h-96 w-full rounded-[16px]" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-[500px] w-full rounded-[16px]" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
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

  const { register, formState, setValue, watch } = form;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[36px] font-extrabold tracking-[-0.9px] uppercase text-primary">
            Edit Organization Info
          </h1>
          <p className="text-lg text-[#554243] font-normal leading-7">
            Update your corporate identity and billing preferences to keep your
            account information accurate
          </p>
        </div>

        <Link
          href="/corporate/profile"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#3d000c] border border-[#3d000c]/20 hover:bg-[#3d000c]/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK
        </Link>
      </div>

      {/* Main Grid: 7:5 */}
      <form onSubmit={form.handleSubmit(handleSave)} className="contents">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <OrganizationIdentityCard
              register={register}
              errors={formState.errors}
            />
            <ContactDelegateCard
              register={register}
              errors={formState.errors}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            <BillingAddressEditCard
              register={register}
              errors={formState.errors}
              setValue={setValue}
              watch={watch}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            onClick={handleDiscard}
            disabled={updateProfile.isPending}
            variant="ghost"
            className="rounded-full text-[#554243] px-8 h-12 text-sm font-semibold hover:text-[#3d000c]"
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-gradient-to-br from-[#3d000c] to-[#5d101d] rounded-full text-white px-8 h-12 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
