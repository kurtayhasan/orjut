'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-bold text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
            <Package size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Teslimat Politikası</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Teslimat Şekli</h2>
            <p>
              Kurtay Bilişim (Orjut Zirai Asistan), elektronik ortamda anında ifa edilen dijital bir hizmettir (SaaS - Software as a Service). 
              Bu nedenle, satın almış olduğunuz herhangi bir paket veya hizmet için <strong>fiziksel bir kargo teslimatı veya gönderimi yapılmamaktadır.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Teslimat Süresi</h2>
            <p>
              Kullanıcıların web sitemiz üzerinden kredi kartı veya diğer ödeme yöntemleriyle yapmış oldukları ödemeler onaylandığı anda, satın alınan dijital hizmetler ve ek özellikler (örneğin; Hasat Pro paketi erişimi, uydu haritaları kotası) <strong>anında kullanıcının hesabına tanımlanır.</strong>
            </p>
            <p>
              Herhangi bir teknik aksaklık veya gecikme durumunda sistem, hesaba erişimi en geç 24 saat içerisinde otomatik olarak günceller.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Teslimat Adresi</h2>
            <p>
              Sistem üzerinden satın alım işlemi gerçekleştirilirken fiziksel bir teslimat adresi talep edilmez. Tüm erişim hakları, kullanıcının sisteme kayıt olurken kullandığı telefon numarası veya e-posta adresi ile ilişkilendirilmiş hesabına dijital olarak tanımlanır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. İletişim</h2>
            <p>
              Teslimat süreçleri (hesaba paketin tanımlanmaması vb. teknik sorunlar) hakkında sorularınız veya destek talepleriniz için aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz:
            </p>
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4 mt-4">
              <p><strong>Şirket:</strong> Kurtay Bilişim Zirai Araştırma (Hasan Kurtay)</p>
              <p><strong>Adres:</strong> TEPEBAŞI MAH. 603 SK. Kapı No:3/C KIZILTEPE/MARDİN</p>
              <p><strong>Telefon:</strong> 0543 814 04 49</p>
              <p><strong>E-posta:</strong> kurtayhasan@gmail.com</p>
              <p><strong>Vergi No:</strong> 5960556836</p>
            </div>
          </section>
        </div>
        
        <div className="mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Son Güncelleme: 9 Ağustos 2026</p>
        </div>
      </div>
    </div>
  );
}
