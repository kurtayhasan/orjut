'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Scale, FileText, Lock } from 'lucide-react';

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors font-bold text-sm mb-8"
        >
          <ChevronLeft size={20} /> Geri Dön
        </button>

        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-indigo-100 text-indigo-600 p-4 rounded-3xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">Yasal Bilgilendirmeler</h1>
              <p className="text-zinc-500 font-medium">Orjut AgTech OS Kullanım ve Gizlilik Şartları</p>
            </div>
          </div>

          <div className="space-y-12">
            {/* KVKK Section */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Scale size={24} className="text-indigo-600" />
                KVKK Aydınlatma Metni
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Orjut AgTech OS (&quot;Platform&quot;) olarak, kişisel verilerinizin güvenliğine büyük önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, verilerinizin işlenme amaçları, hukuki sebepleri ve haklarınız konusunda sizi bilgilendirmek isteriz.
                </p>
                <p>
                  <strong>İşlenen Veriler:</strong> İsim, soyisim, telefon numarası ve arazi verileriniz (ada, parsel, koordinat).
                  <br />
                  <strong>İşleme Amacı:</strong> Tarımsal operasyonların yönetimi, verimlilik analizleri ve size özel ziraat danışmanlığı (AI Insights) hizmeti sunulması.
                </p>
                <p>
                  Verileriniz, platformun temel işlevlerini yerine getirebilmesi için Supabase altyapısında güvenli bir şekilde saklanmakta olup, üçüncü taraflarla reklam veya pazarlama amacıyla paylaşılmamaktadır.
                </p>
              </div>
            </section>

            {/* Gizlilik Politikası */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Lock size={24} className="text-emerald-600" />
                Gizlilik Politikası
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Platform, uçtan uca veri izolasyonu prensibiyle çalışır. Kaydettiğiniz her arazi ve finansal işlem, sadece sizin kullanıcı kimliğinizle eşleştirilir. Diğer kullanıcılar veya sistem yöneticileri, açık rızanız olmadan verilerinize erişemez.
                </p>
                <p>
                  AI tavsiyeleri oluşturulurken verileriniz anonimleştirilerek işlenir. Şifreleriniz ve hassas bilgileriniz modern güvenlik standartlarıyla korunur.
                </p>
              </div>
            </section>

            {/* Çerez Politikası */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <FileText size={24} className="text-amber-600" />
                Çerez Politikası
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Platform, oturumunuzu açık tutmak ve tercihlerinizi (dil seçimi vb.) hatırlamak için gerekli çerezleri (cookies) kullanır. Bu çerezler, kullanıcı deneyimini iyileştirmek için zorunludur.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-100 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Son Güncelleme: 1 Mayıs 2026
          </div>
        </div>
      </div>
    </div>
  );
}
