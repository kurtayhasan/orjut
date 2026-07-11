'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Kullanım Koşulları</h1>
        </div>

        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Hizmet Kapsamı</h2>
            <p>
              Kurtay Bilişim, tarımsal verimliliği artırmak için veri yönetimi, NDVI uydu analizi ve yapay zeka destekli danışmanlık hizmetleri sunan bir SaaS platformudur. 
              Sistemi kullanarak bu koşulları kabul etmiş sayılırsınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Abonelik ve Ödemeler</h2>
            <p>
              Platformdaki &quot;KOBİ Pro&quot; ve &quot;Kurumsal&quot; paketler yıllık abonelik modeliyle çalışır. 
              Ödemeler Sanal POS üzerinden güvenli bir şekilde alınır. Abonelik iptali durumunda, kalan süre için ücret iadesi yapılmaz ancak dönem sonuna kadar hizmete erişim devam eder.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. Kullanıcı Sorumlulukları</h2>
            <p>
              Kullanıcılar sisteme girdikleri verilerin doğruluğundan sorumludur. 
              Hatalı veri girişi kaynaklı yanlış analizlerden veya finansal kayıplardan Kurtay Bilişim sorumlu tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Hizmet Kesintileri</h2>
            <p>
              %99.9 çalışma süresi (uptime) hedeflesek de, bakım çalışmaları veya mücbir sebeplerden kaynaklı kısa süreli kesintiler yaşanabilir. 
              Planlı bakımlar önceden kullanıcılara bildirilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. Fikri Mülkiyet</h2>
            <p>
              Yazılımın tüm hakları Kurtay Bilişim&apos;e aittir. Yazılımın kopyalanması, tersine mühendislik yapılması veya izinsiz dağıtılması yasal işleme tabidir.
            </p>
          </section>
        </div>
        
        <div className="mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Son Güncelleme: 6 Mayıs 2026</p>
        </div>
      </div>
    </div>
  );
}
