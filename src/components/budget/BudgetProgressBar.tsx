import React from 'react';

interface BudgetProgressProps {
  categoryName: string;
  spent: number;
  budget: number;
  color: string;
}

export default function BudgetProgressBar({ categoryName, spent, budget, color }: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min(100, Math.max(0, (spent / budget) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-zinc-800">{categoryName}</span>
        <span className="text-xs font-medium text-zinc-500">
          ₺{spent.toLocaleString()}
          {budget > 0 && <span className="text-zinc-400"> / ₺{Math.round(budget).toLocaleString()}</span>}
        </span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      {spent === 0 && (
        <p className="text-[10px] text-zinc-400 font-medium">Henüz harcama yok</p>
      )}
    </div>
  );
}
