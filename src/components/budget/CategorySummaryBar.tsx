import React from 'react';
import { CategoryTotals } from '@/types';

interface CategorySummaryBarProps {
  totals: CategoryTotals;
  activeFilter: string | null;
  onFilterChange: (category: string | null) => void;
}

export default function CategorySummaryBar({ totals, activeFilter, onFilterChange }: CategorySummaryBarProps) {
  const categories = [
    { key: 'Mazot', label: 'Mazot', amount: totals.mazot.total, color: 'border-amber-500 text-amber-700 bg-amber-50' },
    { key: 'Gübre', label: 'Gübre', amount: totals.gubre.total, color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
    { key: 'İlaç', label: 'İlaç', amount: totals.ilac.total, color: 'border-teal-500 text-teal-700 bg-teal-50' },
    { key: 'İşçilik', label: 'İşçi', amount: totals.isci.total, color: 'border-indigo-500 text-indigo-700 bg-indigo-50' },
    { key: 'Diğer', label: 'Diğer', amount: totals.diger.total, color: 'border-zinc-500 text-zinc-700 bg-zinc-50' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
          activeFilter === null ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200 bg-white'
        }`}
      >
        Tümü
      </button>
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onFilterChange(cat.key)}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeFilter === cat.key ? 'ring-2 ring-indigo-500 ring-offset-1 border-transparent' : 'border-zinc-100 hover:border-zinc-200 bg-white'
          } ${cat.color}`}
        >
          <span>{cat.label}</span>
          <span className="font-black opacity-60">₺{cat.amount.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}
