'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import EndOfDayModal from './EndOfDayModal';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import NetworkStatus from './NetworkStatus';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Header() {
  const { lang, setLang, setIsSidebarOpen } = useAppContext();
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem('user_name') || '';
    setUserName(name);
  }, []);

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    toast.success("Başarıyla çıkış yapıldı.");
    router.push('/');
  };

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 px-4 md:px-8 flex justify-between items-center z-10 shrink-0 h-16 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl md:hidden transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>
          <div className="font-bold text-indigo-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center sm:hidden shadow-lg shadow-indigo-500/20">
              <span className="text-white text-xs font-black">O</span>
            </div>
            <span className="hidden sm:block dark:text-zinc-100 font-black tracking-tight text-lg">ZiraiAsistan</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <NetworkStatus />
          </div>
          
          <button className="relative p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
          </button>
          
          <button 
            onClick={() => setEndModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xl shadow-zinc-200 dark:shadow-none active:scale-95 uppercase tracking-widest"
          >
            <span>🌙 <span className="hidden md:inline">Günü Kapat</span></span>
          </button>

          <div className="hidden lg:flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => setLang('tr')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'tr' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              TR
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              EN
            </button>
          </div>

          {/* Profil Avatarı + Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black border-2 border-white dark:border-zinc-800 shadow-xl shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-all active:scale-95"
            >
              {initials}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-14 w-60 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">{userName || 'Kullanıcı'}</p>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Çiftçi Hesabı</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <Settings size={16} className="text-zinc-400 dark:text-zinc-500" />
                    Ayarlar
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <EndOfDayModal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} />
    </>
  );
}
