"use client";

import { FaCoffee, FaDrumstickBite, FaUtensils, FaCheck, FaMapMarkerAlt, FaHome, FaPlus } from "react-icons/fa";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ADDRESS_CHAR_LIMIT = 40;

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
  // Address-related props
  addresses: Address[];
  addressesLoading?: boolean;
  defaultAddressId: string | null;
  mealAddressMappings: MealAddressMapping[];
  onAddressChange: (mealType: string, addressId: string) => void;
  onAddNewAddress: () => void;
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
  // Get the display address ID for a meal type (mapped or default)
  function getMealAddressId(mealType: string): string {
    const mapping = mealAddressMappings.find(m => m.meal_type === mealType);
    return mapping?.address_id || defaultAddressId || '';
  }

  // Get the address object for display
  function getAddressById(addressId: string): Address | undefined {
    return addresses.find(a => a._id === addressId);
  }

  // Truncate address text with ellipsis
  function truncateAddress(text: string): string {
    if (text.length <= ADDRESS_CHAR_LIMIT) return text;
    return text.slice(0, ADDRESS_CHAR_LIMIT) + "...";
  }

  // Format address label: "Type: address"
  function formatAddressLabel(type: string, address: string): string {
    const label = type === "Home" ? "Home" : type === "Office" ? "Office" : "Other";
    return `${label}: ${address}`;
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

                {/* Address Selection Dropdown - Only show when meal is selected */}
                {isSelected && (
                  <div className="border-t border-border bg-muted/30 px-4 pb-4 pt-3">
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Delivery Address for {config.label}
                    </label>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-full">
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
                                {/* Default/Home option */}
                                {defaultAddressId && (() => {
                                  const defAddr = addresses.find(a => a._id === defaultAddressId);
                                  if (!defAddr) return null;
                                  const fullLabel = formatAddressLabel(defAddr.type, defAddr.full_address || "Default Address");
                                  return (
                                    <SelectItem
                                      value={defaultAddressId}
                                      className="text-foreground focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                    >
                                      {fullLabel.length > ADDRESS_CHAR_LIMIT ? truncateAddress(fullLabel) : fullLabel}
                                    </SelectItem>
                                  );
                                })()}

                                {/* Other addresses */}
                                {addresses
                                  .filter(a => a._id !== defaultAddressId)
                                  .map((addr) => {
                                    const fullLabel = formatAddressLabel(addr.type, addr.full_address);
                                    return (
                                      <SelectItem
                                        key={addr._id}
                                        value={addr._id}
                                        className="text-foreground focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                      >
                                        {fullLabel.length > ADDRESS_CHAR_LIMIT ? truncateAddress(fullLabel) : fullLabel}
                                      </SelectItem>
                                    );
                                  })}

                                {/* Add new address option */}
                                <SelectItem
                                  value="__add_new__"
                                  className="text-primary font-medium focus:bg-primary focus:text-primary-foreground cursor-pointer border-t border-border mt-1 pt-1"
                                >
                                  <span className="flex items-center gap-2">
                                    <FaPlus className="h-3 w-3" />
                                    Add New Address
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        {selectedAddress && selectedAddress.full_address.length > ADDRESS_CHAR_LIMIT && (
                          <TooltipContent side="bottom" className="max-w-[200px]  whitespace-normal text-xs leading-relaxed">
                            {formatAddressLabel(selectedAddress.type, selectedAddress.full_address)}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Show selected address badge */}
                    {selectedAddress && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <FaHome className="mr-1 h-3 w-3" />
                          {selectedAddress.type} Address Selected
                        </span>
                      </div>
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
