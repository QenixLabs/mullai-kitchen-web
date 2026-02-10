"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";

import { useOnboarding } from "@/api/hooks/useOnboarding";
import type { SubmitOnboardingResponse } from "@/api/hooks/useOnboarding";
import type { UpdateProfileDto } from "@/api/types/customer.types";
import { AddressFormStep } from "@/components/customer/onboarding/AddressFormStep";
import { OnboardingComplete } from "@/components/customer/onboarding/OnboardingComplete";
import { OnboardingShell } from "@/components/customer/onboarding/OnboardingShell";
import { ProfileDetailsStep } from "@/components/customer/onboarding/ProfileDetailsStep";
import { WelcomeStep } from "@/components/customer/onboarding/WelcomeStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthHydrated, useCurrentUser, useIsAuthenticated } from "@/hooks/use-user-store";
import { useUserStore } from "@/providers/user-store-provider";
import { createOnboardingStore } from "@/stores/onboarding-store";
import { createPlanIntentStore } from "@/stores/plan-intent-store";

const PHONE_PATTERN = /^\+?[0-9\s-]{10,15}$/;

const hasProfileData = (profile: UpdateProfileDto | null): profile is UpdateProfileDto => {
  if (!profile) {
    return false;
  }

  return Object.values(profile).some((value) => typeof value === "string" && value.trim().length > 0);
};

const isValidProfilePayload = (profile: UpdateProfileDto | null): boolean => {
  if (!profile?.emergency_contact_phone) {
    return true;
  }

  return PHONE_PATTERN.test(profile.emergency_contact_phone.trim());
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to complete onboarding. Please try again.";
};

export default function OnboardingPage() {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const setUser = useUserStore((store) => store.setUser);

  const [onboardingStore] = useState(() => createOnboardingStore());
  const [planIntentStore] = useState(() => createPlanIntentStore());

  const currentStep = useStore(onboardingStore, (store) => store.currentStep);
  const addresses = useStore(onboardingStore, (store) => store.addresses);
  const defaultAddressIndex = useStore(onboardingStore, (store) => store.defaultAddressIndex);
  const profileDetails = useStore(onboardingStore, (store) => store.profileDetails);
  const nextStep = useStore(onboardingStore, (store) => store.nextStep);
  const prevStep = useStore(onboardingStore, (store) => store.prevStep);
  const addAddress = useStore(onboardingStore, (store) => store.addAddress);
  const removeAddress = useStore(onboardingStore, (store) => store.removeAddress);
  const setDefaultAddress = useStore(onboardingStore, (store) => store.setDefaultAddress);
  const setProfileDetails = useStore(onboardingStore, (store) => store.setProfileDetails);
  const resetOnboarding = useStore(onboardingStore, (store) => store.reset);
  const planIntentId = useStore(planIntentStore, (store) => store.planId);

  const { submitOnboarding } = useOnboarding();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completionSummary, setCompletionSummary] = useState<{
    addressesCount: number;
    hasProfileDetails: boolean;
  } | null>(null);

  const hasPlanIntent = Boolean(planIntentId);
  const isCompleted = completionSummary !== null;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/signin?redirect=/onboarding");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !user) {
      return;
    }

    if (user.onboarding_completed) {
      router.replace("/checkout");
    }
  }, [hasHydrated, router, user]);

  const handleRedirectAfterCompletion = () => {
    router.replace(hasPlanIntent ? "/checkout" : "/plans");
  };

  const submitFlow = async (profileOverride?: UpdateProfileDto | null) => {
    if (addresses.length === 0) {
      setErrorMessage("Please add at least one address to continue.");
      return;
    }

    const profileToSubmit = profileOverride ?? profileDetails;
    if (!isValidProfilePayload(profileToSubmit)) {
      setErrorMessage("Please enter a valid emergency contact phone number or clear the field.");
      return;
    }

    setErrorMessage(null);

    const payloadProfile = hasProfileData(profileToSubmit) ? profileToSubmit : undefined;

    try {
      const result: SubmitOnboardingResponse = await submitOnboarding.mutateAsync({
        addresses,
        profile: payloadProfile,
      });

      const mergedUser = result.user ?? user;
      if (mergedUser) {
        setUser({
          ...mergedUser,
          onboarding_completed: true,
        });
      }

      setCompletionSummary({
        addressesCount: addresses.length,
        hasProfileDetails: Boolean(payloadProfile),
      });

      resetOnboarding();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleNext = async () => {
    setErrorMessage(null);

    if (currentStep === 0) {
      nextStep();
      return;
    }

    if (currentStep === 1) {
      if (addresses.length === 0) {
        setErrorMessage("Please add at least one address to continue.");
        return;
      }
      nextStep();
      return;
    }

    if (currentStep === 2) {
      await submitFlow();
    }
  };

  const canProceed = useMemo(() => {
    return !isCompleted;
  }, [isCompleted]);

  if (!hasHydrated) {
    return <div className="p-6 text-sm text-slate-600">Preparing your onboarding session...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-sm text-slate-600">Redirecting to sign in...</div>;
  }

  if (user?.onboarding_completed) {
    return <div className="p-6 text-sm text-slate-600">Redirecting to checkout...</div>;
  }

  return (
    <OnboardingShell
      currentStep={isCompleted ? 3 : currentStep}
      totalSteps={4}
      onBack={prevStep}
      onNext={() => {
        void handleNext();
      }}
      onSkip={() => {
        void submitFlow(null);
      }}
      canProceed={canProceed}
      isNavigating={submitOnboarding.isPending}
      showBackButton={!isCompleted}
      showNextButton={!isCompleted}
      showSkipButton={!isCompleted && currentStep === 2}
      nextLabel={currentStep === 2 ? "Complete onboarding" : "Next"}
    >
      {errorMessage ? (
        <Alert variant="destructive" className="mb-5 border-red-200 bg-red-50 text-red-800">
          <AlertTitle>Onboarding could not be completed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isCompleted && completionSummary ? (
        <OnboardingComplete
          addressesCount={completionSummary.addressesCount}
          hasProfileDetails={completionSummary.hasProfileDetails}
          onRedirect={handleRedirectAfterCompletion}
        />
      ) : null}

      {!isCompleted && currentStep === 0 ? (
        <WelcomeStep
          onGetStarted={() => {
            nextStep();
          }}
        />
      ) : null}

      {!isCompleted && currentStep === 1 ? (
        <AddressFormStep
          addresses={addresses}
          defaultAddressIndex={defaultAddressIndex}
          onAddAddress={addAddress}
          onRemoveAddress={removeAddress}
          onSetDefault={setDefaultAddress}
        />
      ) : null}

      {!isCompleted && currentStep === 2 ? (
        <ProfileDetailsStep value={profileDetails} onChange={setProfileDetails} />
      ) : null}
    </OnboardingShell>
  );
}
