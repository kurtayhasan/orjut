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
      <header className="bg-white border-b border-zinc-200 p-4 px-4 md:px-8 flex justify-between items-center z-10 shrink-0 h-16">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg md:hidden transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="font-bold text-indigo-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center sm:hidden">
              <span className="text-white text-xs">O</span>
            </div>
            <span className="hidden sm:block">Orjut Command Center</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <NetworkStatus />
          </div>
          
          <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          <button 
            onClick={() => setEndModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-zinc-200 active:scale-95"
          >
            <span>🌙 <span className="hidden md:inline">Günü Kapat</span></span>
          </button>

          <div className="hidden lg:flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button 
              onClick={() => setLang('tr')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'tr' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              TR
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              EN
            </button>
          </div>

          {/* Profil Avatarı + Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md ring-1 ring-zinc-100 cursor-pointer hover:scale-105 transition-all"
            >
              {initials}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-zinc-100">
                  <p className="font-bold text-sm text-zinc-900">{userName || 'Kullanıcı'}</p>
                  <p className="text-xs text-zinc-500">Çiftçi Hesabı</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Settings size={16} className="text-zinc-400" />
                  Ayarlar
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
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
