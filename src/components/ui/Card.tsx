'use client';

import React from 'react';
import { CardProps } from '@/types';

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hoverable = false 
}: CardProps) {
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`
      bg-white dark:bg-zinc-900 
      border border-zinc-200/60 dark:border-zinc-800 
      rounded-[2rem] shadow-sm 
      transition-all duration-300
      ${hoverable ? 'hover:shadow-md hover:border-indigo-500/30' : ''}
      ${paddings[padding]} 
      ${className}
    `}>
      {children}
    </div>
  );
}
