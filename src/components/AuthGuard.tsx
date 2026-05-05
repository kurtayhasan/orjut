'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get session from local cache first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          // If no session and we are online, strictly redirect
          if (navigator.onLine) {
            router.push('/login');
          } else {
            // If offline, check if we have a cached user_id as a fallback
            const userId = localStorage.getItem('user_id');
            if (!userId) {
              router.push('/login');
            } else {
              setIsAuthenticated(true);
            }
          }
        } else {
          // Valid session found
          localStorage.setItem('user_id', session.user.id);
          setIsAuthenticated(true);
          
          if (!navigator.onLine) {
            import('sonner').then(({ toast }) => {
              toast.info("Çevrimdışı Çalışıyorsunuz", {
                description: "Verileriniz bağlantı gelince eşitlenecektir.",
                duration: 5000,
              });
            });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only redirect if online, if offline we try to stay in
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
