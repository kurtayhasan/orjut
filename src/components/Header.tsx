'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import EndOfDayModal from './EndOfDayModal';
import { Bell, Menu, LogOut, User, Settings, ArrowLeft } from 'lucide-react';
import NetworkStatus from './NetworkStatus';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Header() {
  const { setIsSidebarOpen, userProfile, userRole } = useAppContext();
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle outside click for profile dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isSubPage = pathname !== '/dashboard' && pathname.split('/').length > 2;

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
      localStorage.clear();
      toast.success("Başarıyla çıkış yapıldı.");
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = '/';
    }
  };

  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Çiftçi';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Get current page title for mobile
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Ana Sayfa';
    if (pathname.includes('/lands')) return 'Arazilerim';
    if (pathname.includes('/finance')) return 'Finans';
    if (pathname.includes('/inventory')) return 'Stok Yönetimi';
    if (pathname.includes('/operations')) return 'Zirai İşlemler';
    if (pathname.includes('/scouting')) return 'Arazi Gözlemi';
    if (pathname.includes('/irrigation')) return 'Sulama Takibi';
    if (pathname.includes('/seasons')) return 'Sezonlar';
    if (pathname.includes('/ai')) return 'AI Asistan';
    if (pathname.includes('/settings')) return 'Ayarlar';
    return 'Orjut';
  };

  return (
    <>
      <header className="h-[60px] md:h-[72px] bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-[var(--z-sticky)]">
        {/* LEFT: BACK BUTTON OR GREETING */}
        <div className="flex items-center gap-3">
          {isSubPage ? (
            <button 
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-md transition-colors"
              aria-label="Geri Dön"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-md lg:hidden transition-colors"
              aria-label="Menüyü Aç"
            >
              <Menu size={24} />
            </button>
          )}
          
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-text-primary font-heading">
              {isSubPage ? getPageTitle() : `Merhaba, ${userProfile?.first_name || 'Çiftçi'} 👋`}
            </h1>
          </div>
        </div>

        {/* MIDDLE: MOBILE TITLE */}
        <div className="md:hidden">
          <h2 className="text-base font-bold text-text-primary font-heading truncate max-w-[150px]">
            {getPageTitle()}
          </h2>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
             <NetworkStatus />
          </div>

          {/* Notifications */}
          <button className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface"></span>
          </button>

          {/* Günü Kapat */}
          <button 
            onClick={() => setEndModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-surface-2 border border-border text-text-primary hover:bg-surface-3 px-4 py-2 rounded-md text-xs font-bold transition-all active:scale-95"
          >
            <span>🌙 Günü Kapat</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-surface shadow-md hover:scale-105 transition-all active:scale-95"
            >
              {initials}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface rounded-lg shadow-xl border border-border py-2 z-[var(--z-dropdown)] animate-scale-in">
                <div className="px-4 py-3 border-b border-border mb-1">
                  <p className="font-bold text-sm text-text-primary truncate">{userName}</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                    {userRole === 'admin' ? 'Yönetici' : userRole === 'engineer' ? 'Mühendis' : 'Çiftçi'}
                  </p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-secondary hover:text-primary hover:bg-primary-50 transition-colors"
                >
                  <Settings size={18} />
                  Ayarlar
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger-bg transition-colors"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <EndOfDayModal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} />
    </>
  );
}
