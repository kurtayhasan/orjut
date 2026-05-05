'use client';

import React from 'react';
import { Sprout, Plus } from 'lucide-react';
import Button from './ui/Button';
import { EmptyStateProps } from '@/types';

export default function EmptyState({ 
  message, 
  buttonText, 
  onAction,
  icon: Icon = Sprout
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/50 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-300 dark:text-zinc-600">
        <Icon size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{message}</h3>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 max-w-[240px] mx-auto">Sistemi kullanmaya başlamak için ilk adımı atın.</p>
      </div>
      {buttonText && onAction && (
        <Button 
          onClick={onAction}
          leftIcon={<Plus size={18} />}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
