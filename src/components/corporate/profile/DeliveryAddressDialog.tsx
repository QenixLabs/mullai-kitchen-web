"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Loader2, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddDeliveryAddress,
  useUpdateDeliveryAddress,
} from "@/api/hooks/useCorporateProfile";
import { toast } from "sonner";
import type { IDeliveryAddress } from "@/api/types/corporate.types";

const deliveryAddressSchema = z.object({
  label: z.string().min(1, "Location label is required"),
  street_address: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  is_default: z.boolean(),
});

type DeliveryAddressFormValues = z.infer<typeof deliveryAddressSchema>;

interface DeliveryAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIndex: number | null;
  existingAddress: IDeliveryAddress | null;
}

export function DeliveryAddressDialog({
  open,
  onOpenChange,
  editIndex,
  existingAddress,
}: DeliveryAddressDialogProps) {
  const addAddress = useAddDeliveryAddress();
  const updateAddress = useUpdateDeliveryAddress();
  const isEditing = editIndex !== null && existingAddress !== null;

  const form = useForm<DeliveryAddressFormValues>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      label: "",
      street_address: "",
      area: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      is_default: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && existingAddress) {
        form.reset({
          label: existingAddress.label || "",
          street_address: existingAddress.street_address || "",
          area: existingAddress.area || "",
          landmark: existingAddress.landmark || "",
          city: existingAddress.city || "",
          state: existingAddress.state || "",
          pincode: existingAddress.pincode || "",
          is_default: existingAddress.is_default ?? false,
        });
      } else {
        form.reset({
          label: "",
          street_address: "",
          area: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
          is_default: false,
        });
      }
    }
  }, [open, isEditing, existingAddress, form]);

  const isPending = addAddress.isPending || updateAddress.isPending;

  const buildFullAddress = (values: DeliveryAddressFormValues) => {
    const parts = [
      values.street_address,
      values.area,
      values.landmark,
      values.city,
      values.state,
      values.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSubmit = (values: DeliveryAddressFormValues) => {
    const full_address = buildFullAddress(values);
    const payload = {
      label: values.label,
      full_address,
      street_address: values.street_address || undefined,
      area: values.area || undefined,
      landmark: values.landmark || undefined,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      is_default: values.is_default,
    };

    if (isEditing && editIndex !== null) {
      updateAddress.mutate(
        { index: editIndex, data: payload },
        {
          onSuccess: () => {
            toast.success("Delivery location updated successfully");
            onOpenChange(false);
          },
          onError: () => {
            toast.error("Failed to update delivery location");
          },
        },
      );
    } else {
      addAddress.mutate(payload, {
        onSuccess: () => {
          toast.success("Delivery location added successfully");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to add delivery location");
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card rounded-4xl border border-border/50 shadow-2xl p-8 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          <DialogHeader className="mb-8 text-left relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {isEditing ? "Edit Delivery Location" : "Add Delivery Location"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              {isEditing
                ? "Update the details for this delivery location."
                : "Add a new delivery location for meal logistics."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 relative z-10"
          >
            {/* Label */}
            <div className="space-y-2">
              <Label
                htmlFor="addr-label"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Location Label *
              </Label>
              <Input
                id="addr-label"
                placeholder="e.g., Head Office, Tech Park"
                className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                {...form.register("label")}
              />
              {form.formState.errors.label && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <Label
                htmlFor="addr-street"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Street Address
              </Label>
              <Input
                id="addr-street"
                placeholder="Building name, flat / house no."
                className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                {...form.register("street_address")}
              />
            </div>

            {/* Area + Landmark Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="addr-area"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Area
                </Label>
                <Input
                  id="addr-area"
                  placeholder="e.g., Anna Nagar"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("area")}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="addr-landmark"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Landmark
                </Label>
                <Input
                  id="addr-landmark"
                  placeholder="e.g., Near Temple"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("landmark")}
                />
              </div>
            </div>

            {/* City + State Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="addr-city"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  City *
                </Label>
                <Input
                  id="addr-city"
                  placeholder="e.g., Chennai"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive ml-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="addr-state"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  State *
                </Label>
                <Input
                  id="addr-state"
                  placeholder="e.g., Tamil Nadu"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  {...form.register("state")}
                />
                {form.formState.errors.state && (
                  <p className="text-xs text-destructive ml-1">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label
                htmlFor="addr-pincode"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Pincode *
              </Label>
              <Input
                id="addr-pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                {...form.register("pincode", {
                  onChange: (e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    form.setValue("pincode", onlyDigits, { shouldValidate: true });
                  },
                })}
              />
              {form.formState.errors.pincode && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.pincode.message}
                </p>
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/20 border border-border/30 p-4">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-[#1d1b1c]">
                    Set as default
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Orders will use this address by default
                  </p>
                </div>
              </div>
              <Switch
                checked={form.watch("is_default")}
                onCheckedChange={(checked) =>
                  form.setValue("is_default", checked)
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <DialogFooter className="sm:justify-between sm:gap-4 relative z-10 border-t border-border/40 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 shadow-xl shadow-primary/20 font-black text-[10px] tracking-widest active:scale-95 transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    SAVING...
                  </>
                ) : isEditing ? (
                  "UPDATE LOCATION"
                ) : (
                  "ADD LOCATION"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
