import React from 'react';

interface BudgetProgressProps {
  categoryName: string;
  spent: number;
  budget: number;
  color: string;
}

export default function BudgetProgressBar({ categoryName, spent, budget, color }: BudgetProgressProps) {
  const percentage = Math.min(100, Math.max(0, (spent / budget) * 100));
  const isWarning = percentage >= 80 && percentage < 100;
  const isDanger = percentage >= 100;

  let barColor = color;
  if (isDanger) barColor = '#ef4444'; // red-500
  else if (isWarning) barColor = '#eab308'; // yellow-500

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-zinc-800">{categoryName}</span>
        <span className="text-xs font-medium text-zinc-500">
          ₺{spent.toLocaleString()} / ₺{budget.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        ></div>
      </div>
      {isDanger && <p className="text-[10px] text-rose-500 font-bold uppercase">Bütçe aşıldı!</p>}
      {!isDanger && isWarning && <p className="text-[10px] text-yellow-600 font-bold uppercase">Bütçe sınırına yaklaşıldı</p>}
    </div>
  );
}
