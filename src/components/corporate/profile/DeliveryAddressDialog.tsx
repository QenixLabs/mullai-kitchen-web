"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  full_address: z.string().min(1, "Full address is required"),
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
      full_address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && existingAddress) {
        form.reset({
          label: existingAddress.label || "",
          full_address: existingAddress.full_address || "",
        });
      } else {
        form.reset({
          label: "",
          full_address: "",
        });
      }
    }
  }, [open, isEditing, existingAddress, form]);

  const isPending = addAddress.isPending || updateAddress.isPending;

  const handleSubmit = (values: DeliveryAddressFormValues) => {
    if (isEditing && editIndex !== null) {
      updateAddress.mutate(
        {
          index: editIndex,
          data: values,
        },
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
      addAddress.mutate(
        {
          label: values.label,
          full_address: values.full_address,
        },
        {
          onSuccess: () => {
            toast.success("Delivery location added successfully");
            onOpenChange(false);
          },
          onError: () => {
            toast.error("Failed to add delivery location");
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
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
                ? "Update the label or address for this delivery location."
                : "Add a new delivery location for meal logistics."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 relative z-10"
          >
            <div className="space-y-2">
              <Label
                htmlFor="addr-label"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Location Label
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

            <div className="space-y-2">
              <Label
                htmlFor="addr-full"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Full Address
              </Label>
              <Input
                id="addr-full"
                placeholder="Complete delivery address"
                className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                {...form.register("full_address")}
              />
              {form.formState.errors.full_address && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.full_address.message}
                </p>
              )}
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
