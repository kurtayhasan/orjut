'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Check, Map, Wallet, Package, 
  Droplets, Bot, BarChart3, Menu, X, 
  Smartphone, ShieldCheck, Zap
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Arazi Haritası",
      desc: "Parsellerini çiz, uydudan takip et ve sınırlarını belirle.",
      icon: Map,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Masraf Takibi",
      desc: "Gübre, ilaç ve mazot giderlerini kuruşu kuruşuna kaydet.",
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Stok Yönetimi",
      desc: "Depondaki ürünleri bil, eksilince anında haberin olsun.",
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Hava & Sulama",
      desc: "Tarlana özel hava durumu ve akıllı sulama tavsiyeleri.",
      icon: Droplets,
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      title: "AI Asistan",
      desc: "Zirai konularda 7/24 uzman yapay zekâ danışmanlığı.",
      icon: Bot,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Sezon Raporu",
      desc: "Yıl sonunda ne kadar kazandığını detaylı analiz et.",
      icon: BarChart3,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <div className="min-h-screen bg-bg font-body flex flex-col">
      {/* NAVBAR */}
      <nav className={cn(
        "fixed top-0 w-full z-[var(--z-sticky)] transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="font-heading font-black text-xl">O</span>
            </div>
            <span className="text-xl font-heading font-extrabold text-text-primary tracking-tight">
              Orjut <span className="text-primary font-bold">ZiraiAsistan</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors">Özellikler</Link>
            <Link href="#how-it-works" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors">Nasıl Çalışır?</Link>
            <Link href="#pricing" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors">Fiyatlandırma</Link>
            <div className="h-6 w-px bg-border mx-2" />
            <Link href="/login" className="text-sm font-bold text-text-secondary hover:text-primary">Giriş Yap</Link>
            <Button onClick={() => router.push('/login')} size="md">Ücretsiz Başla</Button>
          </div>

          <button 
            className="md:hidden p-2 text-text-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-white animate-fade-in">
          <div className="p-5 flex justify-between items-center border-b border-border">
             <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="font-heading font-black">O</span>
              </div>
              <span className="font-heading font-bold">Orjut</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={28} className="text-text-primary" />
            </button>
          </div>
          <div className="flex-1 p-8 flex flex-col gap-6 text-center">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-text-primary">Özellikler</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-text-primary">Nasıl Çalışır?</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-text-primary">Fiyatlandırma</Link>
            <div className="mt-8 flex flex-col gap-4">
              <Button onClick={() => { setMobileMenuOpen(false); router.push('/login'); }} size="xl" fullWidth>Ücretsiz Başla</Button>
              <Button variant="ghost" onClick={() => { setMobileMenuOpen(false); router.push('/login'); }} size="lg">Giriş Yap</Button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-5 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-8 border border-primary-100">
            <span className="text-xl" aria-hidden="true">🛡️</span>
            <span className="text-sm font-extrabold text-primary uppercase tracking-wider">Enterprise AgTech Çözümü</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-text-primary leading-[1.1] mb-6 tracking-tight max-w-4xl">
            Tarlanızı Geleceğe Taşıyan<br />
            <span className="text-primary">Dijital İş Ortağınız</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed font-medium">
            Geleneksel tarım yöntemlerini yapay zeka ve veri analiziyle birleştirin. Arazi yönetimi, stok takibi ve zirai reçetelerle veriminizi maksimuma çıkarın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button onClick={() => router.push('/login')} size="xl" className="px-10" rightIcon={<ArrowRight size={20} />}>
              Hemen Ücretsiz Başla
            </Button>
            <Button variant="neutral" onClick={() => router.push('/login')} size="xl" className="px-10">
              Sisteme Gir
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <Check className="text-primary" size={18} /> ✓ Kurumsal Veri Güvenliği
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <Check className="text-primary" size={18} /> ✓ Proaktif AI Danışmanlığı
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <Check className="text-primary" size={18} /> ✓ NDVI Uydu Analizi
            </div>
          </div>

          {/* DASHBOARD MOCKUP - Real Generated UI Screenshot */}
          <div className="mt-20 hidden md:block w-full max-w-5xl mx-auto rounded-3xl border-8 border-white/10 shadow-2xl overflow-hidden relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
             <Image 
               src="/orjut_dashboard_mockup.png" 
               alt="Orjut ZiraiAsistan Dashboard Mockup" 
               width={1000}
               height={600}
               priority
               className="relative w-full h-auto rounded-2xl object-cover" 
             />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-text-primary mb-4 tracking-tight">
              Tarım İşinizi Kolaylaştıran Özellikler
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">
              Eski usül not defterlerini bir kenara bırakın. Dijital asistanınızla her şey kayıt altında.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} hoverable padding="lg" className="flex flex-col items-center text-center">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", f.bg)}>
                  <f.icon className={f.color} size={32} />
                </div>
                <h3 className="text-xl font-bold text-text-primary font-heading mb-3">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-text-primary mb-4 tracking-tight">
              3 Basit Adımda Başlayın
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connection line for desktop */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-primary/10 -translate-y-full z-0" />

             {[
               { step: "1", title: "Arazini Ekle", desc: "Tarlalarını haritadan seç veya ada-parsel numarasıyla ekle.", icon: Map },
               { step: "2", title: "Kayıtlarını Tut", desc: "Yapılan her masrafı ve işlemi anında uygulamaya kaydet.", icon: Wallet },
               { step: "3", title: "Akıllı Öneriler Al", desc: "AI asistanın verilerini analiz etsin, sana yol göstersin.", icon: Bot }
             ].map((s, i) => (
               <div key={i} className="flex flex-col items-center text-center relative z-10">
                 <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl shadow-primary/20">
                    {s.step}
                 </div>
                 <h3 className="text-2xl font-bold text-text-primary font-heading mb-3">{s.title}</h3>
                 <p className="text-text-secondary leading-relaxed font-medium max-w-xs">{s.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-surface-2 border-t border-border">
        <div className="max-w-7xl mx-auto px-5">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-text-primary mb-4 tracking-tight">
              Her Ölçeğe Uygun Paketler
            </h2>
            <p className="text-lg text-text-secondary font-medium">Temel özellikler her zaman ücretsiz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Free */}
             <Card padding="lg" className="flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary font-heading">Ücretsiz Başlangıç</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-primary">₺0</span>
                    <span className="text-text-secondary font-bold">/ay</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-text-secondary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> En Fazla 3 Arazi Takibi
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> Toplamda Maksimum 100 Dönüm
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> Temel Finans ve Stok Takibi
                  </div>
                </div>
                <Button variant="neutral" fullWidth onClick={() => router.push('/login')}>Hemen Başla</Button>
             </Card>

             {/* Pro */}
             <Card padding="lg" className="flex flex-col border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-black uppercase tracking-widest rounded-bl-lg z-10">
                   2 AY HEDİYE
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary font-heading">Hasat Pro</h3>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-text-primary">₺499</span>
                      <span className="text-text-secondary font-bold">/ay</span>
                    </div>
                    <p className="text-xs text-primary font-black mt-1 uppercase tracking-tighter">Yıllık 4.990 TL</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-text-primary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> Sınırsız Arazi Takibi
                  </div>
                  <div className="flex items-center gap-3 text-text-primary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> Maksimum 5000 Dönüm Sınırı
                  </div>
                  <div className="flex items-center gap-3 text-text-primary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> Proaktif Yapay Zeka Danışmanı
                  </div>
                  <div className="flex items-center gap-3 text-text-primary font-bold text-sm">
                    <Check className="text-primary flex-shrink-0" size={18} /> NDVI Uydu Haritaları ve Raporlama
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold bg-zinc-50 border border-zinc-100 p-2.5 rounded-lg leading-relaxed">
                     💡 5000 Dönüm üzeri araziler için özel kurumsal fiyatlandırma uygulanmaktadır.
                  </div>
                </div>
                <Button fullWidth onClick={() => router.push('/login')}>Pro&apos;ya Geç</Button>
             </Card>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
           <h2 className="text-3xl md:text-5xl font-heading font-black mb-8 leading-tight">
             Tarlanızın Geleceğini <br className="hidden md:block" /> Dijital Güçle Yönetin
           </h2>
           <p className="text-primary-100 text-lg md:text-xl mb-12 font-medium">
             Hemen kaydolun, 5 dakikada tarlalarınızı dijital dünyaya taşıyın.
           </p>
           <Button onClick={() => router.push('/login')} size="xl" className="bg-white text-primary hover:bg-primary-50 px-12">
             Şimdi Ücretsiz Hesap Oluştur
           </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-text-primary text-white py-16 px-5 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
             <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="font-heading font-black text-xl">O</span>
              </div>
              <span className="text-xl font-heading font-extrabold tracking-tight">
                Orjut <span className="text-primary">ZiraiAsistan</span>
              </span>
            </div>
            <p className="text-text-muted text-sm max-w-sm leading-relaxed font-medium">
              Türk tarımının dijitalleşme sürecinde çiftçilerimizin yanındayız. Sıfır veri kaybı, maksimum hasat vizyonuyla tarlalarınızı yönetmenizi sağlıyoruz.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Bağlantılar</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Özellikler</Link></li>
              <li><Link href="#how-it-works" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Nasıl Çalışır?</Link></li>
              <li><Link href="#pricing" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Fiyatlandırma</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">Yasal</h4>
            <ul className="space-y-4">
              <li><Link href="/legal/terms" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Kullanım Koşulları</Link></li>
              <li><Link href="/legal/privacy" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Gizlilik Politikası</Link></li>
              <li><Link href="/legal/refund" className="text-text-muted hover:text-white transition-colors text-sm font-bold">İptal ve İade Koşulları</Link></li>
              <li><Link href="/legal/distance-selling" className="text-text-muted hover:text-white transition-colors text-sm font-bold">Mesafeli Satış Sözleşmesi</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-sm font-medium">
           <p>© 2026 Kurtay Bilişim. Tüm hakları saklıdır.</p>
           <div className="flex gap-6">
              <a href="mailto:kurtayhasan@gmail.com" className="hover:text-white transition-colors">Bize Ulaşın</a>
              <Link href="/" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="/" className="hover:text-white transition-colors">Instagram</Link>
              <Link href="/" className="hover:text-white transition-colors">LinkedIn</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
