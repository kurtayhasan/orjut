# ORJUT AGTECH OS — BAĞIMLILIK HARİTASI (DEPENDENCY MAP)

Proje içerisindeki çekirdek (core) React bileşenlerinin, kancaların (hooks) ve 3. parti kütüphanelerin birbirleriyle olan modüler bağımlılık matrisi aşağıda listelenmiştir.

---

## 1. GLOBAL STATE VE CONTEXT BAĞIMLILIĞI

* **`src/context/AppContext.tsx`:** Uygulamanın kalbidir.
  * **Bağımlıdır:** `src/lib/db.ts` (Veritabanı işlemleri), Supabase Auth.
  * **Kendisine Bağımlı Olanlar:** Neredeyse tüm sayfa rotaları (`app/dashboard/*`), tüm üst düzey bileşenler (`Header.tsx`, `Sidebar.tsx`, `ExpenseModal.tsx`).
  * **Görev:** Çevrimdışı eşitleme, profili getirme, arazi ve envanter dizilerini tutma.

## 2. HARİTA (CBS) BİLEŞENİ BAĞIMLILIĞI

* **`src/components/LeafletMap.tsx`:** Harita çizimi ve görselleştirmesinin ana bileşenidir.
  * **Bağımlıdır:** `leaflet`, `react-leaflet`, `react-leaflet-draw` (Çizim kütüphanesi).
  * **Bağımlıdır:** `@turf/turf` (İstemci tarafında dekar/alan hesaplamak ve merkez [centroid] koordinatları bulmak için).
  * **Kendisine Bağımlı Olanlar:** `app/dashboard/page.tsx` (Arazi haritası), `components/lands/LandMapModal.tsx`.
  
## 3. YAPAY ZEKA VE RAG BAĞIMLILIĞI

* **`src/lib/ragEngine.ts` & `src/lib/aiActionEngine.ts`:** AI bağlam sıkıştırıcı ve istem (prompt) üretici servisleri.
  * **Bağımlıdır:** `AppContext` (Tüm operasyon geçmişi RAG motoruna buradan verilir).
  * **Kendisine Bağımlı Olanlar:** `src/app/api/ai/analyze/route.ts` (API uç noktaları buradaki servislerden gelen sıkıştırılmış JSON ve istemleri alıp Gemini'ye basar).
  * **Dış Bağımlılık:** `@google/genai` (Hafif ve hızlı özetler için Flash Lite modeli), `@google/generative-ai` (Daha kompleks analizler için JSON Modunda çalışan Flash modeli).

## 4. UI VE KULLANICI ETKİLEŞİMİ BAĞIMLILIĞI

* **Modallar ve Formlar:**
  * **Bağımlıdır:** `zod` (Form doğrulama şemaları için `src/lib/schemas/*` altında tutulur).
  * **Bağımlıdır:** `react-hook-form` (Performanslı form yönetimi).
  * **Kendisine Bağımlı Olanlar:** `ExpenseModal.tsx`, Zirai reçete formları.
* **Bildirimler:**
  * **Bağımlıdır:** `sonner` (Toast bildirim motoru). Uygulamadaki "Kaydediliyor...", "Hata Oluştu" gibi tüm asenkron geri bildirimleri üstlenir.

## 5. VERİTABANI BAĞIMLILIĞI

* **`src/lib/db.ts` & Supabase JS İstemcisi:**
  * **Bağımlıdır:** `@supabase/supabase-js`, `src/types/` (Tür güvenliği için).
  * **Kendisine Bağımlı Olanlar:** Sistemin tüm veritabanı insert/update/delete işlemleri doğrudan SQL yazmak yerine bu DAO (Data Access Object) mantığındaki dosya üzerinden geçirilir.
