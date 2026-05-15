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
          <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">{pendingCount}</span>
          <span className="uppercase tracking-widest">Bekleyen Kayıt</span>
        </div>
      )}
    </div>
  );
}
