'use client';

import React from 'react';
import { Sprout, Plus } from 'lucide-react';

export default function EmptyState({ 
  message, 
  buttonText, 
  onAction,
  icon: Icon = Sprout
}: { 
  message: string, 
  buttonText?: string, 
  onAction?: () => void,
  icon?: any
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-zinc-100 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
        <Icon size={32} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zinc-900">{message}</h3>
        <p className="text-sm text-zinc-500 max-w-[200px] mx-auto">Sistemi kullanmaya başlamak için ilk adımı atın.</p>
      </div>
      {buttonText && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={18} />
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
}
