'use client';

import React, { useState } from 'react';
import { X, Crown, Satellite, Bot, Sparkles, Check, Zap } from 'lucide-react';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumUpsellModal({ isOpen, onClose }: PremiumUpsellModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-indigo-500 rounded-[2.5rem] blur-lg opacity-40 animate-pulse" />
        
        <div className="relative bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-indigo-500" />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all z-10"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="p-8 pt-6">
            {/* Crown Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 rotate-3">
                  <Crown size={28} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles size={12} className="text-amber-900" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-black text-center text-white tracking-tight mb-2">
              Bu Özellik KOBİ Pro Paketine Dâhildir
            </h2>
            <p className="text-sm text-zinc-400 text-center font-medium mb-8 leading-relaxed">
              Yapay zekâ analizleri ve uydu görüntüleri için Premium&apos;a geçin.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Yapay Zekâ Asistanı</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Kişiselleştirilmiş zirai danışmanlık</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                  <Satellite size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">NDVI Uydu Analizi</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Tarlanızı uzaydan izleyin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sınırsız Danışmanlık</p>
                  <p className="text-[11px] text-zinc-500 font-medium">7/24 yapay zekâ destekli analiz</p>
                </div>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
                  billingCycle === 'monthly' 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider relative ${
                  billingCycle === 'yearly' 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Yıllık
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-2 right-2 text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black">
                    2 AY HEDİYE
                  </span>
                )}
              </button>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'monthly' ? '100' : '1.000'}
                </span>
                <span className="text-lg font-bold text-zinc-500">TL</span>
                <span className="text-sm font-bold text-zinc-600">
                  / {billingCycle === 'monthly' ? 'ay' : 'yıl'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-emerald-500 font-bold mt-1">
                  Aylık 83 TL&apos;ye denk gelir — 2 ay hediye!
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                // In future, redirect to payment
                window.location.href = '/dashboard/settings';
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-base flex items-center justify-center gap-2"
            >
              <Crown size={18} />
              Premium&apos;a Yükselt
            </button>

            <p className="text-[11px] text-zinc-600 text-center mt-4 font-medium">
              İstediğiniz zaman iptal edebilirsiniz. 14 gün ücretsiz deneme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
