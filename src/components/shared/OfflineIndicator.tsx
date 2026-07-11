'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { flushQueue, getQueueCount } from '@/lib/offline/syncEngine';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getQueueCount());
  }, []);

  const runFlush = useCallback(async () => {
    const count = getQueueCount();
    if (count === 0) return;

    setIsSyncing(true);
    toast.info('Çevrimdışı işlemler senkronize ediliyor...', { id: 'offline-flush' });

    try {
      const result = await flushQueue();
      refreshPendingCount();

      if (result.success > 0 && result.failed === 0) {
        toast.success(
          `${result.success} çevrimdışı kayıt senkronize edildi.`,
          { id: 'offline-flush' }
        );
      } else if (result.success > 0 && result.failed > 0) {
        const first = result.errors[0]?.message;
        toast.error(
          `${result.success} kayıt eşitlendi, ${result.failed} başarısız.` +
            (first ? ` Örnek: ${first}` : ''),
          { id: 'offline-flush' }
        );
      } else if (result.failed > 0) {
        const first = result.errors[0]?.message;
        toast.error(
          first
            ? `Senkronizasyon başarısız: ${first}`
            : 'Çevrimdışı kayıtlar senkronize edilemedi.',
          { id: 'offline-flush' }
        );
      } else {
        toast.dismiss('offline-flush');
      }
    } catch (e: any) {
      toast.error(
        e?.message
          ? `Senkronizasyon hatası: ${e.message}`
          : 'Çevrimdışı kuyruk senkronize edilirken hata oluştu.',
        { id: 'offline-flush' }
      );
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    refreshPendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      toast.success('İnternet bağlantısı sağlandı.');
      await runFlush();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        'Çevrimdışı moda geçildi. Yeni arazi / gözlem / sulama / tarla işlemleri cihaza kaydedilecek.'
      );
    };

    const onQueueChanged = () => refreshPendingCount();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('orjut:queue-changed', onQueueChanged);

    const interval = setInterval(refreshPendingCount, 5000);

    // If we mount already online with pending items (e.g. app restart), flush once
    if (typeof navigator !== 'undefined' && navigator.onLine && getQueueCount() > 0) {
      void runFlush();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('orjut:queue-changed', onQueueChanged);
      clearInterval(interval);
    };
  }, [refreshPendingCount, runFlush]);

  if (isOnline && !isSyncing && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black transition-all shadow-2xl animate-in slide-in-from-bottom-4">
      {!isOnline && (
        <div className="bg-amber-500/20 text-amber-100 border border-amber-500/30 flex items-center gap-2 px-3 py-1.5 rounded-xl">
          <WifiOff size={16} className="text-amber-400" />
          <span className="uppercase tracking-widest">Çevrimdışı Mod</span>
        </div>
      )}

      {isOnline && isSyncing && (
        <div className="bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 flex items-center gap-2 px-3 py-1.5 rounded-xl">
          <RefreshCw size={16} className="animate-spin text-indigo-400" />
          <span className="uppercase tracking-widest">Veriler Eşitleniyor</span>
        </div>
      )}

      {pendingCount > 0 && !isSyncing && (
        <div className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 flex items-center gap-2 px-3 py-1.5 rounded-xl">
          <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">
            {pendingCount}
          </span>
          <span className="uppercase tracking-widest">Bekleyen Kayıt</span>
        </div>
      )}
    </div>
  );
}
