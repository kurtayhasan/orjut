# ORJUT AGTECH OS — TEKNİK BORÇ VE İYİLEŞTİRME PLANI (TECH DEBT)

Bu belge sistemde şu an var olan ancak zaman, bütçe veya teknik engeller sebebiyle tam olarak çözülememiş, ileride refactor (yeniden yapılandırma) gerektiren konuları (Teknik Borç) listeler.

---

## 1. YÜKSEK ÖNCELİKLİ (CRITICAL)

### A. Çevrimdışı Harita Önbellekleme (Offline Map Tiles)
* **Problem:** Uygulamanın offline (çevrimdışı) PWA desteği var ve formlar internet yokken kuyruğa alınıp kaydedilebiliyor. Ancak tarla sınırlarını çizmek veya görmek için gereken harita altlıkları (Map Tiles - Leaflet) cihazın hafızasına kalıcı kaydedilemiyor (Service Worker sınırları veya IndexedDB limitleri yüzünden).
* **Etkisi:** İnternet hiç çekmeyen bir dağ başında çiftçi uygulamayı açarsa haritada yeşil ve gri boşluklar (missing tiles) görür.
* **Çözüm Planı:** `leaflet.offline` gibi kütüphaneler kullanılarak veya kullanıcının "Bu bölgeyi çevrimdışı için indir" butonuna basmasıyla harita altlıklarının cihazın IndexedDB'sine kaydedilmesi.

### B. PayTR Canlı POS Entegrasyonu ve Abonelik Döngüsü
* **Problem:** "Hasat Pro" paketi için kullanıcılar havale/EFT yaptıklarında veya manuel sözleşme imzaladıklarında, onaylama (Premium statüsüne alma) işlemi şu an admin tarafından `admin/page.tsx` üzerinden elle yapılmaktadır. 
* **Etkisi:** Gece yarısı satın alma yapan kullanıcı premium özelliklere anında erişemez.
* **Çözüm Planı:** PayTR veya iyzico sanal POS webhook entegrasyonu tamamlanarak, başarılı ödeme anında veritabanındaki `payment_status` = 'approved' ve `is_premium` = true işleminin otomatik bir Serverless Route Handler üzerinden tetiklenmesi.

---

## 2. ORTA ÖNCELİKLİ (HIGH/MEDIUM)

### A. Çevrimdışı Eşitleme Çakışması (Race Conditions in Offline Sync)
* **Problem:** Çiftçi internet yokken iki farklı harcama girdiğinde ve stok güncellediğinde, internet geldiği an `NetworkStatus` bu kuyruktaki fişleri Supabase'e gönderiyor. Ancak senkronizasyon bazen ağ hızına bağlı olarak sırayla gitmeyebilir.
* **Etkisi:** Veritabanında zaman damgası (timestamp) veya atomik operasyon kayması sonucu depo stoğu eksiye düşebilir veya masraflar farklı sırayla işlenebilir.
* **Çözüm Planı:** İstemci tarafında kuyruk (Queue) boşaltılırken, Supabase'e "Bulk Insert" (toplu ekleme) olarak RPC üzerinden tek bir seferde gönderilmesi ve sunucu tarafında işlenmesi (Sıralı Transaction garantisi).

### B. Yapay Zeka (AI) Kota Aşımları (Rate Limiting)
* **Problem:** `gemini-3.1-flash-lite-preview` modeli aşırı yoğunlukta (Rate Limit 429) hata veriyor. Sistem çökmüyor, kullanıcıya koruyucu "Yoğunluk var" uyarısı veriyor ancak işlem iptal oluyor.
* **Etkisi:** Kullanıcı "Tekrar dene" butonuna basmak zorunda kalıyor.
* **Çözüm Planı:** Arka planda "Exponential Backoff" (giderek uzayan saniyelerle tekrar deneme) stratejisi uygulayan bir AI Retry Middleware (Ara Katman) yazılması.

---

## 3. DÜŞÜK ÖNCELİKLİ (LOW - KOD KALİTESİ)

* **Typescript `any` Kullanımları:** Özellikle `LeafletMap.tsx` içinde Turf.js ile yapılan geometri hesaplamalarında, harita objelerinde çok fazla `any` tipi bırakılmış. Bunların kesin `GeoJSON` tipleriyle (örn: `Feature<Polygon>`) değiştirilmesi.
* **CSS Büyümesi:** Tailwind sınıflarının çok uzaması (`className="flex flex-col items-center justify-center p-4 bg-zinc-900..."` vb.). Bu yapıların `@apply` ile veya bir `const buttonClass = cva(...)` ile modülerleştirilmesi (CVA kütüphanesi kurulu ama az kullanılmış).
