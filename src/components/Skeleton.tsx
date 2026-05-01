'use client';

import React from 'react';

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-200 rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border-2 border-zinc-100 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex justify-between items-end pt-4">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}
