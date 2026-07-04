'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/schemas/auth.schema';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VM } from '@/lib/validation-messages';
import { Lock, User, ArrowRight, ArrowLeft, Phone, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Captcha State
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();

    // Auto-redirect to dashboard if already authenticated
    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const cachedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        if (session && cachedUserId) {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error("Auto-redirect check failed:", err);
      }
    }
    checkExistingSession();
  }, [router]);

  // Login Form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' }
  });

  // Register Form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', password: '', confirmPassword: '', captcha: '' }
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        phone: data.phone,
        password: data.password
      });
      if (error) throw error;
      
      if (authData.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_id', authData.user.id);
          localStorage.setItem('user_phone', authData.user.phone || '');
        }
      }
      
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      if (typeof window !== 'undefined') {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const message = err.message === 'Invalid login credentials' ? VM.loginFailed : err.message;
      toast.error(message || VM.serverError);
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    if (data.captcha !== generatedCaptcha) {
      toast.error(VM.captchaWrong);
      generateCaptcha();
      registerForm.setValue('captcha', '');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        phone: data.phone,
        password: data.password,
        options: {
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            first_name: data.firstName,
            last_name: data.lastName
          }
        }
      });
      if (error) throw error;
      
      if (authData?.user) {
        if (authData.session) {
          toast.success("Kayıt başarılı! Yönlendiriliyorsunuz...");
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_id', authData.user.id);
            window.location.href = '/dashboard';
          }
        } else {
          toast.success("Kayıt başarılı! Lütfen telefon numaranızı doğrulayın veya giriş yapın.");
          setIsLogin(true);
          setIsLoading(false);
        }
      } else {
        toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
        setIsLogin(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      toast.error(err.message || VM.serverError);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-body">
      {/* BRANDING SIDE - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-md text-white">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-2xl mb-12">
            <span className="text-4xl font-black font-heading">O</span>
          </div>
          <h2 className="text-5xl font-black font-heading leading-tight mb-6">
            Tarım İşlerinizi<br />Cebinizden Yönetin
          </h2>
          <p className="text-xl text-primary-100 font-medium leading-relaxed">
            Arazileriniz, masraflarınız ve stoklarınız her an elinizin altında. Türk çiftçisinin dijital iş ortağı.
          </p>
        </div>
      </div>

      {/* FORM SIDE */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 md:left-12 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-bold text-sm z-20 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="w-full max-w-md">
          <div className="text-center mb-10 md:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-6">
              <span className="text-white text-3xl font-black font-heading">O</span>
            </div>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary font-heading tracking-tight mb-2">
              {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesabınızı Oluşturun'}
            </h1>
            <p className="text-text-secondary font-medium">
              {isLogin ? 'Tarlanızı yönetmeye kaldığınız yerden devam edin.' : 'Dijital tarım dünyasına ilk adımınızı atın.'}
            </p>
          </div>

          <Card padding="lg" className="shadow-xl md:shadow-none md:border-none md:bg-transparent !p-0">
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="login-phone" className="text-sm font-semibold text-text-primary">Telefon Numarası</label>
                  <PhoneInput
                    id="login-phone"
                    name="phone"
                    international
                    defaultCountry="TR"
                    value={loginForm.watch('phone')}
                    onChange={(val) => loginForm.setValue('phone', val || '', { shouldValidate: true })}
                    className={cn(
                      "w-full rounded-md bg-surface-2 border-2 border-border px-4 py-1.5 text-base font-bold transition-all focus-within:border-primary focus-within:bg-surface",
                      loginForm.formState.errors.phone && "border-danger bg-danger-bg"
                    )}
                  />
                  {loginForm.formState.errors.phone && (
                    <p className="text-sm text-danger font-medium">{loginForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <Input
                  id="login-password"
                  label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  error={loginForm.formState.errors.password?.message}
                  leftIcon={<Lock size={18} />}
                  rightElement={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-muted hover:text-text-primary p-1"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  {...loginForm.register('password')}
                />

                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Şifremi Unuttum</button>
                </div>

                <Button type="submit" size="xl" fullWidth isLoading={isLoading} className="mt-2">
                  Giriş Yap
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="register-first-name"
                    label="İsim"
                    placeholder="Ahmet"
                    required
                    error={registerForm.formState.errors.firstName?.message}
                    {...registerForm.register('firstName')}
                  />
                  <Input
                    id="register-last-name"
                    label="Soyisim"
                    placeholder="Yılmaz"
                    required
                    error={registerForm.formState.errors.lastName?.message}
                    {...registerForm.register('lastName')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-phone" className="text-sm font-semibold text-text-primary">Telefon Numarası</label>
                  <PhoneInput
                    id="register-phone"
                    name="phone"
                    international
                    defaultCountry="TR"
                    value={registerForm.watch('phone')}
                    onChange={(val) => registerForm.setValue('phone', val || '', { shouldValidate: true })}
                    className={cn(
                      "w-full rounded-md bg-surface-2 border-2 border-border px-4 py-1.5 text-base font-bold transition-all focus-within:border-primary focus-within:bg-surface",
                      registerForm.formState.errors.phone && "border-danger bg-danger-bg"
                    )}
                  />
                  {registerForm.formState.errors.phone && (
                    <p className="text-sm text-danger font-medium">{registerForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <Input
                  id="register-password"
                  label="Şifre"
                  type="password"
                  placeholder="••••••••"
                  required
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />
                
                <Input
                  id="register-confirm-password"
                  label="Şifre Tekrar"
                  type="password"
                  placeholder="••••••••"
                  required
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                />

                <div className="space-y-2 pt-2">
                  <label htmlFor="register-captcha" className="text-sm font-semibold text-text-primary">Güvenlik Doğrulaması</label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-surface-2 border-2 border-border rounded-md flex items-center justify-center relative overflow-hidden h-12">
                      <span className="font-black text-2xl italic tracking-[0.4em] text-primary select-none z-10">
                        {generatedCaptcha.split('').join(' ')}
                      </span>
                      <button 
                        type="button"
                        onClick={generateCaptcha}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors z-20"
                        aria-label="Güvenlik kodunu yenile"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    </div>
                    <div className="w-28">
                      <input 
                        id="register-captcha"
                        type="text" 
                        required
                        maxLength={4}
                        placeholder="Kod"
                        className={cn(
                          "w-full bg-surface-2 border-2 border-border rounded-md h-12 text-center text-base font-black outline-none focus:border-primary transition-all",
                          registerForm.formState.errors.captcha && "border-danger bg-danger-bg"
                        )}
                        {...registerForm.register('captcha')}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="xl" fullWidth isLoading={isLoading} className="mt-4">
                  Kayıt Ol ve Başla
                </Button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-base font-bold text-text-secondary">
                {isLogin ? 'Henüz bir hesabınız yok mu?' : 'Zaten bir hesabınız var mı?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    loginForm.reset();
                    registerForm.reset();
                    generateCaptcha();
                  }}
                  className="ml-2 text-primary hover:underline transition-colors"
                >
                  {isLogin ? 'Ücretsiz Kayıt Ol' : 'Giriş Yap'}
                </button>
              </p>
            </div>
          </Card>
          
          <p className="mt-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
            © 2026 Orjut ZiraiAsistan — Güvenli Erişim
          </p>
        </div>
      </div>
    </div>
  );
}
