"use client";

import { ProfileContent } from "@/components/customer/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1
          className="text-[26px] sm:text-[28px] md:text-[32px] font-extrabold uppercase text-primary"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          PROFILE
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base md:text-lg">
          Manage your personal information, addresses, and preferences
        </p>
      </div>

      {/* Profile Content */}
      <ProfileContent />
    </div>
  );
}
