'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/20">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors font-black text-xs uppercase tracking-widest mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Anasayfaya Dön
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Gizlilik Politikası</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-8 text-lg font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Veri Toplama ve Kullanımı</h2>
            <p>
              Kurtay Bilişim (&quot;Hizmet&quot;), çiftçilik operasyonlarınızı optimize etmek amacıyla arazileriniz, finansal işlemleriniz ve envanter verilerinizi toplar. 
              Bu veriler, Supabase altyapısı üzerinde güvenli bir şekilde saklanır ve yalnızca size hizmet sunmak, analizler (NDVI, AI Danışmanlık) üretmek için kullanılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Hesap Güvenliği</h2>
            <p>
              Oturum açma işlemleri Supabase Auth üzerinden telefon numarası veya Google OAuth ile gerçekleştirilir. 
              Kullanıcı şifreleri sistemimiz üzerinde açık metin olarak asla saklanmaz, endüstri standardı şifreleme yöntemleri ile korunur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. Üçüncü Taraf Paylaşımı</h2>
            <p>
              Verileriniz, yasal zorunluluklar haricinde asla üçüncü şahıslara satılmaz veya paylaşılmaz. 
              Mühendis (Danışman) rolündeki kullanıcılar, ancak siz onay verdiğiniz takdirde verilerinize erişebilirler.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Çerezler (Cookies)</h2>
            <p>
              Sistemimiz, oturumunuzu açık tutmak ve tercihlerinizi hatırlamak için temel çerezler kullanır. 
              Bu çerezler reklam veya takip amacıyla kullanılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. İletişim</h2>
            <p>
              Gizlilik politikamız hakkındaki sorularınız için <strong>kurtayhasan[at]gmail.com</strong> adresinden bize ulaşabilirsiniz.
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
