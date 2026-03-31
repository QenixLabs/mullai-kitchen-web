import type { Metadata } from "next";

import { EditProfileContent } from "@/components/customer/profile/EditProfileContent";

export const metadata: Metadata = {
  title: "Edit Profile | Mullai Kitchen",
  description: "Edit your profile details and contact information",
};

export default function EditProfilePage() {
  return <EditProfileContent />;
}
