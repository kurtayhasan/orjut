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
    <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-8 divide-x divide-zinc-100">
        
        {/* Season 1 */}
        <div className="space-y-6">
          <div>
            <h3 className="font-black text-xl text-zinc-900">{season1.name}</h3>
            <p className="text-xs text-zinc-500 font-medium">Seçili Sezon</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Toplam Harcama</p>
              <div className="text-2xl font-black text-rose-600">₺{s1Expenses.toLocaleString()}</div>
            </div>
            
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Tahmini Kâr</p>
              <div className="text-2xl font-black text-emerald-600">₺{s1Profit.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Season 2 */}
        <div className="pl-8 space-y-6">
          <div>
            <h3 className="font-black text-xl text-zinc-900">{season2.name}</h3>
            <p className="text-xs text-zinc-500 font-medium">Önceki Sezon</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Toplam Harcama</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-700">₺{s2Expenses.toLocaleString()}</div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isS1MoreExpensive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isS1MoreExpensive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs((diffExpenses / s2Expenses) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Tahmini Kâr</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-zinc-700">₺{s2Profit.toLocaleString()}</div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isS1MoreProfitable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
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
