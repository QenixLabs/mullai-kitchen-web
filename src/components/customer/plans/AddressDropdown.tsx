"use client";

import { useState, useRef, useEffect } from "react";
import { FaHome, FaBriefcase, FaMapMarkerAlt, FaPlus, FaChevronDown } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { Address, AddressType } from "@/api/types/customer.types";
import { Button } from "@/components/ui/button";

interface AddressDropdownProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  disabled?: boolean;
  /** Suggested address type based on meal type - will auto-select if available */
  suggestedAddressType?: AddressType | null;
}

const ADDRESS_TYPE_ICONS: Record<AddressType, typeof FaHome> = {
  Home: FaHome,
  Office: FaBriefcase,
  Other: FaMapMarkerAlt,
};

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  Home: "Home",
  Office: "Office",
  Other: "Other",
};

function getDefaultAddress(addresses: Address[], suggestedType?: AddressType | null): Address | null {
  if (addresses.length === 0) return null;

  // If a suggested type is provided, try to find that first
  if (suggestedType) {
    const suggestedAddress = addresses.find((a) => a.type === suggestedType);
    if (suggestedAddress) return suggestedAddress;
  }

  // Fallback to default address or first saved address
  return addresses.find((a) => a.is_default) || addresses[0] || null;
}

function formatAddressLabel(address: Address): string {
  const parts = [address.area, address.city].filter(Boolean);
  return parts.join(", ") || address.full_address;
}

export function AddressDropdown({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  disabled = false,
  suggestedAddressType,
}: AddressDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAutoSelected = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-select address based on suggested type when addresses load or suggestion changes
  useEffect(() => {
    if (addresses.length > 0 && !hasAutoSelected.current) {
      const defaultAddr = getDefaultAddress(addresses, suggestedAddressType);
      if (defaultAddr) {
        onSelectAddress(defaultAddr._id);
        hasAutoSelected.current = true;
      }
    }
  }, [addresses, suggestedAddressType, onSelectAddress]);

  // Reset auto-selection when suggested type changes
  useEffect(() => {
    hasAutoSelected.current = false;
  }, [suggestedAddressType]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const hasHomeAddress = addresses.some((a) => a.type === "Home");
  const hasOfficeAddress = addresses.some((a) => a.type === "Office");

  const handleQuickSelect = (type: AddressType) => {
    const address = addresses.find((a) => a.type === type);
    if (address) {
      onSelectAddress(address._id);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-sm border bg-background px-3 py-2.5 text-left transition-all",
          isOpen
            ? "border-primary ring-1 ring-primary"
            : "border-border hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedAddress ? (
            <>
              {(() => {
                const Icon = ADDRESS_TYPE_ICONS[selectedAddress.type];
                return <Icon className="h-4 w-4 shrink-0 text-primary" />;
              })()}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {ADDRESS_TYPE_LABELS[selectedAddress.type]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatAddressLabel(selectedAddress)}
                </p>
              </div>
            </>
          ) : (
            <>
              <FaMapMarkerAlt className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {addresses.length > 0 ? "Select address" : "No saved addresses"}
              </span>
            </>
          )}
        </div>
        <FaChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-sm border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          {/* Quick Select Row */}
          {addresses.length > 0 && (
            <div className="border-b border-border p-2">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Select
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("Home")}
                  disabled={!hasHomeAddress}
                  className={cn(
                    "flex-1 gap-1.5 text-xs",
                    selectedAddress?.type === "Home" && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <FaHome className="h-3 w-3" />
                  Home
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect("Office")}
                  disabled={!hasOfficeAddress}
                  className={cn(
                    "flex-1 gap-1.5 text-xs",
                    selectedAddress?.type === "Office" && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <FaBriefcase className="h-3 w-3" />
                  Office
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAddNewAddress();
                    setIsOpen(false);
                  }}
                  className="gap-1.5 text-xs border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
                >
                  <FaPlus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Saved Addresses List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {addresses.length > 0 ? (
              addresses.map((address) => {
                const Icon = ADDRESS_TYPE_ICONS[address.type];
                const isSelected = address._id === selectedAddressId;

                return (
                  <button
                    key={address._id}
                    type="button"
                    onClick={() => {
                      onSelectAddress(address._id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {ADDRESS_TYPE_LABELS[address.type]}
                        </span>
                        {address.is_default && (
                          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatAddressLabel(address)}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-0.5 shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No saved addresses</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Add an address to continue
                </p>
              </div>
            )}
          </div>

          {/* Add New Address Button */}
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddNewAddress();
                setIsOpen(false);
              }}
              className="w-full justify-center gap-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
            >
              <FaPlus className="h-3 w-3" />
              Add New Address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
