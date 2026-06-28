# ORJUT AGTECH OS — MASTER CONTEXT

> **SÜRÜM:** 2.0 (ENTERPRISE PRODUCTION FINAL)  
> **GÜNCELLEME TARİHİ:** 28 Haziran 2026  
> **DURUM:** CANLI YAYINA HAZIR (PRODUCTION READY)  
> **KAPSAM:** Ana Mimari ve Proje Genel Bağlamı

Bu doküman, Orjut AgTech OS platformunun **tek nihai gerçeğidir (Single Source of Truth)**. Tüm yazılım, veritabanı, yapay zeka ve altyapı kararları bu master doküman referans alınarak yürütülür.

---

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)

Orjut (ZiraiAsistan), tarım işletmelerinin; arazi sınırlarını, toprak durumlarını, tarımsal operasyonları (sulama, gübreleme, hasat vb.), depo envanterlerini ve finansal defterlerini tek bir noktadan akıllıca yönetmesini sağlayan yapay zeka (AI) ve coğrafi bilgi sistemi (CBS/GIS) tabanlı yeni nesil tarım işletim sistemidir. 

Sistem; çevrimdışı çalışabilme (PWA), akıllı asistan ile hava durumu destekli operasyon planlama ve ziraat mühendisleri ile doğrudan reçete/iletişim ağı kurma gibi özellikleri barındırır. 

---

## 2. PROJE VİZYONU

**Hedef:** Karmaşık tarımsal yönetim süreçlerini, çiftçilerin teknik detaylarda boğulmayacağı ("Progressive Disclosure" prensibi ile), "Apple esintili" premium bir arayüz ve otomatik akıllı tahmin modelleri ile basitleştirmek.
**Değer Önerisi:** Entegre olamayan onlarca uygulamayı (Hava durumu, harita, muhasebe, ziraat danışmanlığı) tek bir B2B SaaS platformunda toplayarak veri kopukluğunu bitirmek. 

---

## 3. KLASÖR YAPISI (FOLDER STRUCTURE)

Proje Next.js 14 App Router yapısına uygun olarak yapılandırılmıştır:

```text
orjut/
├── public/                      # Statik dosyalar, manifest.json, sw.js (PWA Worker)
├── src/
│   ├── app/                     # Next.js 14 App Router Sayfa ve API Dizinleri
│   │   ├── admin/               # Yönetici paneli
│   │   ├── api/                 # Serverless API uç noktaları (AI, Cron vb.)
│   │   ├── dashboard/           # Çiftçi kontrol paneli
│   │   ├── engineer/            # Ziraat mühendisi kontrol paneli
│   │   ├── invite/              # Mühendis-çiftçi eşleşme davet bağlantıları
│   │   └── login/               # Oturum açma ekranı
│   ├── components/              # Yeniden kullanılabilir React UI bileşenleri (Modals, Maps)
│   ├── context/                 # Global state ve çevrimdışı (offline) senkronizasyon (AppContext)
│   ├── hooks/                   # Özel React hook'ları
│   ├── lib/                     # İş mantığı, veritabanı DAO, AI prompt motorları ve utils
│   └── types/                   # TypeScript global tip tanımlamaları
├── supabase/                    # Supabase yerel konfigürasyon ve migration dosyaları
└── schema.sql                   # Sistemin temel SQL şeması, RLS ve fonksiyonları
```

---

## 4. GENEL MİMARİ (ARCHITECTURE)

Orjut, React tabanlı bir Frontend, Serverless API'ler ve Supabase (PostgreSQL) veritabanının uyumlu bir kombinasyonudur.
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS. Çevrimdışı destekli (PWA). Harita ve CBS işlemleri Leaflet ve Turf.js ile yapılır.
* **Backend:** Next.js Serverless Route Handlers. Supabase RPC ve PostgreSQL Triggers üzerinden veritabanı işlemleri yürütülür.
* **Veritabanı:** Supabase (PostgreSQL). Tamamen Row Level Security (RLS) politikaları ile izole edilmiştir.
* **Yapay Zeka (AI):** `@google/genai` ve `@google/generative-ai` SDK'ları üzerinden Gemini 3.1 Flash Lite ve 1.5 Flash modelleri ile RAG (Retrieval-Augmented Generation) mimarisi koşturulur.
* **Dış Entegrasyonlar:** Open-Meteo (Hava Durumu), AgroMonitoring (NDVI Uydu verisi).

---

## 5. GÜVENLİK (SECURITY)

Güvenlik mekanizması üç farklı katmanda uygulanır:
1. **İstemci Tarafı (Client-Side):** `AuthGuard.tsx` bileşeni ile kullanıcı oturum açmadan veya yetkisi olmayan sayfalara girmeye çalıştığında anında yönlendirilir.
2. **API Tarafı (Serverless):** Next.js API route'ları (`/api/*`), gelen isteklerde Supabase session token doğrulaması (JWT validation) yapar.
3. **Veritabanı Tarafı (Row Level Security - RLS):** Sistemdeki her tabloda RLS aktiftir. Her çiftçi yalnızca kendi `org_id`sine sahip verileri görebilir, ekleyebilir veya silebilir. Veritabanı sorgularında "N+1" veya "Sonsuz Döngü (Infinite Recursion)" hataları SQL yetki politikalarında optimize edilmiştir.

---

## 6. DEVOPS VE DAĞITIM (DEPLOYMENT)

* **Deployment:** Vercel üzerinden serverless (sunucusuz) ortamda yayınlanmaktadır (`vercel.json` destekli).
* **CI/CD:** GitHub entegrasyonu ile ana (main) dala yapılan push'larda otomatik build ve deploy süreçleri işler.
* **Environment Variables:** Veritabanı ve AI bağlantıları için `.env.local` kullanılır. Temel değişkenler:
  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `GEMINI_API_KEY`
* **Loglama ve İzleme (Monitoring):** Next.js ve Vercel'in yerleşik analitikleri üzerinden istek takip edilir; Supabase tarafında ise veritabanı performans (query) analizörleri kullanılır.

---

*(Detaylı teknik akışlar, veri modeli ve API referansları için sistemin diğer referans belgelerine bakınız.)*
