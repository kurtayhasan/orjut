'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import EndOfDayModal from './EndOfDayModal';
import { Bell, Menu } from 'lucide-react';
import NetworkStatus from './NetworkStatus';

export default function Header() {
  const { lang, setLang, setIsSidebarOpen } = useAppContext();
  const [isEndModalOpen, setEndModalOpen] = useState(false);

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

          <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md ring-1 ring-zinc-100 cursor-pointer hover:scale-105 transition-all">
            AS
          </div>
        </div>
      </header>

      <EndOfDayModal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} />
    </>
  );
}
