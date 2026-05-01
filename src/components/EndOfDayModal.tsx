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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">

        {!closed ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Moon size={32} />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Bugünkü operasyonları tamamladınız mı?</h3>
              <p className="text-sm text-zinc-500 mt-2">Gününüzü kapatarak verilerinizi güvence altına alın ve alışkanlığınızı sürdürün.</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mb-6 space-y-4 text-center">
              <p className="text-sm text-zinc-600 font-medium">
                Bugün: <span className="font-bold text-rose-600">{dailySpent.toLocaleString()} ₺</span> Masraf Girildi.<br/>
                Orjut sayesinde <span className="font-bold text-emerald-600">{totalSavings.toLocaleString()} ₺</span> zarar önlendi.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCloseDay}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Günü Onayla
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-zinc-600 font-bold bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Henüz Değil
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-zinc-900">Gün Başarıyla Kapatıldı!</h3>
              <p className="text-sm text-zinc-500 mt-2">Yarın görüşmek üzere.</p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Tamam
            </button>
          </>
        )}

      </div>
    </div>
  );
}
