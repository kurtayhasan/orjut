'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <RefreshCw size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">İptal ve İade Koşulları</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Hizmet Niteliği ve Cayma Hakkı İstisnası</h2>
            <p>
              Kurtay Bilişim, elektronik ortamda anında ifa edilen bir SaaS (Software as a Service) hizmetidir. 
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca; 
              <strong> &quot;Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallar&quot;</strong> cayma hakkı kapsamı dışındadır.
            </p>
            <p>
              Hizmetin kullanımı, kullanıcı girişi yapıldığı ve dijital içeriklere (analizler, stok takibi, uydu verileri vb.) erişildiği andan itibaren başlamış kabul edilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Abonelik İptali</h2>
            <p>
              Kullanıcılar, yıllık veya aylık aboneliklerini istedikleri zaman &quot;Hesap Ayarları&quot; paneli üzerinden iptal edebilirler. 
              İptal işlemi, o anki fatura döneminin sonuna kadar olan erişiminizi etkilemez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. İade Şartları</h2>
            <p>
              SaaS modelinde sunulan dijital hizmetlerimizin doğası gereği, abonelik başlangıcından sonra kullanımın gerçekleştiği durumlarda ücret iadesi yapılmamaktadır. 
              Ancak teknik bir aksaklık sebebiyle hizmetin 48 saatten uzun süre kesintiye uğraması ve sorunun SATICI kaynaklı olduğunun tespiti durumunda, kullanıcıya kullandığı gün kadarlık tutar mahsup edilerek kısmi iade yapılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Teknik Hatalar</h2>
            <p>
              Sistemden kaynaklanan mükerrer ödeme veya yanlış paket alımı gibi durumlarda, durumun tespitinden sonraki 7 iş günü içerisinde iade işlemi POS sistemi üzerinden başlatılır. 
              İadenin hesaba yansıma süresi bankadan bankaya değişiklik gösterebilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. İletişim</h2>
            <p>
              İptal ve iade taleplerinizle ilgili her türlü soru için <strong>kurtayhasan[at]gmail.com</strong> adresine e-posta gönderebilirsiniz.
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
