"use client";

import { FaCoffee, FaDrumstickBite, FaUtensils, FaCheck, FaMapMarkerAlt, FaHome, FaBuilding, FaPlus, FaMapPin } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { MealType } from "@/stores/plan-intent-store";
import type { Address, AddressType } from "@/api/types/customer.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADDRESS_CHAR_LIMIT = 35;

interface MealTypeConfig {
  label: string;
  icon: typeof FaCoffee;
  time: string;
  description: string;
  defaultAddressType: AddressType;
}

const MEAL_TYPE_CONFIG: Record<MealType, MealTypeConfig> = {
  Breakfast: {
    label: "Breakfast",
    icon: FaCoffee,
    time: "8:00 AM - 9:30 AM",
    description: "Start your day with a wholesome meal",
    defaultAddressType: "Home",
  },
  Lunch: {
    label: "Lunch",
    icon: FaDrumstickBite,
    time: "12:30 PM - 2:00 PM",
    description: "Midday fuel to keep you going",
    defaultAddressType: "Home",
  },
  Dinner: {
    label: "Dinner",
    icon: FaUtensils,
    time: "7:30 PM - 9:00 PM",
    description: "End your day with comfort food",
    defaultAddressType: "Home",
  },
};

export interface MealAddressMapping {
  meal_type: string;
  address_id: string;
}

interface MealTypeSelectorProps {
  availableMealTypes: MealType[];
  selectedMealType: MealType | null;
  onMealTypeChange: (mealType: MealType) => void;
  disabled?: boolean;
  addresses: Address[];
  addressesLoading?: boolean;
  defaultAddressId: string | null;
  mealAddressMappings: MealAddressMapping[];
  onAddressChange: (mealType: string, addressId: string) => void;
  onAddNewAddress: () => void;
}

function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "...";
}

function AddressTypeIcon({ type }: { type: string }) {
  if (type === "Office") return <FaBuilding className="h-3 w-3" />;
  return <FaHome className="h-3 w-3" />;
}

function AddressTypeBadge({ type }: { type: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      type === "Home" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : type === "Office" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    )}>
      <AddressTypeIcon type={type} />
      {type}
    </span>
  );
}

function AddressPreviewCard({ address }: { address: Address }) {
  return (
    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <FaMapPin className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <AddressTypeBadge type={address.type} />
            {address.landmark && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                {address.landmark}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground break-words">
            {address.full_address}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MealTypeSelector({
  availableMealTypes,
  selectedMealType,
  onMealTypeChange,
  disabled = false,
  addresses,
  addressesLoading = false,
  defaultAddressId,
  mealAddressMappings,
  onAddressChange,
  onAddNewAddress,
}: MealTypeSelectorProps) {
  function getMealAddressId(mealType: string): string {
    const mapping = mealAddressMappings.find(m => m.meal_type === mealType);
    return mapping?.address_id || defaultAddressId || '';
  }

  function getAddressById(addressId: string): Address | undefined {
    return addresses.find(a => a._id === addressId);
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
        <FaMapMarkerAlt className="h-5 w-5 text-primary" />
        Deliver Different Meals to Different Addresses
      </h2>

      {addressesLoading ? (
        <div className="flex items-center gap-2 rounded-sm border border-border bg-muted p-4">
          <span className="text-sm text-muted-foreground">Loading addresses...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {availableMealTypes.map((mealType) => {
            const config = MEAL_TYPE_CONFIG[mealType];
            const Icon = config.icon;
            const isSelected = selectedMealType === mealType;
            const selectedAddressId = getMealAddressId(mealType);
            const selectedAddress = getAddressById(selectedAddressId);

            return (
              <div
                key={mealType}
                className={cn(
                  "rounded-sm border-2 transition-all duration-300 overflow-hidden",
                  isSelected
                    ? "border-primary bg-card shadow-sm"
                    : "border-border bg-muted/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Meal Type Row */}
                <button
                  type="button"
                  onClick={() => onMealTypeChange(mealType)}
                  disabled={disabled}
                  className="flex w-full items-center p-4 text-left"
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border bg-background",
                      )}
                    >
                      {isSelected && (
                        <FaCheck className="w-3.5 h-3.5 text-primary-foreground" />
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-sm transition-colors shrink-0",
                        isSelected ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>

                    {/* Label & Time */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-sm leading-tight",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {config.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {config.time}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Address Selection - Only show when meal is selected */}
                {isSelected && (
                  <div className="border-t border-border bg-muted/20 px-4 pb-4 pt-3">
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Delivery Address for {config.label}
                    </label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={(value) => {
                        if (value === "__add_new__") {
                          onAddNewAddress();
                        } else {
                          onAddressChange(mealType, value);
                        }
                      }}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-full bg-card border-border text-foreground focus:ring-primary focus:ring-1 [&>span]:truncate">
                        <SelectValue placeholder="Select delivery address" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-w-[min(var(--radix-select-trigger-width),28rem)]">
                        {/* Default address option */}
                        {defaultAddressId && (() => {
                          const defAddr = addresses.find(a => a._id === defaultAddressId);
                          if (!defAddr) return null;
                          return (
                            <SelectItem
                              value={defaultAddressId}
                              className="text-foreground focus:bg-primary focus:text-primary-foreground cursor-pointer py-2.5"
                            >
                              <div className="flex items-center gap-2">
                                <AddressTypeBadge type={defAddr.type} />
                                <span className="truncate text-sm">{truncateText(defAddr.full_address || "Default Address", ADDRESS_CHAR_LIMIT)}</span>
                              </div>
                            </SelectItem>
                          );
                        })()}

                        {/* Other addresses */}
                        {addresses
                          .filter(a => a._id !== defaultAddressId)
                          .map((addr) => (
                            <SelectItem
                              key={addr._id}
                              value={addr._id}
                              className="text-foreground focus:bg-primary focus:text-primary-foreground cursor-pointer py-2.5"
                            >
                              <div className="flex items-center gap-2">
                                <AddressTypeBadge type={addr.type} />
                                <span className="truncate text-sm">{truncateText(addr.full_address, ADDRESS_CHAR_LIMIT)}</span>
                              </div>
                            </SelectItem>
                          ))}

                        {/* Add new address option */}
                        <SelectItem
                          value="__add_new__"
                          className="text-primary font-medium focus:bg-primary focus:text-primary-foreground cursor-pointer border-t border-border mt-1 pt-2"
                        >
                          <span className="flex items-center gap-2">
                            <FaPlus className="h-3 w-3" />
                            Add New Address
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Selected address preview card */}
                    {selectedAddress && (
                      <AddressPreviewCard address={selectedAddress} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
