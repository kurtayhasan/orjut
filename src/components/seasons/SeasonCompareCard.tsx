import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
        
        {/* Season 1 */}
        <div className="space-y-6 pb-6 md:pb-0">
          <div>
            <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">{season1.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1">Seçili Sezon</p>
          </div>
 
          <div className="space-y-4">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
              <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1">Toplam Harcama</p>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-500">₺{s1Expenses.toLocaleString()}</div>
            </div>
            
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
              <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Tahmini Kâr</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500">₺{s1Profit.toLocaleString()}</div>
            </div>
          </div>
        </div>
 
        {/* Season 2 */}
        <div className="md:pl-8 pt-6 md:pt-0 space-y-6">
          <div>
            <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">{season2.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1">Önceki Sezon</p>
          </div>
 
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl">
              <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Toplam Harcama</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300">₺{s2Expenses.toLocaleString()}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isS1MoreExpensive ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                  {isS1MoreExpensive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs((diffExpenses / s2Expenses) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl">
              <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Tahmini Kâr</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300">₺{s2Profit.toLocaleString()}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isS1MoreProfitable ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                  {isS1MoreProfitable ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs((diffProfit / s2Profit) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
 
      </div>
    </div>
  );
}
