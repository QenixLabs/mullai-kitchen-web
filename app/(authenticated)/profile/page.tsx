"use client";

import { Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileContent } from "@/components/customer/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-sm bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
              Account
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
            Profile Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your personal information, saved addresses, and dining preferences.
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Save className="h-5 w-5" />
          Save Changes
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent -z-10 h-64 pointer-events-none" />

        {/* Profile Content */}
        <ProfileContent />
      </div>
    </div>
  );
}
