"use client";

import { useState } from "react";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useCurrentUser } from "@/hooks/use-user-store";
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
import { AddressSelectionModal } from "./AddressSelectionModal";

export function ProfileContent() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const { data: addresses, isLoading: isAddressesLoading } = useAddressList();
  const deleteAddress = useDeleteAddress();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
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
        // Note: Full name and phone updates might need a different API if they are restricted
      },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
      },
    );
  };

  const handleDeleteAddress = (id: string) => {
    deleteAddress.mutate(id);
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Basic Info */}
          <Card className="overflow-hidden border-border/50 bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-lg transform transition-transform group-hover:scale-110">
                    <FaCamera className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl font-black tracking-tight">
                    {user?.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Member since{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString(
                          undefined,
                          { month: "long", year: "numeric" },
                        )
                      : "N/A"}
                  </CardDescription>
                  {user?.status === "Active" && (
                  <Badge className="mt-2 bg-success/10 text-success hover:bg-success/20 border-none">
                    <FaCheckCircle className="h-3 w-3 mr-1" /> Premium Member
                  </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="h-11 bg-white border-border/50 focus:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="h-11 bg-white border-border/30 opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      value={formData.phone}
                      disabled
                      className="h-11 pl-4 bg-white border-border/30 opacity-70"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-success capitalize">
                      <FaCheckCircle className="h-4 w-4" /> Verified
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses Section Header */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <FaMapMarkerAlt className="h-5 w-5 fill-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Addresses
              </h2>
            </div>
            <button
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              onClick={() => setIsAddressModalOpen(true)}
            >
              + Add New
            </button>
          </div>

          {/* Addresses Card */}
          <Card className="border-none shadow-none bg-transparent p-0">
            <CardContent className="px-0 pt-0">
              {isAddressesLoading ? (
                <div className="h-40 w-full animate-pulse bg-muted rounded-3xl" />
              ) : addresses && addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.slice(0, 1).map((address) => (
                    <div
                      key={address._id}
                      className="relative flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 p-5 sm:p-8 rounded-3xl sm:rounded-[32px] border border-orange-100 bg-white"
                    >
                      <div className="flex items-start gap-6 flex-1">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFE7D9] text-[#FF5630] shrink-0">
                          <FaMapMarkerAlt className="h-6 w-6 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-bold text-lg text-foreground">
                              {address.type === "Home"
                                ? "Primary Delivery Address"
                                : "Office Address"}
                            </span>
                            {address.is_default && (
                              <Badge
                                variant="default"
                                className="text-[10px] h-5 px-2 bg-[#FF5630] text-white hover:bg-[#FF5630] border-none font-bold tracking-tight rounded-md"
                              >
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                          <p className="text-base text-muted-foreground leading-relaxed max-w-[400px]">
                            {address.full_address}, {address.area},{" "}
                            {address.city} - {address.pincode}
                          </p>
                          <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-6">
                            <button className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2 border-r pr-4 sm:pr-6 border-border">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-sm font-bold text-foreground hover:text-destructive transition-colors flex items-center gap-2"
                            >
                              <FaTrash className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Map Placeholder Illustration */}
                      <div className="hidden lg:block shrink-0 w-40 h-24 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              "radial-gradient(#637381 0.5px, transparent 0.5px)",
                            backgroundSize: "8px 8px",
                          }}
                        />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="relative">
                              <FaMapMarkerAlt className="h-6 w-6 text-primary fill-primary/20" />
                              <div className="absolute -top-1 -right-1 size-3 bg-blue-500 rounded-full border-2 border-white shadow-sm ring-4 ring-blue-500/10" />
                            </div>
                          </div>
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <div className="h-1.5 w-4 bg-muted rounded-full" />
                          <div className="h-1.5 w-1.5 bg-muted rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-border/50 rounded-[40px] bg-white">
                  <div className="p-5 rounded-full bg-white shadow-sm text-muted-foreground mb-4">
                    <FaExclamationCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    No Addresses Found
                  </h3>
                  <p className="text-muted-foreground max-w-[300px] mt-2 mb-8">
                    Add an address to start ordering delicious home-cooked
                    meals.
                  </p>
                  <Button
                    size="lg"
                    className="font-bold rounded-2xl px-10 shadow-lg shadow-primary/20"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Add Your First Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-border/50 bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FaShieldAlt className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Security & Privacy
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-background border border-border shadow-sm">
                    <FaShieldAlt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Password</p>
                    <p className="text-xs text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto font-bold rounded-xl h-10 px-6 border-border/50"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Preferences */}
        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-border/50">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-bold">Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Dietary Choices
                </Label>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        dietary_preferences: "Pure Vegetarian",
                      })
                    }
                  >
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                      Pure Vegetarian
                    </span>
                    <Checkbox
                      checked={
                        formData.dietary_preferences === "Pure Vegetarian"
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                      Gluten Free
                    </span>
                    <Checkbox />
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                      No Onions/Garlic
                    </span>
                    <Checkbox />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Push Notifications
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Email Updates
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaPhone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">SMS Alerts</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <FaPhone className="h-4 w-4" />
                      <span className="text-sm font-semibold text-foreground">
                        WhatsApp
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Center CTA */}
          <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-primary to-primaryDark text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <FaPhone className="h-24 w-24" />
          </div>
            <h3 className="text-xl font-black tracking-tight mb-2">
              Need help?
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {" "}
              Our support team is available 24/7 to help you with your profile
              or orders.
            </p>
            <Button
              variant="secondary"
              className="w-full font-bold bg-white text-primary hover:bg-white/95 rounded-xl h-11 border-none shadow-lg"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
      />
    </div>
  );
}
