'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BaseModalProps } from '@/types';

export default function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  showCloseButton = true
}: BaseModalProps) {
  
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`
        relative bg-white dark:bg-zinc-900 
        w-full max-w-lg rounded-[2.5rem] shadow-2xl 
        overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500
        ${className}
      `}>
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all z-10"
          >
            <X size={20} />
          </button>
        )}

        {title && (
          <div className="px-8 pt-8 pb-4">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h3>
          </div>
        )}

        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
