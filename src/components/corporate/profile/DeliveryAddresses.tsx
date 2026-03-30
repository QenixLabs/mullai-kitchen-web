"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, MapPin, Pencil, Trash2, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteDeliveryAddress } from "@/api/hooks/useCorporateProfile";
import { toast } from "sonner";
import type { ICorporateProfile, IDeliveryAddress } from "@/api/types/corporate.types";

interface DeliveryAddressesProps {
  profile: ICorporateProfile;
  onAddNew: () => void;
  onEdit: (index: number) => void;
}

function DeliveryAddressCard({
  address,
  index,
  onEdit,
  onDelete,
}: {
  address: IDeliveryAddress;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group bg-white rounded-3xl shadow-[0px_20px_40px_0px_rgba(61,0,12,0.04)] overflow-hidden"
    >
      {/* Image Header */}
      <div className="h-40 bg-secondary/20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        {address.is_default && (
          <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
            Default
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4">
        <div>
          <h4 className="text-lg font-bold text-[#1d1b1c] leading-7">
            {address.label || "Delivery Location"}
          </h4>
          <p className="text-sm font-normal text-[#554243] leading-[22.75px] mt-1">
            {address.full_address}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => onEdit(index)}
            className="flex items-center gap-1 text-xs font-bold text-[#554243] hover:text-primary transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(index)}
            className="flex items-center gap-1 text-xs font-bold text-[#554243] hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function DeliveryAddresses({
  profile,
  onAddNew,
  onEdit,
}: DeliveryAddressesProps) {
  const deleteAddress = useDeleteDeliveryAddress();
  const addresses = profile.delivery_addresses ?? [];

  const handleDelete = (index: number) => {
    deleteAddress.mutate(index, {
      onSuccess: () => {
        toast.success("Delivery location removed successfully");
      },
      onError: () => {
        toast.error("Failed to remove delivery location");
      },
    });
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {addresses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative flex flex-col items-center justify-center rounded-3xl bg-secondary/10 border-2 border-dashed border-border/40 py-24 px-6"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] blur-3xl" />
            </div>
            <div className="p-8 rounded-3xl bg-primary/5 text-primary mb-8 relative">
              <MapPin className="h-16 w-16" />
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                <Gem className="w-5 h-5 text-gold" />
              </div>
            </div>
            <h3 className="text-3xl font-black mb-4">
              No delivery locations yet
            </h3>
            <p className="text-muted-foreground mb-12 text-center max-w-md font-medium leading-relaxed">
              Add your first delivery address to streamline meal logistics for
              your organization.
            </p>
            <Button
              onClick={onAddNew}
              className="h-12 px-8 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus className="mr-3 h-5 w-5" />
              ADD YOUR FIRST ADDRESS
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {addresses.map((addr, idx) => (
              <DeliveryAddressCard
                key={idx}
                address={addr}
                index={idx}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
