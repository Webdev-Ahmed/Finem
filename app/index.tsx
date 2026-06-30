import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getSetting } from '@/db/queries/settings';

export default function Index() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    getSetting('onboarding_done')
      .then((val) => setOnboardingDone(val === 'true'))
      .catch(() => setOnboardingDone(false));
  }, []);

  if (onboardingDone === null) return null;

  return onboardingDone
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(onboarding)/step-1" />;
}
