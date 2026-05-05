'use client';

import React, { useState, useEffect } from 'react';
import ExpenseModal from './ExpenseModal';
import { Plus, Wallet, Sprout, ClipboardCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BottomBar() {
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Handle Hardware Back Button to close menu or modal
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
        // Push state again to prevent actually going back
        window.history.pushState(null, '', window.location.href);
      } else if (modalCategory) {
        setModalCategory(null);
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (isMenuOpen || modalCategory) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMenuOpen, modalCategory]);

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 z-[2000] lg:left-64 flex flex-col items-center pointer-events-none px-4">
        {/* Quick Action Menu */}
        {isMenuOpen && (
          <div className="mb-6 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-auto">
            <button 
              onClick={() => { setModalCategory('Diğer'); setIsMenuOpen(false); }}
              className="flex items-center gap-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-6 py-4 rounded-2xl shadow-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all group min-w-[200px]"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Wallet size={20} />
              </div>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">Yeni Masraf</span>
            </button>
            
            <button 
              onClick={() => { router.push('/dashboard/operations'); setIsMenuOpen(false); }}
              className="flex items-center gap-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-6 py-4 rounded-2xl shadow-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all group min-w-[200px]"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Sprout size={20} />
              </div>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">Zirai İşlem</span>
            </button>

            <button 
              onClick={() => { router.push('/dashboard/scouting'); setIsMenuOpen(false); }}
              className="flex items-center gap-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-6 py-4 rounded-2xl shadow-2xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all group min-w-[200px]"
            >
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ClipboardCheck size={20} />
              </div>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">Arazi Gözlemi</span>
            </button>
          </div>
        )}

        {/* FAB Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-20 h-20 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto ring-8 ring-white/50 dark:ring-zinc-900/50 active:scale-90 ${isMenuOpen ? 'bg-zinc-900 dark:bg-white dark:text-zinc-900 rotate-45 shadow-indigo-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/40'}`}
        >
          {isMenuOpen ? <X size={32} /> : <Plus size={36} className="text-white" />}
        </button>
      </div>

      <ExpenseModal 
        isOpen={!!modalCategory} 
        onClose={() => setModalCategory(null)} 
        defaultCategory={modalCategory || ''} 
      />
    </>
  );
}
