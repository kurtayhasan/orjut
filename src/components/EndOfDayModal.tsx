'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Moon } from 'lucide-react';

export default function EndOfDayModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { dailySpent, dailyActions, totalSavings, isDemo } = useAppContext();
  const [closed, setClosed] = useState(false);

  if (!isOpen) return null;

  const handleCloseDay = async () => {
    try {
      if (!isDemo) {
        const userId = '00000000-0000-0000-0000-000000000000';
        await supabase.from('daily_summaries').upsert([
          {
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            total_spent: dailySpent,
            total_savings: totalSavings,
            actions_count: dailyActions
          }
        ], { onConflict: 'user_id, date' });
      }
    } catch (err) {
      console.error('Failed to write daily summary:', err);
    }
    setClosed(true);
  };

  const handleReset = () => {
    setClosed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 border border-transparent dark:border-zinc-800">

        {!closed ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100 dark:shadow-none">
                <Moon size={40} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">Bugünkü operasyonları tamamladınız mı?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-bold">Verilerinizi güvence altına alın ve analizleri başlatın.</p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 mb-8 space-y-2 text-center">
              <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Günün Özeti</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed">
                Bugün: <span className="font-black text-rose-600 dark:text-rose-400">₺{dailySpent.toLocaleString()}</span> Masraf<br/>
                Kazanç: <span className="font-black text-emerald-600 dark:text-emerald-400">₺{totalSavings.toLocaleString()}</span> Tasarruf
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCloseDay}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 uppercase tracking-widest text-xs"
              >
                Günü Onayla
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-zinc-500 dark:text-zinc-400 font-black bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
              >
                Henüz Değil
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Gün Kapatıldı!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-bold">Yarın görüşmek üzere.</p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-xs shadow-xl"
            >
              Tamam
            </button>
          </>
        )}

      </div>
    </div>
  );
}
