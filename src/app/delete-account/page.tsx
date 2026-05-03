'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function DeleteAccountPage() {
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    // Simulate API processing delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-[#161616] border border-white/10 rounded-[2rem] p-8 relative z-10 shadow-2xl">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors text-sm font-bold">
          <ArrowLeft size={16} className="mr-2" />
          Ana Sayfaya Dön
        </Link>

        {isSubmitted ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-black mb-3">Talebiniz Alındı</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Hesap silme talebiniz destek ekibimize başarıyla ulaştı. Güvenlik politikalarımız gereği <span className="text-white font-bold">{phone}</span> numaralı hesabınız ve ilişkili tüm verileriniz 48 saat içerisinde kalıcı olarak silinecektir.
            </p>
            <Link href="/" className="block w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors">
              Tamam
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 size={24} />
            </div>
            <h1 className="text-3xl font-black mb-3">Hesabımı Sil</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              ZiraiAsistan hesabınızı ve ilişkili tüm tarımsal verilerinizi (araziler, finansal işlemler, analizler) kalıcı olarak silmek için numaranızı girin. Bu işlem <span className="text-rose-400 font-bold">geri alınamaz</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Kayıtlı Telefon Numarası</label>
                <PhoneInput
                  international
                  defaultCountry="TR"
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  className="phone-input-dark w-full bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-white text-sm outline-none focus-within:border-rose-500/50 transition-all"
                />
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                  Devam ettiğinizde KVKK kapsamında tüm verileriniz sunucularımızdan tamamen yok edilecektir.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !phone || phone.length < 10}
                className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Hesabımı ve Verilerimi Sil"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
