'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Map, 
  TrendingUp, 
  Leaf, 
  ShieldCheck, 
  Zap, 
  Satellite, 
  Bot, 
  BarChart3, 
  CheckCircle2,
  Globe,
  Star,
  Layers,
  MousePointer2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

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
            <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Özellikler</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Fiyatlandırma</button>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Star size={12} className="fill-emerald-400" />
              Türkiye'nin En Akıllı Tarım İşletim Sistemi
            </div>
            
            <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Toprağınızı <br /> 
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">Veriyle</span> Yönetin
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-zinc-400 font-medium leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              Uydu takibi, yapay zeka destekli kararlar ve kuruşu kuruşuna maliyet analiziyle tarımsal işletmenizi cebinizden yönetin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white text-black px-10 py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] group active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Google ile Hemen Başla
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-6 rounded-[2rem] font-black text-xl text-white border-2 border-white/10 hover:bg-white/5 transition-all active:scale-95"
              >
                Keşfet
              </button>
            </div>

            {/* Floating Dashboard Preview (Abstract) */}
            <div className="mt-32 w-full max-w-5xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                   <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse"></div>
                   <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                   <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                   <div className="md:col-span-2 h-64 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                   <div className="h-64 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <div className="bg-emerald-500 py-4 overflow-hidden select-none">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
          {[1,2,3,4,5].map(i => (
            <React.Fragment key={i}>
              <span className="text-black font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                <Leaf size={16} /> 50.000+ DÖNÜM KAYITLI ARAZİ
              </span>
              <span className="text-black/30 font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                <Zap size={16} /> %30 GÜBRE TASARRUFU
              </span>
              <span className="text-black font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                <Satellite size={16} /> ANLIK NDVI TAKİBİ
              </span>
              <span className="text-black/30 font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                <Bot size={16} /> AI DESTEKLİ ZİRAİ ANALİZ
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="py-44 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                Geleneksel Tarımı <br /> 
                <span className="text-emerald-500">Dijital Güçle</span> <br /> 
                Yükseltin.
              </h2>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed">
                Kâğıt kalem devri kapandı. Orjut ile arazinizin her metrekaresini, her kuruşunu ve her operasyonunu profesyonel bir SaaS deneyimiyle yönetin.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/50 transition-colors">
                  <Satellite className="text-emerald-500 mb-4" size={32} />
                  <h4 className="font-black text-lg mb-2 uppercase tracking-tight">Uydu Takibi</h4>
                  <p className="text-sm text-zinc-500 font-bold">NDVI ısı haritalarıyla bitki sağlığını uzaydan izleyin.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-indigo-500/50 transition-colors">
                  <Bot className="text-indigo-500 mb-4" size={32} />
                  <h4 className="font-black text-lg mb-2 uppercase tracking-tight">AI Mühendis</h4>
                  <p className="text-sm text-zinc-500 font-bold">Yapay zeka ile toprak ve hava durumuna göre tavsiye alın.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full"></div>
              <Card className="!bg-zinc-950 !border-white/10 !p-8 relative z-10 shadow-2xl" hoverable>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Maliyet Analizi</span>
                     <TrendingUp className="text-emerald-500" size={20} />
                   </div>
                   <div className="h-40 flex items-end gap-2">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/20 border-t-4 border-emerald-500 rounded-t-lg transition-all hover:scale-y-110" style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                   <div className="pt-4 border-t border-white/5 flex justify-between">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Toplam Harcama</p>
                        <p className="text-2xl font-black">₺42.500</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tasarruf</p>
                        <p className="text-2xl font-black text-emerald-500">+₺12.400</p>
                      </div>
                   </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-44 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Net Fiyatlar.</h2>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.3em]">Arazinizin Büyüklüğüne Göre Ölçekleyin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE */}
            <Card className="!bg-zinc-950 !border-white/5 p-12 flex flex-col h-full hover:!border-white/20 transition-all">
              <div className="mb-10">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">Yeni Başlayanlar</span>
                <h3 className="text-3xl font-black mt-4 mb-2">Ücretsiz</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">0 TL</span>
                  <span className="text-zinc-500 font-bold">/yıl</span>
                </div>
              </div>
              <ul className="space-y-5 mb-12 flex-1">
                {['2 Arazi Kaydı', 'Temel Finans Takibi', 'Günlük Hava Durumu', 'Mobil Uygulama Erişimi'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full !rounded-2xl !py-4 font-black" onClick={handleStart}>Hemen Başla</Button>
            </Card>

            {/* PRO */}
            <Card className="!bg-emerald-600 !border-transparent p-12 flex flex-col h-full relative overflow-hidden shadow-2xl shadow-emerald-500/20 transform md:scale-110 z-10 !rounded-[3rem]">
              <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-bl-3xl">
                En Çok Tercih Edilen
              </div>
              <div className="mb-10">
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Profesyonel</span>
                <h3 className="text-3xl font-black mt-4 mb-2 text-white">KOBİ Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">3.490 TL</span>
                  <span className="text-emerald-100/60 font-bold">/yıl</span>
                </div>
              </div>
              <ul className="space-y-5 mb-12 flex-1">
                {[
                  'NDVI Uydu Isı Haritaları',
                  'AI Ziraat Mühendisi (50 Analiz)',
                  'Sınırsız İşlem Kaydı',
                  'PDF ve Excel Raporlama',
                  'Stok ve Envanter Yönetimi'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-black text-white">
                    <CheckCircle2 size={18} className="text-white shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full !bg-white !text-black hover:!bg-emerald-50 !rounded-2xl !py-4 font-black shadow-xl" onClick={handleStart}>Hemen Yüksel</Button>
            </Card>

            {/* ENTERPRISE */}
            <Card className="!bg-zinc-950 !border-white/5 p-12 flex flex-col h-full hover:!border-white/20 transition-all">
              <div className="mb-10">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">Kurumsal</span>
                <h3 className="text-3xl font-black mt-4 mb-2">Business</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">8.990 TL</span>
                  <span className="text-zinc-500 font-bold">/yıl</span>
                </div>
              </div>
              <ul className="space-y-5 mb-12 flex-1">
                {['Sınırsız NDVI ve AI Analizi', 'Öncelikli Teknik Destek', 'Çoklu Kullanıcı (Acente)', 'API ve ERP Entegrasyonu', 'Zirai Danışmanlık Desteği'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full !rounded-2xl !py-4 font-black" onClick={handleStart}>İletişime Geç</Button>
            </Card>
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
                Tarımsal işletmelerin dijital dönüşüm ortağı. Verilerle güçlenen, verimle büyüyen yeni nesil çiftçilik.
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer border border-white/5"><Globe size={20} /></div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer border border-white/5"><Star size={20} /></div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">Hızlı Erişim</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-500 transition-colors">Özellikler</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-500 transition-colors">Fiyatlandırma</button></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">NDVI Analizi</Link></li>
                <li><Link href="/admin" className="hover:text-emerald-500 transition-colors">Admin Paneli</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">Yasal</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><Link href="/legal" className="hover:text-emerald-500 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/legal" className="hover:text-emerald-500 transition-colors">Kullanım Şartları</Link></li>
                <li><a href="mailto:destek@orjut.com" className="hover:text-emerald-500 transition-colors">İletişim</a></li>
                <li><Link href="/delete-account" className="hover:text-rose-500 transition-colors text-zinc-600">Hesabımı Sil</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">© 2026 ORJUT AGTECH OS. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4 text-xs font-black text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                256-BIT ENCRYPTION
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                SLA: %99.9 UP-TIME
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

    </div>
  );
}
