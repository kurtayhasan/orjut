# ORJUT ZiraiAsistan | MASTER CONTEXT & ARCHITECTURE

Bu doküman, Orjut ZiraiAsistan projesinin teknik mimarisini, veritabanı yapısını, iş akışlarını ve operasyonel kurallarını tanımlar. Gelecekteki geliştirmeler ve yapay zeka asistanları için "Ana Kaynak" (Single Source of Truth) niteliğindedir.

---

## 1. TECH STACK & CORE ARCHITECTURE

### Core Technologies
- **Framework:** Next.js 14 (App Router) - Server & Client Component hibrit yapısı.
- **Styling:** Tailwind CSS (Modern, Responsive & Dark-Mode ready).
- **Database & Auth:** Supabase (PostgreSQL + GoTrue + Realtime).
- **State Management:** `AppContext.tsx` (React Context API) - Global dil (`tr/en`), organizasyon seçimi ve UI durumları.
- **PWA:** Service Worker (`sw.js`) ve Web Manifest entegrasyonu ile çevrimdışı çalışma kabiliyeti.

### Deployment & Environment
- **Platform:** Vercel.
- **Metadata:** SEO uyumlu dinamik başlıklar ve katı SVG favicon politikası (`layout.tsx`).

---

## 2. DATABASE SCHEMA & SECURITY (SUPABASE)

### Critical Tables
1. **`profiles`:** Kullanıcı verileri, `role` (farmer/engineer/admin), `is_premium` durumu.
2. **`lands`:** Arazi poligonları, ada/parsel verileri, toprak analiz sonuçları.
3. **`inventory`:** Gübre, ilaç, yakıt ve tohum stokları.
4. **`transactions`:** Gelir/Gider kayıtları. `land_id` ve `inventory_id` ile ilişkili.
5. **`field_operations`:** Tarlada yapılan fiziksel işlemler (Sürüm, ekim, hasat).
6. **`scouting_logs`:** Gözlem kayıtları, fotoğraf ekleri ve mühendis reçeteleri.
7. **`engineer_clients`:** Çiftçi-Mühendis eşleşme ve onay tablosu (`pending/approved`).

### Security (RLS)
- Tüm tablolar **Row Level Security (RLS)** ile korunur.
- Kullanıcılar sadece kendi `org_id` veya `user_id` değerine sahip verilere erişebilir.
- Mühendisler, sadece `approved` statüsündeki danışanlarının verilerini görebilir.

---

## 3. CORE WORKFLOWS (HAYATİ İŞ AKIŞLARI)

### A. Hibrit Stok/Finans Köprüsü
Bir masraf girildiğinde (Örn: Gübreleme), sistem şu atomik işlemi gerçekleştirir:
- `transactions` tablosuna gider kaydı açılır.
- Eğer masraf bir stok öğesiyle (Gübre) ilişkiliyse, `inventory` tablosundaki miktar düşülür.
- İşlem ilgili `land_id` ile eşleşerek arazinin toplam maliyetine yansıtılır.

### B. Teşhis-Reçete Döngüsü (Agronomist Loop)
1. **Talep:** Mühendis, çiftçinin telefon numarası ile erişim talep eder (`engineer_clients`).
2. **Onay:** Çiftçi, ayarlar sayfasından bu talebi onaylar.
3. **Teşhis:** Mühendis, arazideki sorunu görür ve `scouting_logs` içerisine bir `prescription_text` (Reçete) yazar.
4. **Uygulama:** Çiftçi, Dashboard üzerinde sarı bir "Mühendis Notu" kartı görür. "Uygula" dediğinde sistem bu reçeteyi bir arazi operasyonuna dönüştürür.

---

## 4. MONETIZATION & HASAT PRO

### Satış Stratejisi
- **Paket Adı:** "Hasat Pro".
- **Pricing:** 99 TL / Ay veya 1.000 TL / Yıl (2 Ay Hediye avantajı).
- **Feature Gating:** NDVI Uydu Analizi, Proaktif AI Danışmanı ve Sınırsız Arazi gibi özellikler `is_premium` kontrolü ile kilitlenir.

### Ödeme Akışı
- Kullanıcı Premium talebi oluşturur.
- Ödeme linki üzerinden işlem tamamlanır.
- Veritabanında `payment_status` değeri `pending_approval` olur.
- Admin panelinden manuel veya webhook ile onaylandığında `is_premium` true olur.

---

## 5. UI/UX & LAYOUT HIERARCHY

### Responsive Design
- **Desktop (`lg:`):** Sol menü (Sidebar) sabit, içerik alanı geniştir (`lg:flex-row`).
- **Mobile:** Sidebar bir çekmece (Drawer) olarak çalışır (`fixed inset-y-0`).
- **Görsel Dil:** Plus Jakarta Sans & Inter fontları, emerald/zinc renk paleti.

### Layering (Z-Index) Hierarchy
1. `z-0`: Harita Katmanları.
2. `z-10`: Harita Araç Menüleri.
3. `z-40`: Mobil Menü Overlay (Backdrop).
4. `z-50`: Sidebar & Navigation.
5. `z-70`: Modallar (BaseModal).
6. `z-[9999]`: Toaster Bildirimleri.

---

## 6. LEGAL & PAYTR COMPLIANCE

PayTR ve yasal otoriteler için Footer'da 4 temel yasal sayfa zorunludur:
1. **Kullanım Koşulları (`/legal/terms`):** Genel hizmet şartları.
2. **Gizlilik Politikası (`/legal/privacy`):** KVKK uyumlu veri işleme.
3. **İptal ve İade Koşulları (`/legal/refund`):** SaaS/Dijital içerik olduğu için 6502 sayılı kanuna göre cayma hakkı muafiyeti vurgulanmıştır.
4. **Mesafeli Satış Sözleşmesi (`/legal/distance-selling`):** Dijital abonelik satış şartları.

---

## 7. MAINTENANCE & SAFETY

- **Data Purge:** Kullanıcı çıkış yaptığında (`handleLogout`), `AppContext` içerisindeki `clearAllData` fonksiyonu ile tüm state ve yerel veriler temizlenir.
- **Type Safety:** Tüm DB işlemleri `src/types/index.ts` içerisinde tanımlı arayüzler ile tip güvenliği altındadır.

---
*Bu doküman Orjut AgTech OS projesinin gelişim mirasıdır.*
