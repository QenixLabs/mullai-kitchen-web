"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaLock,
  FaLaptop,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaPencilAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { Marker } from "@react-google-maps/api";

import { useCurrentUser } from "@/hooks/useUserStore";
import { useAddressList } from "@/api/hooks/useAddress";
import { useDeleteAddress } from "@/api/hooks/useDeleteAddress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { GoogleMap } from "./GoogleMap";
import { AddressSelectionModal } from "./AddressSelectionModal";
import type { Address } from "@/api/types/customer.types";

const DEFAULT_MAP_CENTER = { lat: 13.0827, lng: 80.2707 };

export function ProfileContent() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: addresses, isLoading: isAddressesLoading } = useAddressList();
  const deleteAddress = useDeleteAddress();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(
    undefined,
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleDeleteAddress = (id: string) => {
    deleteAddress.mutate(id);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsAddressModalOpen(open);
    if (!open) setEditingAddress(undefined);
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <Card className="overflow-hidden rounded-[24px] border border-[#E8E0E4] bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-[#E7E0E4]">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-primary/10 font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-[26px] sm:text-[30px] md:text-[32px] font-bold leading-none text-[#27161A]">
                  {user?.name || "-"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6F666A] md:text-base md:gap-3">
                  <span className="inline-flex items-center gap-1">
                    <FaPhone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {user?.phone || "-"}
                  </span>
                  <span className="rounded-full bg-[#EAF8EF] px-2 py-0.5 text-[11px] font-bold text-[#209952] sm:text-xs">
                    Verified
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#6F666A] md:text-base">
                  <FaEnvelope className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{user?.email || "-"}</span>
                </div>
              </div>
            </div>

            <Button
              className="h-9 sm:h-10 md:h-11 rounded-full bg-[#4A0010] px-5 sm:px-6 md:px-8 text-sm sm:text-base font-bold text-white hover:bg-[#35000B]"
              onClick={() => router.push("/profile/edit")}
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2
            className="text-[18px] sm:text-[20px] md:text-[22px] font-bold leading-none text-[#341117]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Delivery Addresses
          </h2>
          <Button
            variant="link"
            className="h-auto text-sm font-bold text-[#4A1A24] hover:opacity-75 md:text-base"
            onClick={() => {
              setEditingAddress(undefined);
              setIsAddressModalOpen(true);
            }}
          >
            + Add New Address
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
          {isAddressesLoading ? (
            <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100 md:col-span-2" />
          ) : addresses && addresses.length > 0 ? (
            addresses.map((address) => {
              const mapCenter =
                address.lat && address.lng
                  ? { lat: address.lat, lng: address.lng }
                  : DEFAULT_MAP_CENTER;

              return (
                <Card
                  key={address._id}
                  className="overflow-hidden rounded-[24px] border border-[#E7E0E4] bg-white shadow-sm"
                >
                  <div className="relative h-28 border-b border-[#ECE6E9] bg-[#F4F1F2]">
                    <GoogleMap
                      center={mapCenter}
                      zoom={15}
                      height="h-full"
                      className="border-0"
                      onClick={() => {}}
                    >
                      <Marker position={mapCenter} />
                    </GoogleMap>
                    {address.is_default && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#4A0010] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[22px] font-bold leading-none text-[#2E161B]">
                          {address.type}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#6E6468]">
                          {address.full_address}, {address.area}, {address.city} - {address.pincode}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-[#6F6569]">
                          <Button
                            variant="link"
                            onClick={() => handleEditAddress(address)}
                            className="inline-flex h-auto items-center gap-1 p-0 hover:text-[#4A0010]"
                          >
                            <FaPencilAlt className="h-3 w-3" /> Edit
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => handleDeleteAddress(address._id)}
                            className="inline-flex h-auto items-center gap-1 p-0 hover:text-[#4A0010]"
                          >
                            <FaTrash className="h-3 w-3" /> Delete
                          </Button>
                        </div>
                      </div>

                      <FaMapMarkerAlt className="mt-1 h-4 w-4 text-[#8A7D82]" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-gray-200 bg-white px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                <FaExclamationCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Addresses Found</h3>
              <p className="mt-1 mb-6 max-w-65 text-sm text-gray-500">
                Add an address to start ordering delicious home-cooked meals.
              </p>
              <Button
                size="sm"
                className="px-8 font-bold"
                onClick={() => {
                  setEditingAddress(undefined);
                  setIsAddressModalOpen(true);
                }}
              >
                Add Your First Address
              </Button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2
          className="mb-4 text-[20px] font-bold leading-none text-[#341117]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Communication Preferences
        </h2>
        <Card className="rounded-[24px] border border-[#E8E0E4] bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-4 border-b border-[#EEE7EA] px-5 py-4">
              <div>
                <p
                  className="text-[16px] font-semibold text-[#28171B]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Order Updates
                </p>
                <p className="text-sm text-[#72686C]">
                  Real-time alerts about your meal preparation and delivery.
                </p>
              </div>
              <div className="flex items-center gap-5 text-xs text-[#7A6F73]">
                <div className="flex items-center gap-2">
                  <Switch checked={false} className="data-[state=checked]:bg-[#4A0010]" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked className="data-[state=checked]:bg-[#25A35A]" />
                  <span>WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p
                  className="text-[16px] font-semibold text-[#28171B]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Promotional Offers
                </p>
                <p className="text-sm text-[#72686C]">
                  Stay updated with seasonal menus and exclusive Elite events.
                </p>
              </div>
              <div className="flex items-center gap-5 text-xs text-[#7A6F73]">
                <div className="flex items-center gap-2">
                  <Switch checked={false} className="data-[state=checked]:bg-[#4A0010]" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked className="data-[state=checked]:bg-[#25A35A]" />
                  <span>WhatsApp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2
          className="mb-4 text-[20px] font-bold leading-none text-[#341117]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Account Security
        </h2>
        <Card className="rounded-[24px] border border-[#E8E0E4] bg-white shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-4 rounded-[24px] bg-[#FBF9FA] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[24px] bg-[#F4ECEF]">
                  <FaLock className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p
                    className="text-[16px] font-semibold text-[#28171B]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Password
                  </p>
                  <p className="text-xs text-[#72686C]">Last updated 3 months ago</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-8 rounded-full border-[#E2D7DC] bg-white px-4 text-xs font-bold text-[#4A0010]"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[24px] bg-[#FBF9FA] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[24px] bg-[#F4ECEF]">
                  <FaLaptop className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p
                    className="text-[16px] font-semibold text-[#28171B]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Active Sessions
                  </p>
                  <p className="text-xs text-[#72686C]">2 active devices currently logged in</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-8 rounded-full border-[#E2D7DC] bg-white px-4 text-xs font-bold text-[#4A0010]"
              >
                Manage Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <AddressSelectionModal
        open={isAddressModalOpen}
        onOpenChange={handleModalClose}
        editAddress={editingAddress}
      />
    </div>
  );
}
