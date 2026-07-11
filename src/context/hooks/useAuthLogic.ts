import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { Profile } from '@/types';

export function useAuthLogic() {
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'editor' | 'viewer'>('owner');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<'farmer' | 'engineer' | 'admin'>('farmer');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const activeOrgId = useMemo(() => {
    if (isAuthLoading || isLoadingProfile || !userProfile) return null;
    const myId = userProfile.id;
    if (!myId || myId === '00000000-0000-0000-0000-000000000000') return null;
    if (userRole === 'engineer' && selectedClientId) return selectedClientId;
    return myId;
  }, [userRole, selectedClientId, userProfile, isAuthLoading, isLoadingProfile]);

  const isPremium = userProfile?.is_premium === true;
  const isDemo = false; // Add if you use demo logic

  const lastProfileRefreshRef = useRef<number>(0);

  const refreshProfile = useCallback(async (force = false) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId) {
      setIsLoadingProfile(false);
      return;
    }

    const now = Date.now();
    if (!force && now - lastProfileRefreshRef.current < 30000) {
      return;
    }
    lastProfileRefreshRef.current = now;

    setIsLoadingProfile(true);
    try {
      const { data, error } = await db.getProfile(userId);
      if (error) throw error;
      if (data) {
        setUserProfile(data);
        const actualRole = data.role || 'farmer';
        const overrideRole = typeof window !== 'undefined' ? localStorage.getItem('user_role_override') : null;
        let finalRole = actualRole;
        if (overrideRole) {
          if (actualRole === 'admin') {
            finalRole = overrideRole;
          } else if (actualRole === 'engineer' && overrideRole !== 'admin') {
            finalRole = overrideRole;
          }
        }
        setUserRole(finalRole as 'farmer' | 'engineer' | 'admin');
        
        if (finalRole === 'farmer' && typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/engineer'))) {
          window.location.href = '/dashboard';
        }
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthSession(session);
        if (session?.user?.id) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_id', session.user.id);
          }
          await refreshProfile(true);
        } else {
          setIsLoadingProfile(false);
        }
      } catch (err) {
        setIsLoadingProfile(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkInitialSession();

    const { data: { subscription } } = db.onAuthStateChange(async (event, session) => {
      setAuthSession(session);
      const cachedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (session?.user?.id || cachedUserId) {
        await refreshProfile(true);
      } else {
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
      setIsAuthLoading(false);
    });

    let visibilityTimeout: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null)) {
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => {
          refreshProfile();
        }, 300);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const pollInterval = setInterval(() => {
      if (typeof window !== 'undefined' && localStorage.getItem('user_id')) {
        refreshProfile();
      }
    }, 300000);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(visibilityTimeout);
      clearInterval(pollInterval);
    };
  }, [refreshProfile]);

  useEffect(() => {
    const checkCacheSync = () => {
      const cachedId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (cachedId && userProfile && cachedId !== userProfile.id) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.reload();
        }
      }
    };
    checkCacheSync();
  }, [userProfile]);

  return {
    currentUserRole, setCurrentUserRole,
    isLoadingProfile, setIsLoadingProfile,
    userProfile, setUserProfile,
    userRole, setUserRole,
    selectedClientId, setSelectedClientId,
    authSession, setAuthSession,
    isAuthLoading, setIsAuthLoading,
    activeOrgId, isPremium, isDemo,
    refreshProfile
  };
}
