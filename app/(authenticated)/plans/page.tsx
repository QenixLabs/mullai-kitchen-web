"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { PlansContent } from "@/components/customer/plans/PlansContent";

function PlansPage() {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/signin?redirect=/plans");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="p-6 text-center">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <PlansContent
        showHero={false}
        showHowItWorks={false}
        showLocalFavorites={false}
        showBuildYourOwnBanner={true}
      />
    </Suspense>
  );
}

export default PlansPage;
