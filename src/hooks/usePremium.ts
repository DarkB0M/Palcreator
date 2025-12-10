"use client";

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

interface PremiumStatus {
  isPremium: boolean;
  status: string | null;
  currentPeriodEnd: number | null;
  plan: string | null;
}

export function usePremium() {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    status: null,
    currentPeriodEnd: null,
    plan: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPremium() {
      const user = auth.currentUser;
      if (!user) {
        setPremiumStatus({
          isPremium: false,
          status: null,
          currentPeriodEnd: null,
          plan: null,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid }),
        });

        const data = await response.json();
        setPremiumStatus({
          isPremium: data.isPremium === true,
          status: data.status || null,
          currentPeriodEnd: data.currentPeriodEnd || null,
          plan: data.plan || null,
        });
      } catch (error) {
        console.error('Error checking premium:', error);
        setPremiumStatus({
          isPremium: false,
          status: null,
          currentPeriodEnd: null,
          plan: null,
        });
      } finally {
        setLoading(false);
      }
    }

    checkPremium();

    // Revalidar quando o usuário mudar
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkPremium();
    });

    return unsubscribe;
  }, []);

  return { ...premiumStatus, loading };
}

