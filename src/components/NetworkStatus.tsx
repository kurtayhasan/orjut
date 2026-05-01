'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    
    const checkPending = () => {
      const pendingTx = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
      setPendingCount(pendingTx.length);
    };
    checkPending();

    const handleOnline = async () => {
      setIsOnline(true);
      toast.success("İnternet bağlantısı sağlandı.");
      
      const pendingTx = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
      if (pendingTx.length > 0) {
        setIsSyncing(true);
        toast.info("Çevrimdışı işlemler senkronize ediliyor...");
        // Simulate sync delay
        await new Promise(r => setTimeout(r, 2000));
        localStorage.removeItem('pending_transactions');
        setPendingCount(0);
        setIsSyncing(false);
        toast.success("Tüm veriler eşitlendi.");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Çevrimdışı moda geçildi. İşlemleriniz cihaza kaydedilecek.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Periodically check pending
    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !isSyncing && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm">
      {!isOnline && (
        <div className="bg-rose-100 text-rose-700 flex items-center gap-1.5 px-2 py-1 rounded-full animate-in fade-in">
          <WifiOff size={14} /> Çevrimdışı
        </div>
      )}
      
      {isOnline && isSyncing && (
        <div className="bg-indigo-100 text-indigo-700 flex items-center gap-1.5 px-2 py-1 rounded-full animate-in fade-in">
          <RefreshCw size={14} className="animate-spin" /> Eşitleniyor
        </div>
      )}

      {pendingCount > 0 && !isSyncing && (
        <div className="bg-amber-100 text-amber-700 flex items-center gap-1.5 px-2 py-1 rounded-full animate-in fade-in">
          {pendingCount} İşlem Bekliyor
        </div>
      )}
    </div>
  );
}
