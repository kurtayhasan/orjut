'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lock, User, ArrowRight, ArrowLeft, Phone, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Captcha State
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    firstName: '',
    lastName: ''
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
    
    // Captcha Check for Signup
    if (!isLogin && captchaValue !== generatedCaptcha) {
      toast.error("Güvenlik kodunu yanlış girdiniz.");
      generateCaptcha();
      setCaptchaValue('');
      return;
    }

    if (!formData.phone) {
      toast.error("Lütfen geçerli bir telefon numarası giriniz.");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        // LOGIN (Phone-Password)
        const { error } = await supabase.auth.signInWithPassword({
          phone: formData.phone,
          password: formData.password
        });
        if (error) throw error;
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      } else {
        // SIGNUP (Phone-Password)
        const { error } = await supabase.auth.signUp({
          phone: formData.phone,
          password: formData.password,
          options: {
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`,
              first_name: formData.firstName,
              last_name: formData.lastName
            }
          }
        });
        if (error) throw error;
        toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true);
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Auth Error:", err);
      const message = err.message === 'Invalid login credentials' ? 'Telefon numarası veya şifre hatalı' : err.message;
      toast.error(message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("Google girişi başarısız.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm z-20 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Anasayfaya Dön
      </Link>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/20 mb-6">
            <span className="text-white text-3xl font-black">O</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesabınızı Oluşturun'}
          </h1>
          <p className="text-zinc-500 font-medium">Dijital tarım dünyasına adım atın.</p>
        </div>

        <Card className="!bg-zinc-950/50 !border-white/5 p-8 backdrop-blur-xl">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] mb-6"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google ile Devam Et
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">veya telefon ile</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="İsim"
                  placeholder="Ahmet"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <Input
                  label="Soyisim"
                  placeholder="Yılmaz"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Telefon Numarası</label>
              <PhoneInput
                international
                defaultCountry="TR"
                value={formData.phone}
                onChange={(value) => setFormData({...formData, phone: value || ''})}
                className="phone-input-dark w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-2 px-4 text-zinc-900 dark:text-zinc-100 text-sm font-bold outline-none focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all"
              />
            </div>

            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock size={16} />}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            {!isLogin && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Güvenlik Doğrulaması</label>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden min-h-[50px]">
                    <span className="font-black text-2xl italic tracking-[0.4em] text-emerald-400 select-none z-10">
                      {generatedCaptcha.split('').join(' ')}
                    </span>
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-white transition-colors z-20"
                    >
                      <RefreshCcw size={14} />
                    </button>
                  </div>
                  <div className="relative w-28">
                    <input 
                      type="text" 
                      required
                      maxLength={4}
                      placeholder="Kod"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-3.5 px-4 text-zinc-900 dark:text-zinc-100 text-center text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                      value={captchaValue}
                      onChange={e => setCaptchaValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={!isLogin && captchaValue.length !== 4}
              rightIcon={<ArrowRight size={18} />}
            >
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm font-bold text-zinc-500">
              {isLogin ? 'Henüz bir hesabınız yok mu?' : 'Zaten bir hesabınız var mı?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
              </button>
            </p>
          </div>
        </Card>
        
        <p className="mt-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          © 2026 Orjut AgTech — Güvenli Erişim
        </p>
      </div>
    </div>
  );
}
