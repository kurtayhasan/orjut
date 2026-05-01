'use client';

import React, { useState } from 'react';
import ExpenseModal from './ExpenseModal';

export default function BottomBar() {
  const [modalCategory, setModalCategory] = useState<string | null>(null);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 sm:pb-6 z-[1000] lg:left-64 flex justify-center pointer-events-none">
        <div className="max-w-md w-full flex gap-1.5 sm:gap-3 bg-white/70 backdrop-blur-2xl border border-white/50 p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto ring-1 ring-black/5">
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
            onClick={() => setModalCategory('İşçilik')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-500 text-white py-2.5 rounded-[1.2rem] hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-200/50"
          >
            <span className="text-lg">🧑‍🌾</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">İşçi</span>
          </button>

          <button 
            onClick={() => setModalCategory('Diğer')}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-zinc-700 text-white py-2.5 rounded-[1.2rem] hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200/50"
          >
            <span className="text-lg">📦</span>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest truncate w-full px-1 text-center">Diğer</span>
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
