'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

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
        // Check if a valid Supabase auth session exists first (when online)
        if (navigator.onLine) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            clearAuthCache();
            router.push('/login');
            return;
          }
        }

        const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

        if (!userId) {
          router.push('/login');
          return;
        }

        // Online: verify user still exists in DB
        if (navigator.onLine) {
          const { data, error } = await db.getProfile(userId);
          if (error || !data) {
            // Invalid user_id — clear and redirect
            clearAuthCache();
            router.push('/login');
            return;
          }
          // Sync role from DB to localStorage for freshness
          if (data.role) {
            localStorage.setItem('user_role', data.role);
          }
          
          // Auto-bind pending engineer invite if present
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
              console.error("Auto bind failed:", err);
            } finally {
              localStorage.removeItem('pending_invite_engineer_id');
            }
          }
          const overrideRole = localStorage.getItem('user_role_override');
          const baseRole = overrideRole || data.role || 'farmer';
          if (baseRole === 'admin' || baseRole === 'engineer') {
            // privileged users can stay on any page
            setIsAuthenticated(true);
          } else {
            // farmer – prevent access to admin/engineer URLs
            if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/engineer')) {
              router.push('/dashboard');
              return;
            }
            setIsAuthenticated(true);
          }
        } else {
          // Offline: trust cached user_id and roles
          const overrideRole = localStorage.getItem('user_role_override');
          const baseRole = overrideRole || localStorage.getItem('user_role') || 'farmer';
          if (baseRole === 'admin' || baseRole === 'engineer') {
            setIsAuthenticated(true);
          } else {
            if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/engineer')) {
              router.push('/dashboard');
              return;
            }
            setIsAuthenticated(true);
          }
          
          import('sonner').then(({ toast }) => {
            toast.info("Çevrimiçi Değilsiniz", {
              description: "Verileriniz bağlantı gelince eşitlenecektir.",
              duration: 5000,
            });
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
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

    // Listen for online/offline events
    const handleOnline = () => {
      import('sonner').then(({ toast }) => toast.success("Tekrar Çevrimiçisiniz!"));
    };
    const handleOffline = () => {
      import('sonner').then(({ toast }) => toast.info("Bağlantı Kesildi - Çevrimdışı Mod"));
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
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
