'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle2, Moon } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import Button from './ui/Button';
import { ModalProps } from '@/types';

export default function EndOfDayModal({ isOpen, onClose }: ModalProps) {
  const { dailySpent, totalSavings, isDemo, currentUser } = useAppContext();
  const [closed, setClosed] = useState(false);

  const handleCloseDay = async () => {
    try {
      if (!isDemo && currentUser) {
        // Use central service layer if we had a daily_summaries helper, 
        // for now keeping it simple but using the centralized types/BaseModal
        // In a real Phase 3 I would add this to db.ts
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
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={!closed}>
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
            <Button onClick={handleCloseDay} className="w-full" size="lg">Günü Onayla</Button>
            <Button variant="outline" onClick={onClose} className="w-full" size="lg">Henüz Değil</Button>
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

          <Button variant="primary" onClick={handleReset} className="w-full !bg-zinc-900 dark:!bg-white dark:!text-zinc-900" size="lg">Tamam</Button>
        </>
      )}
    </BaseModal>
  );
}
