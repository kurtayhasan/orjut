# ORJUT — Tam Proje Rehberi, Dosya Haritası, Spagetti Analizi ve Dikey Büyüme Eksikleri

> **Amaç:** Bu belge, Orjut AgTech OS kod tabanının **tek noktadan** okunabilir özetidir.  
> Hangi klasör/dosya ne işe yarar, mimari nasıl akar, nerede spagetti riski vardır, dikey büyüme için ne eksiktir — hepsi burada anlatılır.  
> **Tarih:** 2026-07-11 · **Son yapı senkronu:** 2026-07-11 (production cleanup)  
> **Tek canlı doküman:** `docs/ORJUT_TAM_PROJE_REHBERI.md` (+ kök `README.md`)  
> **Not:** Bu dosya anlatım içindir; canlı kod yerine geçmez.

---

## Proje Dosya Yapısı (Canonical senkron — Son Güncelleme: 2026-07-11)

> Production cleanup + kanonik `src/lib` & `src/components` taşımaları sonrası.  
> **URL rotaları değiştirilmedi** (`/dashboard/*` aynı) — route group rename ayrı PR.  
> Her büyük PR sonrası dosya ağacını kontrol et.

```
orjut/
├── .env.example
├── .env.local                          # gizli — commit etme
├── README.md
├── package.json | next.config.mjs | tailwind.config.ts | tsconfig.json | vercel.json
│
├── docs/
│   ├── ORJUT_TAM_PROJE_REHBERI.md      # TEK proje rehberi
│   └── archive/                        # SQL yedek, scratch, deploy notları
│
├── public/                             # sw.js, icons, screenshots
├── supabase/
│   ├── migrations/                     # production SQL pipeline
│   └── functions/
│
└── src/
    ├── middleware.ts
    ├── types/index.ts
    ├── app/                            # App Router (login, dashboard, api, legal…)
    ├── components/
    │   ├── forms/                      # ExpenseForm, LandForm
    │   ├── maps/                       # MapContainer, hooks/useAgroMonitoring
    │   ├── shared/                     # OfflineIndicator, ErrorBoundary, EmptyState, LoadingSpinner
    │   ├── ui/ | budget/ | lands/ | receipts/
    │   └── AuthGuard, Header, Sidebar, …
    ├── context/                        # AppContext + hooks (composition only in AppContext)
    ├── hooks/
    ├── lib/
    │   ├── db.ts
    │   ├── supabase/                   # client.ts, server.ts, middleware.ts
    │   ├── offline/                    # offlineCache, offlineQueue, syncEngine
    │   ├── ai/                         # gemini, prompts, embeddings, ragEngine
    │   ├── geo/                        # turf, geometry
    │   ├── validators/schemas.ts       # tüm Zod şemaları
    │   ├── weatherService.ts | rateLimit | utils | translations…
    └── services/                       # agroService, geocoding
```

### Kanonik taşıma notu (2026-07-11 — onaylı)

| Yapıldı | Bilinçli ertelendi |
|---------|-------------------|
| docs tek kaynak + archive | `src/app` route groups (`(auth)` / `ai-insight` URL rename) |
| `lib/supabase/*`, `lib/offline/*`, `lib/ai/*`, `lib/geo/*`, `lib/validators` | MapDraw/MapView full split (MapContainer hâlâ monolit) |
| forms/maps/shared klasörleri | Finance offline queue |
| `.env.example` | Middleware redirect re-enable |

---

## 1. Proje nedir? (30 saniyelik özet)

**Orjut**, tarım işletmeleri için bir **AgTech SaaS / işletim sistemi** adayıdır:

| Rol | Ne yapar? |
|-----|-----------|
| **Çiftçi (farmer)** | Arazi, sulama, tarla işlemi, gözlem (scouting), finans, stok, sezon, AI tavsiye |
| **Ziraat mühendisi (engineer)** | Çiftçi bağlantısı, danışmanlık paneli |
| **Admin** | Kullanıcı/premium/rol yönetimi |

**Teknoloji iskeleti:**

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind + Leaflet harita
- **State:** React Context (`AppContext`) — asıl mantık hook dosyalarına ayrılmış
- **Backend-as-a-Service:** Supabase (Auth + PostgreSQL + RLS)
- **AI:** Google Gemini (günlük insight, chat, embedding/RAG altyapısı)
- **Dış veri:** Open-Meteo (hava + toprak), AgroMonitoring (kısmi/planlı), geocode API
- **PWA:** Service Worker (`public/sw.js`), offline snapshot + write queue (kısmi)

**Organizasyon modeli:** Çoğu tabloda `org_id` ≈ sahip kullanıcı UUID’si. Veri izolasyonu RLS ile hedeflenir.

---

## 2. Büyük resim — veri ve istek akışı

```
Kullanıcı (mobil/PWA tarayıcı)
    │
    ├─ AuthGuard + (zayıf) middleware ──► Supabase Auth
    │
    ├─ AppProvider
    │     ├─ useAuthLogic      (oturum, profil, rol, activeOrgId)
    │     ├─ useFinanceLogic   (masraf, stok)
    │     ├─ useFarmLogic      (arazi, sulama, ops, scouting, AI istek)
    │     ├─ useUILogic        (tema, dil, sidebar, modal)
    │     └─ useAppSync        (paralel hydrate + offlineCache okuma)
    │
    ├─ Dashboard sayfaları ──► useAppContext() ile state/CRUD
    │
    ├─ LeafletMap / formlar ──► db.ts ──► Supabase JS client
    │
    ├─ Offline create ──► offlineQueue (localStorage) ──► NetworkStatus flush ──► db.insert*
    │
    └─ /api/ai/* , /api/geocode ──► Gemini / dış servisler (server)
```

**Önemli mimari kural (proje sözleşmesi):**

- `AppContext.tsx` **sadece composition** (hook’ları birleştirir). İş mantığı, `useEffect` yığınları ve state oraya yazılmaz.
- Mantık → `src/context/hooks/*`
- Servisler → `src/lib/*`, `src/services/*`
- Mock veri üretiminden kaçınılır; AI için gerçek hava/toprak verisi hedeflenir.

---

## 3. Kök dizin yapısı (genel)

```
orjut/
├── src/                    # Asıl uygulama kodu
├── public/                 # Statik asset + Service Worker
├── supabase/               # Edge functions + sıralı migrations
├── scratch/                # Geçici/doğrulama scriptleri (üretim değil)
├── node_modules/           # Bağımlılıklar
├── *.md                    # Mimari / ürün / pipeline dokümanları (çok sayıda)
├── *.sql                   # Kökte dağınık migration / fix scriptleri
├── package.json            # Bağımlılık ve scriptler
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json             # Deploy / cron ipuçları
└── .env.local              # Gizli env (repoya commit edilmez)
```

Aşağıda her katman **anlatıcı** şekilde açılır.

---

## 4. `src/app` — Sayfalar ve API rotaları (Next.js App Router)

Next.js’te klasör yolu ≈ URL. `page.tsx` sayfayı, `layout.tsx` ortak sarmalayıcıyı, `route.ts` API endpoint’ini tanımlar.

### 4.1 Kök uygulama kabuğu

| Dosya | Amaç |
|-------|------|
| `src/app/layout.tsx` | Root layout: font, provider’lar, global shell |
| `src/app/globals.css` | Global CSS / Tailwind giriş |
| `src/app/page.tsx` | **Landing (TR)** — pazarlama ana sayfa (~350+ satır) |
| `src/app/manifest.ts` | PWA manifest |
| `src/app/robots.ts` | SEO robots |
| `src/app/sitemap.ts` | Sitemap |

### 4.2 Kimlik ve erişim

| Dosya | Amaç |
|-------|------|
| `src/app/login/page.tsx` | Telefon/OTP veya mevcut auth akışı ile giriş |
| `src/app/invite/[token]/page.tsx` | Mühendis davet linki; login yoksa `pending_invite_engineer_id` localStorage |
| `src/app/delete-account/page.tsx` | Hesap silme / KVKK yönlü sayfa |

### 4.3 Dashboard (çiftçi operasyon alanı)

Layout: `src/app/dashboard/layout.tsx` — sidebar, header, AuthGuard sarmalı.  
Hata UI: `src/app/dashboard/error.tsx`.

| Rota | Dosya | Ne işe yarar? |
|------|-------|----------------|
| `/dashboard` | `dashboard/page.tsx` | Ana özet: hava, insight, hızlı aksiyonlar |
| `/dashboard/lands` | `lands/page.tsx` | Arazi listesi + harita entegrasyonu (büyük sayfa) |
| `/dashboard/irrigation` | `irrigation/page.tsx` | Sulama kayıtları |
| `/dashboard/operations` | `operations/page.tsx` | Tarla işlemleri (gübre, ilaç, hasat…) |
| `/dashboard/scouting` | `scouting/page.tsx` | Gözlem / sağlık notları / reçete döngüsü |
| `/dashboard/finance` | `finance/page.tsx` | Gelir-gider / bütçe görünümü |
| `/dashboard/inventory` | `inventory/page.tsx` | Stok (tohum, gübre, yakıt…) |
| `/dashboard/seasons` | `seasons/page.tsx` | Sezon aç/kapa |
| `/dashboard/ai` | `ai/page.tsx` | AI sohbet / analiz UI |
| `/dashboard/clients` | `clients/page.tsx` | Çiftçi tarafı mühendis istekleri |
| `/dashboard/settings` | `settings/page.tsx` | Profil, abonelik, tercihler |

### 4.4 Admin ve mühendis panelleri

| Rota | Dosya | Amaç |
|------|-------|------|
| `/admin` | `admin/page.tsx` + `layout.tsx` | Premium onay, rol atama, sistem bakışı (manuel operasyon) |
| `/engineer` | `engineer/page.tsx` + `layout.tsx` | Mühendis-müşteri (farmer) listesi ve ilişki yönetimi |

### 4.5 Yasal ve dil

| Alan | Dosyalar | Amaç |
|------|----------|------|
| TR legal | `legal/*` (privacy, terms, refund, distance-selling) | KVKK / mesafeli satış / iade metinleri |
| EN | `en/page.tsx`, `en/legal/*` | İngilizce landing ve yasal sayfalar |

### 4.6 API Route Handlers (`src/app/api`)

Sunucu tarafında çalışır; API key’ler burada kalmalıdır (mümkün olduğunca).

| Endpoint | Dosya | Amaç |
|----------|-------|------|
| `POST /api/ai/chat` | `api/ai/chat/route.ts` | Dashboard AI sohbet (Gemini, rate limit, session) |
| `POST /api/ai/daily-insight` | `api/ai/daily-insight/route.ts` | Günlük tarla aksiyon planı / insight |
| `POST /api/ai/analyze` | `api/ai/analyze/route.ts` | Daha ağır arazi analizi (zod validasyon) |
| `GET/POST /api/cron/daily-briefing` | `api/cron/daily-briefing/route.ts` | Zamanlanmış günlük brifing (Vercel cron) |
| `... /api/geocode` | `api/geocode/route.ts` | Geocoding proxy (key sızdırmamak için) |
| `... /api/user/export` | `api/user/export/route.ts` | Kullanıcı veri dışa aktarımı (KVKK/GDPR) |

---

## 5. `src/components` — UI bileşenleri

### 5.1 Kabuk ve güvenlik

| Dosya | Amaç |
|-------|------|
| `AuthGuard.tsx` | Client-side oturum + rol koruması; offline’da cached `user_id`/`user_role`; invite bind |
| `Header.tsx` | Üst bar; `NetworkStatus` burada |
| `Sidebar.tsx` | Sol menü (dashboard navigasyon) |
| `BottomBar.tsx` | Mobil alt bar (hızlı masraf vs.) |
| `NetworkStatus.tsx` | Online/offline banner; **offlineQueue flush** tetikler |
| `ServiceWorkerRegister.tsx` | `sw.js` kaydı |
| `CookieConsent.tsx` | Çerez onayı (localStorage) |
| `ErrorBoundary.tsx` | React hata sınırı |
| `EmptyState.tsx` / `Skeleton.tsx` | Boş durum ve yükleme iskeleti |

### 5.2 İş modalları ve formlar

| Dosya | Amaç |
|-------|------|
| `ExpenseModal.tsx` | Masraf girişi; envanter + hibrit tarla uygulaması (büyük, karmaşık) |
| `EndOfDayModal.tsx` | Gün sonu özet / kapanış |
| `receipts/ReceiptUpload.tsx` | Fiş yükleme; offline’da base64 placeholder riski |
| `collaborators/InviteCollaborator.tsx` | İşbirlikçi davet UI |
| `map/LandFormModal.tsx` | Arazi form modalı |
| `lands/LandTimeline.tsx` | Arazi zaman çizelgesi |
| `lands/LandMovementsModal.tsx` | Arazi hareketleri |

### 5.3 Harita (GIS)

| Dosya | Amaç |
|-------|------|
| `LeafletMap.tsx` | **En büyük UI dosyası (~750+ satır)** — çizim, Turf alan hesabı, centroid, addLand/updateLand. Spagetti riskinin merkez üssü. |
| `map/hooks/useAgroMonitoring.ts` | Uydu/agro izleme hook’u |

### 5.4 Bütçe görselleri

| Dosya | Amaç |
|-------|------|
| `budget/BudgetProgressBar.tsx` | Bütçe ilerleme |
| `budget/CategoryPieChart.tsx` | Kategori pasta grafik (Recharts) |
| `budget/CategorySummaryBar.tsx` | Kategori özet bar |

### 5.5 Tasarım sistemi (`components/ui`)

| Dosya | Amaç |
|-------|------|
| `Button.tsx`, `Input.tsx`, `Card.tsx`, `BaseModal.tsx` | Temel UI primitive’ler |
| `PremiumUpsellModal.tsx` | Hasat Pro yükseltme satışı |

---

## 6. `src/context` — Global state mimarisi

### 6.1 `AppContext.tsx`

- **Rolü:** Tüm hook çıktılarını tek `AppProvider` altında birleştirir; `useAppContext()` ile sayfalara sunar.
- **Yapması gereken:** Sadece wiring (composition).
- **Özel wiring:** Finance ↔ Farm çapraz bağımlılık:
  - `addExpense` → hibritte `farm.addFieldOperation` çağırır
  - `useFarmLogic` stok düşümü için `finance.updateInventoryItem` alır
- **Dikkat:** `useFinanceLogic(activeOrgId, null)` — activeSeason burada `null` geçiliyor; sezon expense’e AppContext sarmalayıcısından enjekte ediliyor. Bu kırılgan bir nokta.
- **`syncNow`:** Bugün pratikte profil yenile + **sayfa reload** — “akıllı sync” değil.

### 6.2 Hook dosyaları (`src/context/hooks`)

| Dosya | Sorumluluk | Not |
|-------|------------|-----|
| `useAuthLogic.ts` | Session, profil, rol, `activeOrgId`, demo/premium sinyalleri | localStorage `user_id` ile offline güven |
| `useFarmLogic.ts` | Lands, seasons, irrigation, ops, scouting, weather, daily insight; **offline create V1** | ~500 satır; büyümüş, hâlâ yönetilebilir |
| `useFinanceLogic.ts` | Transactions, inventory, expense CRUD | **Offline queue yok** (sadece online) |
| `useAppSync.ts` | İlk hydrate: paralel `db.get*` + `offlineCache` yaz/oku; flush sonrası refresh | Offline read snapshot |
| `useUILogic.ts` | Tema, dil, sidebar, upsell, expense modal flag | Hafif |

---

## 7. `src/lib` — Çekirdek kütüphaneler

| Dosya | Amaç (anlatım) |
|-------|----------------|
| `db.ts` | **Tek veri erişim yüzeyi.** Supabase `from(...)` sarmalayıcı: lands, tx, seasons, irrigation, ops, scouting, inventory, engineer_clients, AI history, premium limit kontrolleri, `apply_expense_atomic` RPC. |
| `supabase.ts` | Tarayıcı Supabase client |
| `supabaseServer.ts` | Server component / route için cookie-aware client |
| `weatherService.ts` | Open-Meteo forecast; `weather_cache_{lat}_{lon}` TTL 1 saat |
| `offlineCache.ts` | Sync snapshot: geometry strip, log limit, ~1.5MB soft cap, quota recovery |
| `offlineQueue.ts` | Offline **yazma** kuyruğu: land/scouting/irrigation/field_op insert; FIFO flush; temp→UUID map |
| `aiActionEngine.ts` | AI prompt inşası (hava + toprak + arazi context) |
| `ragEngine.ts` | Arazi bağlamı + embedding arama iskeleti (NDVI, ops, scouting…) |
| `embeddings.ts` | Gemini `text-embedding-004` |
| `rateLimit.ts` | API istek kısıtlama (chat vb.) |
| `notifications.ts` | Push / bildirim yardımcıları |
| `reportGenerator.ts` | PDF/rapor üretimi (jspdf) |
| `utils.ts` | `cn()` vb. genel yardımcılar |
| `translations.ts` | TR/EN sözlük (dashboard metinleri) |
| `translations/landing.ts` | Landing metinleri |
| `validation-messages.ts` | Form hata mesajları |
| `schemas/auth.schema.ts` | Zod auth şemaları |
| `schemas/land.schema.ts` | Arazi validasyonu |
| `schemas/operation.schema.ts` | Tarla işlemi validasyonu |

---

## 8. `src/services` — Dış servis adaptörleri

| Dosya | Amaç |
|-------|------|
| `agroService.ts` | AgroMonitoring denemesi + **Open-Meteo soil** (`fetchOpenMeteoSoilData`) — gerçek saha verisi için tercih edilen yol |
| `geocoding.ts` | Geocoding yardımcıları (client veya ortak) |

**Neden ayrı servis?** `weatherService` bozulmadan yeni kaynak eklemek; mimari kural ile uyumlu.

---

## 9. `src/hooks` — Sayfa-bağımsız React hook’ları

| Dosya | Amaç |
|-------|------|
| `useCategoryTotals.ts` | Finans kategori toplamları (dashboard/finance) |
| `useWeather.ts` | Hava durumu hook’u (context dışı kullanım için) |

Context hook’ları ile karıştırılmamalı: bunlar genelde daha dar scope.

---

## 10. `src/types/index.ts` — Domain modelleri

Tek tip kaynağı:

- `Profile`, `PaymentStatus`, `Land` (geometry/boundaries, lat/lng, crop…)
- `Transaction` (`isPending?` offline UI)
- `InventoryItem`, `Season`
- `ScoutingLog`, `FieldOperation`, `IrrigationLog` (`isPending?` eklendi)
- UI prop tipleri (`ButtonProps`, modal props…)

**Eksik / gevşek noktalar:** Birçok yerde hâlâ `any`; GeoJSON tipleri sıkı değil (`geometry?: any`).

---

## 11. `src/middleware.ts`

- Supabase SSR client ile `getUser()` çağırır.
- **Korunan rotalara redirect şu an YORUM satırı** — “redirect loop” riski yüzünden devre dışı.
- Gerçek koruma büyük ölçüde **`AuthGuard` (client)**’a bırakılmış.

**Dikey büyüme riski:** SEO botları / doğrudan URL / JS kapalı senaryoda server-side koruma zayıf.

---

## 12. `public/` — Statik ve PWA

| Dosya | Amaç |
|-------|------|
| `sw.js` | Service Worker: static cache, offline fallback (API için JSON hata) |
| `icon-*.png`, `apple-touch-icon.png`, `icon.svg` | PWA ikonları |
| `screenshot-*.png`, mockup | Mağaza / landing görselleri |

**Eksik:** Harita tile offline cache yok (TECH_DEBT ile uyumlu).

---

## 13. `supabase/` — Backend edge ve migrations

### 13.1 Edge Functions

| Fonksiyon | Amaç |
|-----------|------|
| `functions/daily-briefing/` | Günlük brifing üretimi (Deno) |
| `functions/fetch-market-prices/` | Piyasa fiyatı çekme |

### 13.2 Sıralı migrations (`supabase/migrations/`)

Örnekler:

- sezonlar, receipt kolonları, push subscriptions
- collaborators, expense categories, market prices
- `enable_rls.sql`

### 13.3 Eski dağınık SQL (cleanup sonrası)

Kökte duran `schema.sql`, `migration.sql`, `fix_*.sql` vb. dosyalar **2026-07-11** itibarıyla `docs/archive/sql/` altına taşındı.  
**Production pipeline:** yalnızca `supabase/migrations/*`.  
Arşiv SQL’ler referans/yedek içindir; yeni ortamda otomatik uygulanmaz.

---

## 14. Doküman dosyaları

| Dosya | İçerik |
|-------|--------|
| `README.md` | Next.js bootstrap / dev start |
| **`docs/ORJUT_TAM_PROJE_REHBERI.md`** | **Tek kanonik proje rehberi (bu belge)** |
| `docs/archive/*` | Cleanup sonrası arşiv (SQL yedekleri, scratch, deploy notları) — üretim kodu değil |

**2026-07-11 cleanup:** Root’taki çoğaltılmış mimari/pipeline md dosyaları (`ROADMAP`, `TECH_DEBT`, `MASTER_*`, `*_ARCHITECTURE`, vb.) silindi. Bilgi bu rehbere devredildi veya arşivlenmedi (silinen md’ler git history’de kalır).

---

## 15. Konfigürasyon ve env

| Dosya | Amaç |
|-------|------|
| `package.json` | next, supabase, leaflet, turf, gemini, recharts, zod, jspdf… |
| `next.config.mjs` | Next ayarları |
| `tailwind.config.ts` | Tasarım token’ları |
| `tsconfig.json` | Path alias `@/*` → `src/*` |
| `vercel.json` | Deploy / cron |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_*`, `GEMINI_API_KEY`, `NEXT_PUBLIC_AGRO_API_KEY`, `NEXT_PUBLIC_DEFAULT_LAT/LON` vb. |

**Kural:** Koordinat default’ları ve API key’ler env’de olmalı; hardcode azaltılmalı (farm AI’da hâlâ bazı fallback lat/lon env ile okunuyor — iyi yönde).

---

## 16. Kritik iş akışları (anlatıcı)

### 16.1 Giriş ve hydrate

1. Kullanıcı `/login` → Supabase session  
2. `AuthGuard` session doğrular; `user_id` / rol cache  
3. `useAppSync` org için lands, tx(20), seasons, irrigation, ops, scouting, inventory çeker  
4. Finans toplamları için **ikinci, limitsiz** transaction fetch  
5. Snapshot `offlineCache` ile yazılır (slim lands)

### 16.2 Online CRUD (farm)

`useFarmLogic` → `db.insert*` → local state güncelle → toast.

### 16.3 Offline create (V1 — farm)

1. `navigator.onLine === false` veya network fail  
2. `offlineQueue.enqueue` (`orjut_pending_queue`)  
3. Optimistic satır (`temp_*`, `isPending: true`)  
4. Online: `NetworkStatus` → `flushQueue` (lands önce, id map)  
5. `orjut:offline-queue-flushed` → `useAppSync.refreshAllData`

**V1 dışı:** update/delete offline, expense/inventory offline, offline arazi polygon’u (kuyrukta strip).

### 16.4 AI günlük insight

1. `requestWeatherAndInsight` (farm)  
2. Open-Meteo weather + soil  
3. `buildAIPrompt`  
4. `POST /api/ai/daily-insight`  
5. State: `dailyInsight`, `criticalAlert`

### 16.5 Premium

- Free: arazi sayısı / dekar limitleri `db.insertLand` içinde  
- Onay: admin panel manuel (`payment_status`)  
- Otomatik POS: **eksik** (TECH_DEBT)

---

## 17. Spagetti kod kontrolü (dürüst değerlendirme)

### 17.1 Genel skor

| Alan | Durum | Yorum |
|------|--------|-------|
| Context ayrıştırması | **İyi** | AppContext ince; hook’lara bölünmüş |
| `db.ts` tek kapı | **İyi** | Dağınık supabase.from çağrıları azalmış |
| Offline katmanı | **Orta-iyi** | Cache + queue ayrık lib; finance bağlanmadı |
| Sayfa / harita boyutu | **Zayıf** | God-component’ler var |
| Tip güvenliği | **Zayıf** | ~100+ `any` kullanımı (src genelinde yoğun) |
| Doküman ↔ kod | **Zayıf** | Ideal mimari ile gerçek kod sapıyor |
| Test | **Kritik eksik** | Otomatik test suite görünmüyor |
| SQL kaynak yönetimi | **Zayıf** | Çoklu migration kökü |

**Sonuç:** Klasik “her şey bir dosyada” spagettisi **kısmen temizlenmiş**; hâlâ **lokal spagetti cepleri** ve **mimari idealizm–gerçeklik gerilimi** var. Proje “yeniden yazılmalı” seviyesinde değil; “büyümeden önce sertleştirilmeli” seviyesinde.

### 17.2 Spagetti / risk cepleri (öncelik sırasıyla)

#### A) `LeafletMap.tsx` (~750+ satır) — **Yüksek**

- Harita init, draw, Turf, form submit, premium upsell, state bir arada  
- `any` ve yan etki yoğun  
- **Öneri:** `useMapDraw`, `useLandGeometry`, presentational `MapCanvas`, container ayır

#### B) `ExpenseModal.tsx` + hibrit finans — **Yüksek**

- Masraf + stok + hibrit field op tek UI  
- `AppContext`’te hybrid wiring kırılgan  
- `apply_expense_atomic` db’de var; UI her zaman atomik mi belirsiz  
- **Öneri:** `useExpenseSubmit` hook; modal sadece form

#### C) Büyük dashboard sayfaları (lands, page, scouting, inventory, operations, engineer) — **Orta**

- 300–400 satır sayfalar: liste + form + modal + iş kuralı karışık  
- **Öneri:** feature klasörleri (`features/scouting/*`)

#### D) `useFarmLogic.ts` (~500 satır) — **Orta**

- CRUD + weather + AI tek hook  
- Offline create eklenince daha da şişti  
- **Öneri:** `useLandMutations`, `useScoutingMutations`, `useFarmAi` ayır

#### E) Auth çift katman — **Orta**

- Middleware redirect kapalı; AuthGuard + localStorage rol  
- `user_role_override` admin/engineer için  
- **Risk:** Yetki client’ta “yumuşak”; RLS doğru değilse delik

#### F) Doküman spagettisi — **Orta (süreç)**

- 10+ overlapping architecture md  
- Yeni gelen “hangisi doğru?” diye kaybolur  
- **Öneri:** Tek `ARCHITECTURE.md` + bu rehber; diğerleri arşiv

#### G) SQL spagettisi — **Yüksek (ops)**

- Kökte 10+ SQL + `supabase/migrations`  
- RLS “eksiksiz mi?” tek tıkla doğrulanamıyor  
- **Öneri:** `supabase db` tek kaynak; production audit script

#### H) `getAiHistory` mock — **Düşük ama dürüst**

```text
useFarmLogic: return []; // Mocked for now
```

- `db.getAiInsightsHistory` var; UI bağlanmamış

#### I) NetworkStatus / doküman tarihçesi

- Eskiden mock flush vardı; V1 farm queue gerçek  
- Finance hâlâ offline değil — dokümanlar abartmasın

### 17.3 Spagetti **olmayan** (korunması gereken) iyi parçalar

- Hook ayrımı (`useAuth` / `useFarm` / `useFinance` / `useAppSync` / `useUI`)
- `offlineCache` / `offlineQueue` lib izolasyonu
- `schemas/*` ile zod başlangıcı
- API route’larda rate limit + session kontrolü (chat)
- Domain types merkezi dosyada

---

## 17B. RLS Audit (P0 — 2026-07-11)

**Kapsam:** `supabase/migrations/` okundu, **değiştirilmedi**. Arşiv SQL (`docs/archive/sql/security_risk_migration.sql`) karşılaştırıldı.

### Bulgu (KRİTİK)

`supabase/migrations/20260502120000_enable_rls.sql` RLS’i açıyor ancak policy şu:

```sql
using (auth.role() = 'authenticated')
```

Bu, **giriş yapmış her kullanıcının tüm org’ların lands/transactions/… verisini** okuyup yazabileceği anlamına gelir. Demo kilidi; production multi-tenant izolasyonu **değil**.

### Arşivdeki daha sıkı patch

`docs/archive/sql/security_risk_migration.sql` `profile_id = auth.uid()` + admin bypass kullanıyor.  
Uygulama kodu çoğunlukla **`org_id`** ile filtreliyor — arşiv patch’i prod’a körlemesine basılmamalı; şema drift riski var.

### Önerilen (henüz uygulanmadı — ayrı migration PR)

1. Tüm tenant tablolarda `ENABLE ROW LEVEL SECURITY`
2. Policy: `org_id = auth.uid()` (veya net org membership tablosu)
3. Engineer: `engineer_clients` status=`approved` üzerinden SELECT
4. Admin: recursion-safe helper (`SECURITY DEFINER` function) ile bypass
5. `WITH CHECK` insert/update için aynı kural
6. Staging’de policy test; sonra production

### Middleware

`src/middleware.ts` korumalı route redirect hâlâ **kapalı** (AuthGuard’a bırakılmış). RLS zayıfken client guard yeterli değil.

---

## 18. Genel projede eksik görülenler (bugün)

Aşağıdakiler “kötü niyet” değil; **dikey büyümeden önce kapatılması gereken boşluklar**.

### 18.1 Ürün / özellik eksikleri

| Eksik | Etki |
|-------|------|
| Otomatik ödeme (PayTR/iyzico) | Premium büyüme ölçeklenmez; admin darboğaz |
| Finance offline queue | Sahada en kritik yazma (masraf) kaybolabilir |
| Offline update/delete | Kısmi offline; kullanıcı şaşırır |
| Offline harita tile | Saha haritası boş kareler |
| Push bildirim gerçek uçtan uca | Reçete/uyarı anlık gitmeyebilir |
| AI history UI | DB var, client mock |
| Gerçek atomik hibrit masraf her yolda | Stok tutarsızlığı riski |
| Collaborator yetki matrisinin UI’da tam yansıması | owner/editor/viewer vs gerçek davranış |
| Test suite (unit/e2e) | Regresyon körü |
| Error tracking (Sentry) | Prod hata görünmez |
| İngilizce dashboard i18n tamlığı | Landing EN var, app karışık olabilir |

### 18.2 Teknik eksikler

| Eksik | Etki |
|-------|------|
| Middleware auth enforce | Server koruma zayıf |
| Tek migration pipeline | Şema drift |
| `any` temizliği | Refactor maliyeti |
| IndexedDB | localStorage 5MB tavanı |
| Idempotent server mutation id | Offline çift kayıt teorik riski |
| Field op offline stok düşümü | Flush sonrası stok sapması |
| Offline land geometry | Saha çizimi sunucuya gitmez |
| CI (lint/test/build gate) | Kalite kapısı yok/ zayıf |
| Rate limit AI retry/backoff | 429’da kötü UX |
| Secret taraması (NEXT_PUBLIC agro key) | Client’a sızan key riski |

### 18.3 Dokümantasyon eksikleri

- Bu rehber dışında “tek doğru mimari” yok  
- DATA_PIPELINE offline anlatımı koddan geride kalabiliyor  
- API_REFERENCE model adları (gemini-2.0 vs 3.1) tutarsız olabilir

---

## 19. Dikey büyüme aşaması — ne yapılmalı?

“Dikey büyüme” burada: **aynı ürünü daha fazla kullanıcı / daha fazla arazi / daha fazla mühendis-çiftçi ilişkisi / daha fazla AI çağrısı** ile ayakta tutmak; yatayda 10 yeni özellik açmak değil.

### 19.1 Önce güvenlik ve veri bütünlüğü (P0)

1. **RLS audit:** Tüm tablolar, org_id, engineer erişimi, admin bypass recursion-safe mi?  
2. **Middleware auth’u kontrollü aç** (loop’suz cookie stratejisi).  
3. **SQL tek kaynak:** `supabase/migrations` + prod’a uygulanmış set dokümante.  
4. **Premium limitleri sunucuda** (sadece client toast yetmez).  
5. **Secret sınıflandırması:** Agro key client’ta mı kalmalı?

### 19.2 Offline’i “saha ürünü” yapmak (P0–P1)

1. Finance + inventory offline queue (FIFO + stok kuralları)  
2. `client_mutation_id` UNIQUE (idempotency)  
3. IndexedDB (queue + snapshot)  
4. Opsiyonel “bölgeyi offline indir” (map tiles)  
5. Flush sonrası stok reconcile

### 19.3 Ölçeklenebilir frontend mimarisi (P1)

1. `LeafletMap` parçala  
2. Feature-based klasörler  
3. `useFarmLogic` böl  
4. Strict TypeScript (kademeli `any` avı)  
5. CVA / UI token ile className spagettisini kes

### 19.4 Gözlemlenebilirlik ve kalite (P1)

1. Sentry + temel e2e (login, add land, add expense, offline flush)  
2. Vercel/CI’da `tsc` + lint + build  
3. AI rate limit metrics + backoff

### 19.5 Gelir ve operasyon (P1–P2)

1. POS webhook → `payment_status` otomasyonu  
2. Admin panelde audit log  
3. Engineer multi-client performans (N+1 query yok)

### 19.6 AI dikey derinleştirme (P2)

1. `getAiHistory` gerçek bağlama  
2. RAG vektör tablosu migration’ı prod’a net uygula  
3. Prompt’a **yalnız gerçek** weather/soil/ops; mock yasak  
4. Model isimlerini tek config’te topla

### 19.7 Büyüme sonrası (P3 — roadmap ile uyumlu)

- TKGM parsel  
- OCR fiş  
- IoT  
- Enterprise roller  
- Edge/local AI  

Bunlar dikey büyümeyi **destekler** ama P0–P1 olmadan erken açılırsa teknik borç katlanır.

---

## 20. Önerilen öncelik sırası (pratik backlog)

| Sıra | İş | Neden |
|------|-----|------|
| 1 | RLS + migration tek kaynak | Veri sızıntısı / şema kaos en pahalı hata |
| 2 | Finance offline queue | Saha masrafı ürün vaadi |
| 3 | Middleware auth + Sentry | Prod güven ve görünürlük |
| 4 | LeafletMap / ExpenseModal parçalama | Her feature 2× yavaşlamasın |
| 5 | Testler (kritik path) | Offline + premium + RLS regresyon |
| 6 | POS otomasyonu | Gelir ölçeği |
| 7 | IndexedDB + map offline | Saha PWA kalitesi |
| 8 | AI history + RAG prod | Fark yaratan katman |

---

## 21. Dosya yapısı — tam ağaç

Güncel ve kanonik özet **dosyanın başındaki “Proje Dosya Yapısı”** bölümündedir.  
Uygulama kodu `src/` altındadır; `supabase/migrations/` production SQL kaynağıdır; arşiv `docs/archive/` altındadır.

---

## 22. Kısa sonuç

Orjut, **gerçek bir tarım SaaS iskeletine** sahip: arazi/GIS, saha kayıtları, finans-stok köprüsü, roller, AI uçları, PWA ve (kısmi) offline yazma. Mimari niyet doğru yönde — özellikle **AppContext’in inceltilmesi** ve **offline lib’lerin ayrılması**.

Buna karşılık dikey büyüme için henüz “sert” olmayan yerler net:

1. **Güvenlik/ops:** middleware, RLS/SQL tek doğruluk, secret disiplini  
2. **Saha offline:** finance + geometry + tiles + stok reconcile  
3. **Kod sağlığı:** LeafletMap/ExpenseModal/sayfa god-component’leri, `any`, tests  
4. **Gelir:** manuel premium → otomasyon  
5. **Doküman:** kodla senkron tek rehber (bu dosya başlangıç noktası olabilir)

Bu belge bilinçli olarak **abartısız** yazıldı: ne “her şey harika”, ne “yeniden yaz”.  
İleride her büyük PR sonrası bu dosyanın “Eksikler” ve “Spagetti cepleri” bölümleri güncellenmelidir.

---

*Son tarama notu: Offline cache (Faz A) ve farm offline queue V1 kodda mevcuttur; finance offline ve NetworkStatus mock anlatımları eski dokümanlarda kalmış olabilir — bu rehber 2026-07-11 kod durumuna göre yazılmıştır.*
