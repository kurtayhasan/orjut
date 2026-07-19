'use client';

import React, { useEffect } from 'react';
import { RevenueCatService } from '@/services/RevenueCatService';
import { useAppContext } from '@/context/AppContext';

export function RevenueCatInitProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAppContext();

  useEffect(() => {
    // Only init if we have the profile id or at least init anonymously if we don't.
    // If we want to login later, we can call RevenueCatService.logIn(userProfile.id)
    RevenueCatService.init();
    
    // If user is logged in, sync their ID with RevenueCat
    if (userProfile?.id) {
        RevenueCatService.logIn(userProfile.id);
    }
  }, [userProfile?.id]);

  return <>{children}</>;
}
