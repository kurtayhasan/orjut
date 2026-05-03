'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Scale, FileText, Lock, Sparkles } from 'lucide-react';

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
            {/* KVKK & GDPR Section */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Scale size={24} className="text-indigo-600" />
                KVKK ve GDPR Aydınlatma Metni
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Orjut AgTech OS (&quot;Platform&quot;) olarak, kişisel verilerinizin güvenliğine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (&quot;GDPR&quot;) standartları uyarınca, verileriniz şeffaflık, hukuka uygunluk ve dürüstlük kuralları çerçevesinde işlenmektedir.
                </p>
                <p>
                  <strong>İşlenen Veriler:</strong> Ad, soyad, iletişim bilgileri, finansal işlemleriniz ve tarımsal arazi bilgileriniz (ada, parsel, coğrafi koordinatlar).
                  <br />
                  <strong>İşleme Amacı:</strong> Tarımsal operasyonlarınızın uçtan uca dijital olarak yönetilmesi, maliyet/verimlilik analizlerinin yapılması ve operasyonel kararlarınızı destekleyecek sistem özelliklerinin sunulması.
                </p>
                <p>
                  Verileriniz, veri güvenliği standartlarına uygun şekilde (şifrelenerek) bulut altyapısında (Supabase) saklanmakta olup, yasal bir zorunluluk olmadığı sürece hiçbir üçüncü tarafla ticari veya pazarlama amacıyla <strong>kesinlikle paylaşılmamaktadır.</strong> Size ait tüm verileri dilediğiniz an sistemden kalıcı olarak silme hakkına (Unutulma Hakkı - GDPR Article 17) sahipsiniz.
                </p>
              </div>
            </section>

            {/* AI ve Anonim Veri Kullanımı */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Sparkles size={24} className="text-indigo-600" />
                Yapay Zeka (AI) ve Anonim Veri Kullanımı
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Platform içerisinde yer alan &quot;Günlük Zirai Analiz ve Yapay Zeka Tavsiyeleri&quot; özelliği, küresel teknoloji standartlarında büyük dil modelleri kullanılarak sunulmaktadır.
                </p>
                <p>
                  <strong>Kişisel Veri İzolasyonu:</strong> Yapay zeka motorlarına veri gönderilirken, sistemimiz kesinlikle <strong>adınız, soyadınız, iletişim bilgileriniz, kesin finansal dökümleriniz veya tam arazi lokasyonunuz (PII - Kişisel Tanımlanabilir Bilgiler)</strong> gibi özel verileri aktarmaz.
                </p>
                <p>
                  Yapay zeka modellerine sadece tavsiye üretebilmeleri için gerekli olan <strong>tamamen anonimleştirilmiş tarımsal üst veriler</strong> (bölgesel hava durumu, yetiştirilen mahsul türü ve ekim gün sayısı) iletilir. Bu anonim veriler, AI servis sağlayıcıları tarafından sizinle ilişkilendirilemez, profillenemez veya üçüncü parti dil modellerini eğitmek amacıyla kullanılamaz (Zero Data Retention Prensibi).
                </p>
              </div>
            </section>

            {/* Gizlilik Politikası */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Lock size={24} className="text-emerald-600" />
                Gizlilik ve Veri Güvenliği
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Platform, uçtan uca veri izolasyonu prensibiyle çalışır. Kaydettiğiniz her arazi, not ve finansal işlem, sadece sizin kullanıcı kimliğinizle eşleştirilir (Row Level Security - RLS). Platforma davet etmediğiniz sürece diğer kullanıcılar veya sistem yöneticileri verilerinize erişemez.
                </p>
                <p>
                  Kullanıcı şifreleriniz ve hassas kimlik doğrulama bilgileriniz şifrelenmiş (Hashed) olarak tutulur. Orjut, bu bilgileri göremez ve değiştiremez.
                </p>
              </div>
            </section>

            {/* Çerez Politikası */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <FileText size={24} className="text-amber-600" />
                Çerez (Cookie) Politikası
              </h2>
              <div className="text-zinc-600 leading-relaxed space-y-4 text-sm font-medium">
                <p>
                  Platform, sadece oturumunuzu açık tutmak, güvenlik doğrulamalarını sağlamak ve tercihlerinizi hatırlamak (Örn: Çevrimdışı verilerin eşitlenmesi) amacıyla <strong>zorunlu yerel depolama teknolojileri (Local Storage / Session)</strong> kullanır. 
                  Üçüncü taraf takip (tracking) veya reklam çerezleri platformumuzda kesinlikle kullanılmamaktadır.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-100 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>
    </div>
  );
}
