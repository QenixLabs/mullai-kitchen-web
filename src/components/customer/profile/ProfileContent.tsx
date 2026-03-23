"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaPencilAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaWhatsapp,
  FaSms,
  FaUtensils,
  FaChevronDown,
} from "react-icons/fa";
import { Marker } from "@react-google-maps/api";
import { useCurrentUser } from "@/hooks/useUserStore";
import { useUpdateProfile } from "@/api/hooks/useUpdateProfile";
import { useAddressList } from "@/api/hooks/useAddress";
import { useDeleteAddress } from "@/api/hooks/useDeleteAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoogleMap } from "./GoogleMap";
import { AddressSelectionModal } from "./AddressSelectionModal";
import type { Address } from "@/api/types/customer.types";

const DEFAULT_MAP_CENTER = { lat: 13.0827, lng: 80.2707 };

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;
type MealType = (typeof MEAL_OPTIONS)[number];

export function ProfileContent() {
  const router = useRouter();
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const { data: addresses, isLoading: isAddressesLoading } = useAddressList();
  const deleteAddress = useDeleteAddress();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [mealTypes, setMealTypes] = useState<Record<string, MealType>>({});
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dietary_preferences: user?.dietary_preferences || "",
  });

  const handleUpdateProfile = () => {
    updateProfile.mutate(
      {
        dietary_preferences: formData.dietary_preferences,
      },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
      },
    );
  };

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

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Top Row: User Info + Push Notifications */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* User Info Card */}
        <Card className="bg-white border-border/50 w-full xl:w-[703px] xl:h-[116px] shrink-0">
          <CardContent className="p-4 sm:p-5 h-full flex items-center">
            <div className="flex items-center gap-3 sm:gap-5 w-full">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-border shadow-md">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 p-1 rounded-full bg-foreground text-background shadow-md transition-transform group-hover:scale-110">
                  <FaCamera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </div>

              {/* Name + Member since */}
              <div className="min-w-0 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-2xl font-semibold tracking-tight text-foreground truncate">
                    {user?.name || "—"}
                  </span>
                  <button className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                    <FaPencilAlt className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                <p className="text-sm sm:text-[15px] font-normal text-muted-foreground mt-0.5">
                  Member since {memberSince}
                </p>
              </div>

              {/* Vertical divider - hidden on small screens */}
              <div className="hidden md:block w-px h-12 bg-[#797778] mx-2 shrink-0" />

              {/* Phone + Email */}
              <div className="hidden sm:flex flex-col gap-2 min-w-0">
                {/* Phone row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <FaPhone className="h-4 w-4 text-foreground shrink-0" />
                  <span className="text-base font-normal text-foreground">
                    {user?.phone || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success shrink-0">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Verified
                  </span>
                </div>
                {/* Email row */}
                <div className="flex items-center gap-2.5">
                  <FaEnvelope className="h-4 w-4 text-foreground shrink-0" />
                  {user?.email ? (
                    <a
                      href={`mailto:${user.email}`}
                      className="text-base font-normal text-foreground underline underline-offset-2 hover:text-primary transition-colors truncate"
                    >
                      {user.email}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Push Notification Card */}
        <Card className="bg-white border-border/50 w-full xl:w-[386px] xl:h-[116px] shrink-0">
          <CardContent className="p-4 sm:p-5 h-full flex flex-col justify-center">
            <h3 className="text-base sm:text-[20px] font-semibold text-[#44151C] mb-3">Push Notification</h3>
            {/* 2-column grid: WhatsApp | Email, then SMS below */}
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
              {/* WhatsApp */}
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                  <FaWhatsapp className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">WhatsApp</span>
                <Switch
                  checked={true}
                  className="ml-auto data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              {/* Email */}
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500 shrink-0">
                  <FaEnvelope className="h-3 w-3 text-white" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">Email</span>
                <Switch
                  checked={true}
                  className="ml-auto data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              {/* SMS */}
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 shrink-0">
                  <FaSms className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">SMS</span>
                <Switch
                  checked={false}
                  className="ml-auto data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Addresses Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#44151C]">Addresses</h2>
        <button
          className="flex items-center gap-1.5 text-[18px] font-semibold text-gray-900 hover:text-primary transition-colors font-sans"
          onClick={() => { setEditingAddress(undefined); setIsAddressModalOpen(true); }}
        >
          <span className="text-lg">+</span> Add New
        </button>
      </div>

      {/* Bottom Grid: Addresses (left) + Security/Help (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 lg:gap-6">
        {/* Left: Address Cards */}
        <div className="space-y-4">
          {isAddressesLoading ? (
            <div className="h-40 w-full animate-pulse bg-gray-100 rounded-xl" />
          ) : addresses && addresses.length > 0 ? (
            addresses.map((address) => {
              const mapCenter =
                address.lat && address.lng
                  ? { lat: address.lat, lng: address.lng }
                  : DEFAULT_MAP_CENTER;
              const label = address.is_default
                ? "Primary Delivery Address"
                : "Delivery Address";
              const selectedMeal = mealTypes[address._id] || "Breakfast";

              return (
                <Card
                  key={address._id}
                  className="bg-white border border-gray-200 shadow-sm overflow-hidden w-full max-w-[703px]"
                >
                  {/* Card Header Row - with Default on right */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-[#44151C]" />
                      <span className="text-base sm:text-lg font-semibold text-[#44151C]">{label}</span>
                    </div>
                    {/* Default indicator on right */}
                    <div className="flex items-center gap-2">
                      {address.is_default ? (
                        <>
                          <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500">
                            <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-gray-900">Default</span>
                        </>
                      ) : (
                        <>
                          <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-gray-400" />
                          <span className="text-sm sm:text-base font-semibold text-gray-500">Default</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Left: address text + buttons */}
                      <div className="flex-1">
                        <p className="text-sm sm:text-[15px] text-gray-600 leading-snug mb-2 sm:mb-3">
                          {address.full_address}, {address.area}, {address.city} - {address.pincode}
                        </p>

                        {/* Buttons: Edit and Delete in one row */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          {/* Edit - white bg with shadow */}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="flex items-center justify-center gap-2 w-[100px] sm:w-[115px] h-8 sm:h-9 rounded-lg bg-white border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <FaPencilAlt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Edit
                          </button>

                          {/* Delete - white bg with red text */}
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="flex items-center justify-center gap-2 w-[120px] sm:w-[141px] h-8 sm:h-9 rounded-lg bg-white border border-gray-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                          >
                            <FaTrash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Delete
                          </button>
                        </div>

                        {/* Meal dropdown - separate row */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center gap-2 w-[120px] sm:w-[141px] h-8 sm:h-9 rounded-lg bg-[#44151C] text-white text-sm font-bold hover:bg-[#5a1c28] transition-colors">
                              <FaUtensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>{selectedMeal}</span>
                              <FaChevronDown className="h-3 w-3 ml-1" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-32">
                            {MEAL_OPTIONS.map((meal) => (
                              <DropdownMenuItem
                                key={meal}
                                className={cn(
                                  "text-sm cursor-pointer",
                                  selectedMeal === meal && "text-[#44151C] font-semibold"
                                )}
                                onClick={() =>
                                  setMealTypes((prev) => ({ ...prev, [address._id]: meal }))
                                }
                              >
                                {meal}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Right: Google Map - hidden on small mobile */}
                      <div className="hidden sm:block shrink-0 w-full sm:w-[200px] md:w-[280px] h-[115px] rounded-lg overflow-hidden border border-gray-200">
                        <GoogleMap
                          center={mapCenter}
                          zoom={15}
                          height="h-full"
                          className="rounded-lg border-0"
                          onClick={() => {}}
                        >
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-gray-200 rounded-xl bg-white">
              <div className="p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FaExclamationCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Addresses Found</h3>
              <p className="text-sm text-gray-500 max-w-65 mt-1 mb-6">
                Add an address to start ordering delicious home-cooked meals.
              </p>
              <Button
                size="sm"
                className="font-bold px-8"
                onClick={() => { setEditingAddress(undefined); setIsAddressModalOpen(true); }}
              >
                Add Your First Address
              </Button>
            </div>
          )}
        </div>

        {/* Right: Security + Need Help */}
        <div className="space-y-3 sm:space-y-4">
          {/* Security Card */}
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden w-full xl:w-[386px] min-h-[129px]">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
              <FaShieldAlt className="h-4 w-4 text-[#44151C]" />
              <span className="text-base font-semibold text-[#44151C]">Security and privacy</span>
            </div>

            {/* Body */}
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#44151C]">Password</p>
                  <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                </div>
                <div className="flex flex-col items-end">
                  <button className="px-3 py-1.5 rounded-lg bg-[#44151C] text-white text-xs font-semibold hover:bg-[#5a1c28] transition-colors whitespace-nowrap">
                    Change Password
                  </button>
                  <button
                    onClick={() => router.push("/auth/forgot-password")}
                    className="mt-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-rose-100 via-rose-50 to-white p-5 w-full xl:w-[386px] min-h-[203px]">
            {/* Decorative wave */}
            <div className="absolute bottom-0 right-0 w-40 h-24 opacity-40">
              <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M200 150V50C150 50 150 100 100 100C50 100 50 50 0 50V150H200Z" fill="#FDA4AF"/>
                <path d="M200 150V80C160 80 160 120 120 120C80 120 80 80 40 80C40 80 40 110 0 110V150H200Z" fill="#FB7185"/>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-xl font-bold text-[#44151C] mb-2">Need help?</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-1">
                Our support team is available 24/7 to help you with your profile or orders.
              </p>
              <button className="px-6 py-2.5 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow self-center">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal (add + edit) */}
      <AddressSelectionModal
        open={isAddressModalOpen}
        onOpenChange={handleModalClose}
        editAddress={editingAddress}
      />
    </div>
  );
}
