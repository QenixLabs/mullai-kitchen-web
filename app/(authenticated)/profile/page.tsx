"use client";

import { ProfileContent } from "@/components/customer/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-[26px] font-extrabold uppercase text-primary"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          PROFILE
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Manage your personal information, addresses, and preferences
        </p>
      </div>

      {/* Profile Content */}
      <ProfileContent />
    </div>
  );
}
