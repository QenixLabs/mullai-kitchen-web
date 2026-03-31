"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EditProfileContent() {
  const router = useRouter();
  const user = useCurrentUser();

  const initialNames = useMemo(() => {
    const full = (user?.name || "").trim();
    if (!full) return { first: "", last: "" };
    const parts = full.split(/\s+/);
    return {
      first: parts[0] || "",
      last: parts.slice(1).join(" ") || "",
    };
  }, [user?.name]);

  const [firstName, setFirstName] = useState(initialNames.first);
  const [lastName, setLastName] = useState(initialNames.last);
  const [email] = useState(user?.email || "");
  const [phone] = useState(user?.phone || "");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleDiscard = () => {
    setFirstName(initialNames.first);
    setLastName(initialNames.last);
    router.back();
  };

  const handleSave = () => {
    toast.success("Profile changes saved");
    router.push("/profile");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-extrabold uppercase leading-none text-primary" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            EDIT PROFILE
          </h1>
          <p className="mt-2 text-lg text-[#6E6468]">
            Manage your personal information, addresses, and preferences
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-full px-3 py-1.5 text-[16px] font-semibold text-[#4A1A24] transition-colors hover:bg-[#EEE8EA]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          -&gt; back
        </button>
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-[#E8E0E4] bg-white shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <Avatar className="h-40 w-40 ring-2 ring-[#E7E0E4] shadow-sm">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#4A0010] text-white shadow-md"
                  aria-label="Upload profile picture"
                >
                  <FaCamera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-7">
              <section>
                <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8B8185]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold text-[#5E5357]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      First Name
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 rounded-[24px] border-[#ECE4E8] bg-[#F5F1F3] text-[32px] font-semibold text-[#2C1B20]"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold text-[#5E5357]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      Last Name
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 rounded-[24px] border-[#ECE4E8] bg-[#F5F1F3] text-[32px] font-semibold text-[#2C1B20]"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8B8185]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  Contact Details
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold text-[#5E5357]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      Email Address
                    </label>
                    <div className="flex h-12 items-center justify-between rounded-[24px] border border-[#ECE4E8] bg-[#F5F1F3] px-4">
                      <span className="text-[16px] font-medium text-[#2C1B20]">{email || "-"}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF5E7] px-2 py-0.5 text-[11px] font-bold text-[#0F9D45]">
                        <FaCheckCircle className="h-3 w-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold text-[#5E5357]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      Phone Number
                    </label>
                    <div className="flex h-12 items-center justify-between rounded-[24px] border border-[#ECE4E8] bg-[#F5F1F3] px-4">
                      <span className="text-[16px] font-medium text-[#2C1B20]">{phone || "-"}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF5E7] px-2 py-0.5 text-[11px] font-bold text-[#0F9D45]">
                        <FaCheckCircle className="h-3 w-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 flex items-center justify-end gap-8">
        <button
          type="button"
          onClick={handleDiscard}
          className="text-[14px] font-bold text-[#5E5357] hover:text-[#3A2F33]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Discard Changes
        </button>
        <Button
          onClick={handleSave}
          className="h-14 rounded-full bg-[#4A0010] px-14 text-[18px] font-bold text-white hover:bg-[#35000B]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
