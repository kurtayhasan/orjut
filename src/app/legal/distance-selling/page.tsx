'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gavel } from 'lucide-react';

export default function DistanceSellingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Gavel size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Mesafeli Satış Sözleşmesi</h1>
        </div>

        <div className="prose prose-invert prose-blue max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. TARAFLAR</h2>
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <p><strong>SATICI:</strong> Kurtay Bilişim Teknoloji ve Yazılım A.Ş.</p>
              <p><strong>E-POSTA:</strong> kurtayhasan[at]gmail.com</p>
              <p><strong>ALICI:</strong> Sitede sunulan hizmetlerden faydalanan ve ödeme yapan kullanıcı.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. KONU</h2>
            <p>
              İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış ücreti belirtilen hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. HİZMETİN TESLİMİ</h2>
            <p>
              Sözleşme konusu hizmet, ALICI'nın ödeme işlemini başarıyla tamamlamasının ardından anında ALICI'nın kullanımına açılır. Hizmetin teslimi dijital ortamda gerçekleştiği için fiziksel bir kargo teslimatı söz konusu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. CAYMA HAKKI</h2>
            <p>
              Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca; <strong>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler"</strong> kapsamında cayma hakkı kullanılamaz. 
              ALICI, hizmetin satın alınmasıyla birlikte bu koşulu kabul etmiş sayılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. GENEL HÜKÜMLER</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>ALICI, internet sitesinde sözleşme konusu hizmetin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
              <li>Sözleşme konusu hizmetin ifası için işbu Sözleşme'nin elektronik ortamda teyit edilmesi ve satış bedelinin ALICI'nın tercih ettiği ödeme şekli ile ödenmiş olması şarttır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">6. YETKİLİ MAHKEME</h2>
            <p>
              İşbu sözleşmenin uygulanmasında, Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>
        
        <div className="mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Son Güncelleme: 15 Mayıs 2026</p>
        </div>
      </div>
    </div>
  );
}
