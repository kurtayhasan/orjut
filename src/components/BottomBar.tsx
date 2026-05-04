'use client';

import React, { useState } from 'react';
import ExpenseModal from './ExpenseModal';
import { Plus, Wallet, Sprout, ClipboardCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BottomBar() {
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-[2000] lg:left-64 flex flex-col items-center pointer-events-none">
        {/* Quick Action Menu */}
        {isMenuOpen && (
          <div className="mb-4 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-auto">
            <button 
              onClick={() => { setModalCategory('Diğer'); setIsMenuOpen(false); }}
              className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3 rounded-2xl shadow-xl hover:bg-zinc-50 transition-all group"
            >
              <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Wallet size={18} />
              </div>
              <span className="text-sm font-black text-zinc-700">Yeni Masraf</span>
            </button>
            
            <button 
              onClick={() => { router.push('/dashboard/operations'); setIsMenuOpen(false); }}
              className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3 rounded-2xl shadow-xl hover:bg-zinc-50 transition-all group"
            >
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Sprout size={18} />
              </div>
              <span className="text-sm font-black text-zinc-700">Zirai İşlem</span>
            </button>

            <button 
              onClick={() => { router.push('/dashboard/scouting'); setIsMenuOpen(false); }}
              className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3 rounded-2xl shadow-xl hover:bg-zinc-50 transition-all group"
            >
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ClipboardCheck size={18} />
              </div>
              <span className="text-sm font-black text-zinc-700">Arazi Gözlemi</span>
            </button>
          </div>
        )}

        {/* FAB Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto ring-4 ring-white active:scale-90 ${isMenuOpen ? 'bg-zinc-900 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isMenuOpen ? <X size={28} className="text-white" /> : <Plus size={32} className="text-white" />}
        </button>

        {/* Existing Quick Categories (Optional: Hidden or Reduced) */}
        <div className="mt-4 max-w-md w-full flex gap-1.5 sm:gap-3 bg-white/70 backdrop-blur-2xl border border-white/50 p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto ring-1 ring-black/5 opacity-50 hover:opacity-100 transition-opacity hidden sm:flex">
          <button 
            onClick={() => setModalCategory('Mazot')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-amber-500 text-white py-2.5 rounded-[1.2rem] hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200/50"
          >
            <span className="text-lg">⛽</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">Mazot</span>
          </button>
          
          <button 
            onClick={() => setModalCategory('Gübre')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-emerald-500 text-white py-2.5 rounded-[1.2rem] hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200/50"
          >
            <span className="text-lg">🌱</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">Gübre</span>
          </button>

          <button 
            onClick={() => setModalCategory('İlaç')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-teal-500 text-white py-2.5 rounded-[1.2rem] hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-teal-200/50"
          >
            <span className="text-lg">🧪</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">İlaç</span>
          </button>

          <button 
            onClick={() => setModalCategory('Tohum')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-rose-500 text-white py-2.5 rounded-[1.2rem] hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-200/50"
          >
            <span className="text-lg">🌾</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">Tohum</span>
          </button>
        </div>
      </div>

      <ExpenseModal 
        isOpen={!!modalCategory} 
        onClose={() => setModalCategory(null)} 
        defaultCategory={modalCategory || ''} 
      />
    </>
  );
}
