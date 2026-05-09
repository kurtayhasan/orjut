'use client';

import React from 'react';
import BaseModal from '../ui/BaseModal';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Receipt, Calendar, Tag, LandPlot } from 'lucide-react';

interface LandMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  land: any;
  transactions: Transaction[];
}

export default function LandMovementsModal({ isOpen, onClose, land, transactions }: LandMovementsModalProps) {
  if (!land) return null;

  const landTransactions = transactions
    .filter(t => t.land_id === land.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = landTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Arazi Hareketleri">
      <div className="space-y-6">
        {/* Land Info Header */}
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
              <LandPlot size={20} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 dark:text-zinc-100">{land.district || land.city}</h3>
              <p className="text-xs text-zinc-500 font-bold">Ada {land.block_no} / Parsel {land.parcel_no}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-rose-600">₺{totalSpent.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest text-right">Toplam Harcama</div>
          </div>
        </div>

        {/* Transactions Timeline */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {landTransactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-bold text-sm">
              Bu araziye ait henüz bir işlem kaydı bulunamadı.
            </div>
          ) : (
            landTransactions.map((tx) => (
              <div key={tx.id} className="relative pl-6 pb-6 border-l-2 border-zinc-100 dark:border-zinc-800 last:pb-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full"></div>
                
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white px-2 py-0.5 bg-zinc-800 dark:bg-zinc-700 rounded-md uppercase tracking-wider">
                        {tx.category || 'Diğer'}
                      </span>
                      <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(tx.date), 'dd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    <span className="font-black text-rose-600">₺{tx.amount.toLocaleString()}</span>
                  </div>
                  
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">{tx.description}</p>
                  
                  {tx.receipt_url && (
                    <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest">
                      <Receipt size={12} /> Makbuzu Görüntüle
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}
