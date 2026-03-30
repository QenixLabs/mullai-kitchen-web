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
      className="group rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 p-6 sm:p-8 transition-all"
    >
      {/* Top Row: Label + Default Badge + Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">
              {address.label || "Delivery Location"}
            </h4>
            {address.is_default && (
              <span className="inline-flex items-center gap-1.5 mt-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                  <svg
                    className="h-2 w-2 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Default
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(index)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all outline outline-1 outline-border/40"
          >
            <Pencil className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(index)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all outline outline-1 outline-border/40"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Address Text */}
      <p className="text-sm font-medium text-muted-foreground leading-relaxed pl-[52px]">
        {address.full_address}
      </p>
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
            className="relative flex flex-col items-center justify-center rounded-4xl bg-secondary/10 border-2 border-dashed border-border/40 py-24 px-6"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] blur-3xl" />
            </div>
            <div className="p-8 rounded-4xl bg-primary/5 text-primary mb-8 relative">
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
              className="h-14 px-10 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
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
