'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, Wallet, Landmark } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';

export default function SeasonCompareCard({ season1, season2 }: { season1: any, season2: any }) {
  // Mock comparison logic, in a real scenario these metrics would come from aggregated backend data
  const s1Expenses = 125000;
  const s2Expenses = 110000;
  const diffExpenses = s1Expenses - s2Expenses;
  const isS1MoreExpensive = diffExpenses > 0;

  const s1Profit = 1345000;
  const s2Profit = 950000;
  const diffProfit = s1Profit - s2Profit;
  const isS1MoreProfitable = diffProfit > 0;

  return (
    <Card padding="none" className="bg-white/[0.02] backdrop-blur-xl border-white/5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        
        {/* Season 1 */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-zinc-100 tracking-tight">{season1.name}</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">SEÇİLİ SEZON</p>
            </div>
            <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
               <Target size={20} />
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <Wallet size={14} className="text-danger" />
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TOPLAM HARCAMA</p>
              </div>
              <div className="text-2xl font-black text-zinc-100">{formatCurrency(s1Expenses)}</div>
            </div>
            
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={14} className="text-success" />
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TAHMİNİ KÂR</p>
              </div>
              <div className="text-2xl font-black text-zinc-100">{formatCurrency(s1Profit)}</div>
            </div>
          </div>
        </div>
  
        {/* Season 2 */}
        <div className="p-6 space-y-6 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl text-zinc-100 tracking-tight">{season2.name}</h3>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">ÖNCEKİ SEZON</p>
            </div>
            <div className="bg-white/5 p-2 rounded-xl text-text-muted border border-white/10">
               <Landmark size={20} />
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <Wallet size={14} className="text-zinc-500" />
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TOPLAM HARCAMA</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-300">{formatCurrency(s2Expenses)}</div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border",
                  isS1MoreExpensive ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'
                )}>
                  {isS1MoreExpensive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs((diffExpenses / s2Expenses) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={14} className="text-zinc-500" />
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TAHMİNİ KÂR</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-300">{formatCurrency(s2Profit)}</div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border",
                  isS1MoreProfitable ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
                )}>
                  {isS1MoreProfitable ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs((diffProfit / s2Profit) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </Card>
  );
}
