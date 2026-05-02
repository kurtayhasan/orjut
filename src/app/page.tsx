'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User, ArrowRight, ShieldCheck, RefreshCcw, Lock, Map, TrendingUp, Leaf } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: ''
  });

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic Validation (E.164 format starts with +)
    if (!formData.phone || formData.phone.length < 10 || !formData.phone.startsWith('+')) {
      toast.error("Geçerli bir telefon numarası seçiniz.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (captchaValue !== generatedCaptcha) {
      toast.error("Hatalı güvenlik kodu. Lütfen tekrar deneyin.");
      generateCaptcha();
      setCaptchaValue('');
      return;
    }

    setIsLoading(true);
    
    try {
      if (mode === 'signup') {
        if (!formData.firstName || !formData.lastName) {
          toast.error("Lütfen isim ve soyisim giriniz.");
          setIsLoading(false);
          return;
        }

        // 1. Kayıt Ol / Güncelle (profiles tablosu)
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ 
            phone: formData.phone,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password // Simple text password for MVP
          }, { onConflict: 'phone' })
          .select()
          .single();

        if (error) {
          console.error("Signup error:", error);
          throw new Error("Veritabanına kaydedilemedi: " + error.message);
        }
        
        localStorage.setItem('user_id', data.id);
        localStorage.setItem('user_name', data.first_name);
        toast.success("Hesabınız oluşturuldu!");
      } else {
        // 2. Giriş Yap
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', formData.phone)
          .single();

        if (error || !data) {
          toast.error("Bu numara ile kayıtlı bir hesap bulunamadı.");
          setIsLoading(false);
          return;
        }

        // Check password
        if (data.password !== formData.password) {
          toast.error("Hatalı şifre. Lütfen tekrar deneyin.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem('user_id', data.id);
        localStorage.setItem('user_name', data.first_name);
        toast.success(`Hoş geldiniz, ${data.first_name}!`);
      }

      // Başarılı giriş sonrası yönlendirme
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Final Auth Error:', err);
      toast.error(err.message || "Bir şeyler yanlış gitti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      
      {/* LEFT COLUMN — Marketing (Desktop only) */}
      <div className="hidden lg:flex relative overflow-hidden">
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1592982537447-6f2a6a0a5023?q=80&w=2000" 
          alt="Tarım alanı" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white max-w-xl">
          <div className="mb-8">
            <span className="inline-block bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Beta v.1
            </span>
            <h1 className="text-5xl font-black tracking-tight leading-[1.1] mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ZiraiAsistan</span>
              <br />
              <span className="text-white/90 text-3xl font-bold">by Orjut</span>
            </h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              Gerçek Verilerle Sıfır Kayıp, Maksimum Hasat.
            </p>
          </div>

          <div className="space-y-5 w-full">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl shrink-0">
                <Map size={22} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Arazi ve Verim Takibi</h3>
                <p className="text-white/60 text-xs mt-0.5">Tarlalarınızı harita üzerinde yönetin, verim hedeflerinizi planlayın.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
              <div className="bg-teal-500/20 p-2.5 rounded-xl shrink-0">
                <Leaf size={22} className="text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Akıllı Gübreleme ve İlaçlama</h3>
                <p className="text-white/60 text-xs mt-0.5">Yapay zeka destekli tavsiyelerle doğru zamanda, doğru müdahale.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl shrink-0">
                <TrendingUp size={22} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Finans ve Maliyet Kontrolü</h3>
                <p className="text-white/60 text-xs mt-0.5">Tüm masraflarınızı kategorize edin, sezon kârınızı canlı takip edin.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 w-full">
            <p className="text-white/40 text-xs font-medium">
              © 2026 Orjut.com — ZiraiAsistan
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN — Auth Form */}
      <div className="bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
              ZiraiAsistan
            </h1>
            <p className="text-slate-400 font-medium tracking-wide">Gerçek Verilerle Sıfır Kayıp, Maksimum Hasat.</p>
            {/* Mobile-only badge */}
            <span className="lg:hidden inline-block mt-3 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
              Beta v.1
            </span>
          </div>

          <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black relative">
            <div className="flex gap-4 mb-8 bg-black/40 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'signup' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Kayıt Ol
              </button>
              <button 
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Giriş Yap
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">İsim</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        required
                        placeholder="Ahmet"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Soyisim</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Yılmaz"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefon Numarası</label>
                <PhoneInput
                  international
                  defaultCountry="TR"
                  value={formData.phone}
                  onChange={(value) => setFormData({...formData, phone: value || ''})}
                  className="phone-input-dark w-full bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-white text-sm outline-none focus-within:border-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Şifre</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Güvenlik Doğrulaması</label>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden min-h-[50px]">
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex flex-wrap gap-1">
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className="text-[10px] text-white rotate-12">ORJUT</div>
                      ))}
                    </div>
                    <span className="font-black text-2xl italic tracking-[0.4em] text-emerald-400 select-none z-10">
                      {generatedCaptcha}
                    </span>
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-white transition-colors z-20"
                    >
                      <RefreshCcw size={14} />
                    </button>
                  </div>
                  <div className="relative w-32">
                    <input 
                      type="text" 
                      required
                      maxLength={4}
                      placeholder="Kod"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white text-center text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                      value={captchaValue}
                      onChange={e => setCaptchaValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
              >
                {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : (
                  <>
                    {mode === 'signup' ? 'Kayıt Ol ve Devam Et' : 'Sisteme Giriş Yap'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Lock size={12} />
                Secure Access
              </div>
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} />
                AgTech Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
