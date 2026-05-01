'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[9999] animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black flex items-start gap-4">
        <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-2xl shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm mb-1">Veri ve Gizlilik</h4>
          <p className="text-zinc-400 text-xs leading-relaxed mb-4 font-medium">
            Deneyiminizi iyileştirmek için çerezleri kullanıyoruz. Devam ederek <Link href="/legal" className="text-emerald-400 hover:underline">Gizlilik ve KVKK Politikamızı</Link> kabul etmiş sayılırsınız.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleAccept}
              className="flex-1 py-2 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
            >
              Anladım ve Kabul Et
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
