'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black font-heading text-text-primary">
            Beklenmeyen Bir Durum Oluştu
          </h2>
          <p className="text-sm font-bold text-text-muted leading-relaxed">
            Bu bölüm yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => reset()}
            fullWidth
            size="lg"
            className="font-black uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2"
            leftIcon={<RotateCcw size={16} />}
          >
            Yenile
          </Button>
        </div>
      </div>
    </div>
  );
}
