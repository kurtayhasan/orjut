'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
  Globe
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("Giriş yapılamadı: " + err.message);
      setIsLoading(false);
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-black text-xl">O</span>
            </div>
            <span className="text-xl font-black tracking-tighter">Orjut <span className="text-emerald-500">AgTech</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={scrollToFeatures} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Özellikler</button>
            <Link href="#pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Fiyatlandırma</Link>
            <Button variant="ghost" size="sm" onClick={handleGoogleLogin}>Giriş Yap</Button>
            <Button size="sm" onClick={handleGoogleLogin} leftIcon={<Zap size={14} />}>Ücretsiz Başla</Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Yapay Zeka Destekli Yeni Nesil Tarım
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Tarlanızın Dijital <br /> 
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Ziraat Mühendisi</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Uydu takibi, yapay zeka destekli kararlar ve kuruşu kuruşuna maliyet analiziyle tarımsal işletmenizi cebinizden yönetin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl font-black text-lg hover:bg-zinc-200 transition-all shadow-2xl shadow-white/10 group active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Ücretsiz Başla (Google ile Giriş)
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-lg text-white border border-white/10 hover:bg-white/5 transition-all active:scale-95"
            >
              Özellikleri Keşfet
            </button>
          </div>

          {/* Social Proof / Trusted by */}
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-8 opacity-50 grayscale">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Geleceğin Çiftçileri Tarafından Tercih Ediliyor</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
              <span className="text-2xl font-black italic opacity-40">AGRO-X</span>
              <span className="text-2xl font-black italic opacity-40">GREEN-TECH</span>
              <span className="text-2xl font-black italic opacity-40">EARTH-SCAN</span>
              <span className="text-2xl font-black italic opacity-40">FARM-OPS</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Sıfır Kayıp, Maksimum Hasat</h2>
            <p className="text-zinc-500 font-medium text-lg">Geleneksel yöntemleri bırakın, verilerle karar verin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="!bg-zinc-950 !border-white/5 p-10 hover:!border-emerald-500/50 group transition-all" hoverable>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                <Satellite size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Uydu ve NDVI Takibi (Pro)</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Tarlanızın stres ve gelişim durumunu uzaydan anlık izleyin. Klorofil seviyelerini takip ederek bölgesel müdahale yapın.
              </p>
            </Card>

            <Card className="!bg-zinc-950 !border-white/5 p-10 hover:!border-indigo-500/50 group transition-all" hoverable>
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform">
                <Bot size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Yapay Zeka İçgörüleri (Pro)</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Hava, toprak ve geçmiş verilerinizi harmanlayan AI ile doğru zamanda doğru müdahaleyi yapın. Finansal kayıpları önleyin.
              </p>
            </Card>

            <Card className="!bg-zinc-950 !border-white/5 p-10 hover:!border-cyan-500/50 group transition-all" hoverable>
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Uçtan Uca Finans ve Stok</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Tüm maliyetlerinizi otomatik hesaplayın, sezon sonu tek tıkla PDF/Excel raporları alın. Stoklarınızı canlı takip edin.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">İşletmenize Uygun Ölçekleme</h2>
            <p className="text-zinc-500 font-medium text-lg">Arazinizin büyüklüğüne göre en adil fiyatlandırma.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE */}
            <Card className="!bg-zinc-950/50 !border-white/5 p-10 flex flex-col h-full relative overflow-hidden">
              <div className="mb-8">
                <h3 className="text-xl font-black mb-2">Başlangıç</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">0 TL</span>
                  <span className="text-zinc-500 font-bold">/ yıl</span>
                </div>
                <p className="text-zinc-500 text-xs mt-4 font-black uppercase tracking-widest">0 - 100 Dönüm (Max 2 Arazi)</p>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  'Manuel İşlem Defteri',
                  'Stok ve Finans Takibi',
                  'Anlık Hava Durumu',
                  'Temel Raporlama'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>Ücretsiz Başla</Button>
            </Card>

            {/* PRO */}
            <Card className="!bg-emerald-600/5 !border-emerald-500/30 p-10 flex flex-col h-full relative overflow-hidden shadow-2xl shadow-emerald-500/10 transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-xl">
                Popüler Seçim
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-black mb-2 text-emerald-400">KOBİ Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">3.490 TL</span>
                  <span className="text-zinc-500 font-bold">/ yıl</span>
                </div>
                <p className="text-emerald-400/80 text-xs mt-4 font-black uppercase tracking-widest">100 - 500 Dönüm</p>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  'NDVI Uydu Isı Haritaları',
                  'Aylık 50 Yapay Zeka (RAG) Analizi',
                  'PDF/Excel ERP Raporlama',
                  'Öncelikli Destek',
                  'Sınırsız İşlem Kaydı'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-200">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full !bg-emerald-600 hover:!bg-emerald-700" onClick={handleGoogleLogin}>Pro'ya Yüksel</Button>
            </Card>

            {/* ENTERPRISE */}
            <Card className="!bg-zinc-950/50 !border-white/5 p-10 flex flex-col h-full relative overflow-hidden">
              <div className="mb-8">
                <h3 className="text-xl font-black mb-2">Büyük İşletme</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">8.990 TL</span>
                  <span className="text-zinc-500 font-bold">/ yıl</span>
                </div>
                <p className="text-zinc-500 text-xs mt-4 font-black uppercase tracking-widest">500 - 2500 Dönüm</p>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  'Sınırsız NDVI Takibi',
                  'Sınırsız AI Ziraat Mühendisi',
                  'Detaylı Verim Kıyaslama',
                  'API Entegrasyonu',
                  'Kurumsal Hesap Yönetimi'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="w-full !bg-white/5 hover:!bg-white/10" onClick={handleGoogleLogin}>İşletmeni Büyüt</Button>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <p className="text-zinc-500 font-bold text-sm">
              2000 Dönüm ve üzeri kurumsal araziler için <Link href="/contact" className="text-emerald-500 hover:underline">özel teklif alın.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black">O</span>
                </div>
                <span className="text-xl font-black tracking-tighter">Orjut</span>
              </div>
              <p className="text-zinc-500 font-medium max-w-sm mb-8">
                Tarımsal işletmelerin dijital dönüşüm ortağı. Verilerle güçlenen, verimle büyüyen yeni nesil çiftçilik.
              </p>
              <div className="flex gap-4">
                {/* Social icons could go here */}
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer"><Globe size={20} /></div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-white uppercase tracking-widest text-[10px] mb-6">Ürün</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">Özellikler</Link></li>
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">Fiyatlandırma</Link></li>
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">NDVI Analizi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white uppercase tracking-widest text-[10px] mb-6">Destek</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">Kullanım Şartları</Link></li>
                <li><Link href="#" className="hover:text-emerald-500 transition-colors">İletişim</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-zinc-600">© 2026 Orjut AgTech. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verileriniz 256-bit AES ile şifrelenmektedir.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Helper Link component since I'm using it
function Link({ href, children, className, onClick }: { href: string, children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <a href={href} className={className} onClick={(e) => {
      if (href.startsWith('#')) {
        e.preventDefault();
        document.getElementById(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      }
      if (onClick) onClick();
    }}>
      {children}
    </a>
  );
}
