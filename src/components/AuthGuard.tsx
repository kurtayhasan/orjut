'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase/client';

const clearAuthCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_role_override');
    localStorage.removeItem('pending_invite_engineer_id');
  }
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (navigator.onLine) {
          // 1. Get Supabase session (source of truth)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
          }

          if (!session) {
            // No session — clear stale cache and redirect
            clearAuthCache();
            router.push('/login');
            return;
          }

          // 2. Session is valid — sync user_id to localStorage
          const userId = session.user.id;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_id', userId);
          }

          // 3. Try to fetch profile for role sync (best-effort, not blocking)
          let cachedRole = localStorage.getItem('user_role') || 'farmer';
          try {
            const { data: profileData, error: profileErr } = await db.getProfile(userId);
            if (!profileErr && profileData) {
              if (profileData.role) {
                localStorage.setItem('user_role', profileData.role);
                cachedRole = profileData.role;
              }
            }
          } catch (profileFetchErr) {
            // Profile fetch failed (RLS, network, etc.) — still allow authenticated user through
            console.warn('Profile fetch failed in AuthGuard, using cached role:', profileFetchErr);
          }

          // 4. Auto-bind pending engineer invite if present
          const pendingInvite = localStorage.getItem('pending_invite_engineer_id');
          if (pendingInvite) {
            try {
              const { data: allRelations } = await (db as any).from('engineer_clients')
                .select('*')
                .eq('farmer_id', userId)
                .eq('status', 'approved');

              if (!allRelations || allRelations.length === 0) {
                await (db as any).from('engineer_clients').insert([{
                  engineer_id: pendingInvite,
                  farmer_id: userId,
                  status: 'approved'
                }]);
                import('sonner').then(({ toast }) => {
                  toast.success('Mühendisiniz başarıyla atandı.');
                });
              }
            } catch (err) {
              console.error('Auto bind failed:', err);
            } finally {
              localStorage.removeItem('pending_invite_engineer_id');
            }
          }

          // 5. Role-based access control
          const overrideRole = localStorage.getItem('user_role_override');
          let baseRole = cachedRole;
          if (overrideRole) {
            if (cachedRole === 'admin') {
              baseRole = overrideRole;
            } else if (cachedRole === 'engineer' && overrideRole !== 'admin') {
              baseRole = overrideRole;
            }
          }

          if (baseRole === 'farmer') {
            if (
              window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/engineer')
            ) {
              router.push('/dashboard');
              return;
            }
          }

          setIsAuthenticated(true);

        } else {
          // OFFLINE: Trust cached user_id and role
          const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
          if (!userId) {
            router.push('/login');
            return;
          }

          const cachedRole = localStorage.getItem('user_role') || 'farmer';
          const overrideRole = localStorage.getItem('user_role_override');
          let baseRole = cachedRole;
          if (overrideRole) {
            if (cachedRole === 'admin') {
              baseRole = overrideRole;
            } else if (cachedRole === 'engineer' && overrideRole !== 'admin') {
              baseRole = overrideRole;
            }
          }

          if (baseRole === 'farmer') {
            if (
              window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/engineer')
            ) {
              router.push('/dashboard');
              return;
            }
          }

          setIsAuthenticated(true);

          import('sonner').then(({ toast }) => {
            toast.info('Çevrimiçi Değilsiniz', {
              description: 'Verileriniz bağlantı gelince eşitlenecektir.',
              duration: 5000,
            });
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (navigator.onLine) {
          router.push('/login');
        } else {
          const userId = localStorage.getItem('user_id');
          if (userId) setIsAuthenticated(true);
          else router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleOnline = () => {
      import('sonner').then(({ toast }) => toast.success('Tekrar Çevrimiçisiniz!'));
    };
    const handleOffline = () => {
      import('sonner').then(({ toast }) => toast.info('Bağlantı Kesildi - Çevrimdışı Mod'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            Oturum Doğrulanıyor...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
