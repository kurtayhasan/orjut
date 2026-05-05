'use client';

import React from 'react';
import { InputProps } from '@/types';

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  as: Component = 'input',
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {leftIcon}
          </div>
        )}
        
        {/* @ts-ignore - dynamic component type issue */}
        <Component
          className={`
            w-full bg-zinc-50 dark:bg-zinc-950 
            border border-zinc-100 dark:border-zinc-800 
            rounded-2xl py-3.5 px-4 
            text-zinc-900 dark:text-zinc-100 text-sm font-bold
            outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 
            transition-all placeholder:text-zinc-400
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${error ? 'border-rose-500 ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
    </div>
  );
}
