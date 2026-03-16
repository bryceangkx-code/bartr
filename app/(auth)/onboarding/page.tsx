"use client";

import { Suspense } from "react";
import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingForm />
    </Suspense>
  );
}
