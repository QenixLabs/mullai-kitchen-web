"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateCorporateProfile } from "@/api/hooks/useCorporateProfile";
import { toast } from "sonner";
import type { ICorporateProfile } from "@/api/types/corporate.types";
import { editProfileSchema, type EditProfileFormValues } from "./edit-org-schema";

interface EditOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ICorporateProfile;
}

export function EditOrganizationDialog({
  open,
  onOpenChange,
  profile,
}: EditOrganizationDialogProps) {
  const updateProfile = useUpdateCorporateProfile();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
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
      });
    }
  }, [open, profile, form]);

  const handleSubmit = (values: EditProfileFormValues) => {
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
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to update organization info");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card rounded-4xl border border-border/50 shadow-2xl p-8 overflow-hidden max-h-[85vh] overflow-y-auto"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          <DialogHeader className="mb-8 text-left relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                Edit Organization
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              Update your organization&apos;s registered details, delegate
              information, and billing address.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 relative z-10"
          >
            {/* Organization Info */}
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Organization Details
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="company_name"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  placeholder="Your organization name"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("company_name")}
                />
                {form.formState.errors.company_name && (
                  <p className="text-xs text-destructive ml-1">
                    {form.formState.errors.company_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="gst_number"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    GST Number
                  </Label>
                  <Input
                    id="gst_number"
                    placeholder="22AAAAA0000A1Z5"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                    {...form.register("gst_number")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pan_number"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    PAN Number
                  </Label>
                  <Input
                    id="pan_number"
                    placeholder="AAAAA0000A"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                    {...form.register("pan_number")}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Delegate Info */}
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Authorized Delegate
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="delegate_name"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Full Name
                </Label>
                <Input
                  id="delegate_name"
                  placeholder="Delegate's full name"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("delegate_name")}
                />
                {form.formState.errors.delegate_name && (
                  <p className="text-xs text-destructive ml-1">
                    {form.formState.errors.delegate_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="delegate_designation"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Designation
                  </Label>
                  <Input
                    id="delegate_designation"
                    placeholder="e.g., HR Manager"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("delegate_designation")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="delegate_phone"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Phone
                  </Label>
                  <Input
                    id="delegate_phone"
                    placeholder="+91 98765 43210"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("delegate_phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="delegate_email"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Email
                  </Label>
                  <Input
                    id="delegate_email"
                    placeholder="delegate@company.com"
                    type="email"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("delegate_email")}
                  />
                  {form.formState.errors.delegate_email && (
                    <p className="text-xs text-destructive ml-1">
                      {form.formState.errors.delegate_email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Billing Address */}
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Billing Address
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="street_address"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Street Address
                </Label>
                <Input
                  id="street_address"
                  placeholder="Office number, building, street"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("street_address")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="City name"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("city")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pincode"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="600001"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-mono"
                    {...form.register("pincode")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="area_landmark"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Area / Landmark
                  </Label>
                  <Input
                    id="area_landmark"
                    placeholder="Nearest landmark"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("area_landmark")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="state_country"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    State / Country
                  </Label>
                  <Input
                    id="state_country"
                    placeholder="Tamil Nadu, India"
                    className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    {...form.register("state_country")}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between sm:gap-4 relative z-10 border-t border-border/40 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateProfile.isPending}
                className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 shadow-xl shadow-primary/20 font-black text-[10px] tracking-widest active:scale-95 transition-all"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    SAVING...
                  </>
                ) : (
                  "SAVE CHANGES"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
