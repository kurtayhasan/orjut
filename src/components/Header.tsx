'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import EndOfDayModal from './EndOfDayModal';
import { Bell, Menu, User, Settings, ArrowLeft } from 'lucide-react';
import NetworkStatus from './NetworkStatus';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Header() {
  const { setIsSidebarOpen, userProfile, userRole } = useAppContext();
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();



  const isSubPage = pathname !== '/dashboard' && pathname.split('/').length > 2;

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
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
    return 'ZiraiAsistan';
  };

  return (
    <>
      <header className="h-[60px] md:h-[72px] bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
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

          {/* Profile Link */}
          <Link
            href="/dashboard/settings"
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-surface shadow-md hover:scale-105 transition-all active:scale-95"
            aria-label="Profil ve Ayarlar"
          >
            {initials}
          </Link>
        </div>
      </header>

      <EndOfDayModal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} />
    </>
  );
}
