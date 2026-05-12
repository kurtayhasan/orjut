'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Satellite, 
  Bot, 
  BarChart3, 
  CheckCircle2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { landingTranslations } from '@/lib/translations/landing';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const t = landingTranslations.tr;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    router.push('/login');
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 border-b ${scrolled ? 'bg-black/60 backdrop-blur-2xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
              <span className="text-white font-black text-xl">O</span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black tracking-tighter">Orjut</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">AgTech OS</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">{t.quickLinks.split(' ')[0]}</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">{t.pricingTitle.split(' ')[0]}</button>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 mx-2">
              <Link href="/" className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-emerald-500/20">TR</Link>
              <Link href="/en" className="px-3 py-1 text-zinc-500 hover:text-white text-[10px] font-black transition-colors">EN</Link>
            </div>
            <Link href="/login" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">Giriş Yap</Link>
            <Button size="sm" onClick={handleStart} className="!bg-emerald-500 !text-black font-black shadow-lg shadow-emerald-500/20">Ücretsiz Başla</Button>
          </div>

          <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-44 pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">{t.heroBadge}</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] max-w-4xl" dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
            
            <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mb-12 leading-relaxed">
              {t.heroSub}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" onClick={handleStart} className="!rounded-2xl !px-12 !py-6 text-lg font-black group shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105">
                {t.heroCTA} <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">{t.featureTitle}</h2>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">{t.featureSub}</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 !bg-zinc-950 !border-white/5 group hover:!border-emerald-500/50 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <Satellite size={24} />
            </div>
            <h3 className="text-xl font-black mb-3">{t.ndviTitle}</h3>
            <p className="text-zinc-500 font-medium">{t.ndviDesc}</p>
          </Card>
          <Card className="p-8 !bg-zinc-950 !border-white/5 group hover:!border-indigo-500/50 transition-all">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-black mb-3">{t.aiTitle}</h3>
            <p className="text-zinc-500 font-medium">{t.aiDesc}</p>
          </Card>
          <Card className="p-8 !bg-zinc-950 !border-white/5 group hover:!border-emerald-500/50 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-black mb-3">{t.financeTitle}</h3>
            <p className="text-zinc-500 font-medium">{t.financeDesc}</p>
          </Card>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 relative z-10 border-t border-white/5 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">{t.pricingTitle}</h2>
            <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">Temel özellikler sonsuza kadar ücretsiz. Yapay zekâ ve uydu verileri için Premium&apos;a geçin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* FREE */}
            <Card className="p-12 !bg-zinc-950 !border-white/5 flex flex-col h-full hover:!border-white/20 transition-all">
              <div className="mb-10">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">Ücretsiz</span>
                <h3 className="text-3xl font-black mt-4 mb-2">Veri Toplayıcı</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">0 TL</span>
                  <span className="text-zinc-500 font-bold">/ sonsuza dek</span>
                </div>
              </div>
              <ul className="space-y-5 mb-12 flex-1">
                {['Tarla Yönetimi', 'Masraf Takibi', 'Sezon Kayıtları', 'Envanter Yönetimi', 'Sulama Takibi'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-500">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full !rounded-2xl !py-4 font-black" onClick={handleStart}>Ücretsiz Başla</Button>
            </Card>

            {/* PREMIUM — KOBİ PRO */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-indigo-500 rounded-[3.5rem] blur-lg opacity-30 animate-pulse" />
              <Card className="relative !bg-emerald-600 !border-transparent p-12 flex flex-col h-full overflow-hidden shadow-2xl shadow-emerald-500/20 !rounded-[3rem]">
                <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-bl-3xl">
                  Önerilen
                </div>
                <div className="mb-10">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">KOBİ Pro</span>
                  <h3 className="text-3xl font-black mt-4 mb-2 text-white">Akıllı Sezon</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">1.000 TL</span>
                    <span className="text-emerald-100/60 font-bold">/yıl</span>
                  </div>
                  <p className="text-emerald-100/80 text-sm font-bold mt-2">veya Aylık 100 TL</p>
                </div>
                <ul className="space-y-5 mb-12 flex-1">
                  {[
                    'Her Şey (Ücretsiz Plandaki Tüm Özellikler)',
                    'Yapay Zekâ Asistanı',
                    'NDVI Uydu Analizi',
                    'Sınırsız Danışmanlık',
                    'Öncelikli Teknik Destek'
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-black text-white">
                      <CheckCircle2 size={18} className="text-white shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full !bg-white !text-black hover:!bg-emerald-50 !rounded-2xl !py-4 font-black shadow-xl" onClick={handleStart}>Premium&apos;a Geç</Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-2xl">O</span>
                </div>
                <span className="text-2xl font-black tracking-tighter">Orjut <span className="text-emerald-500">AgTech</span></span>
              </div>
              <p className="text-zinc-500 font-medium max-w-sm text-lg leading-relaxed">
                {t.footerSub}
              </p>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">{t.quickLinks}</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-500 transition-colors">Özellikler</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-500 transition-colors">Fiyatlandırma</button></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">Giriş Yap</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">{t.legal}</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><Link href="/legal/privacy" className="hover:text-emerald-500 transition-colors">{t.privacy}</Link></li>
                <li><Link href="/legal/terms" className="hover:text-emerald-500 transition-colors">{t.terms}</Link></li>
                <li><a href="mailto:destek@orjut.com" className="hover:text-emerald-500 transition-colors">{t.contactUs}</a></li>
                <li><Link href="/login" className="hover:text-rose-500 transition-colors text-zinc-600">Hesabımı Sil</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">© 2026 ORJUT AGTECH OS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
