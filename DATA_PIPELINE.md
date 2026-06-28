# ORJUT AGTECH OS — VERİ BORU HATTI (DATA PIPELINE)

Bu doküman, Orjut platformundaki dış veri kaynaklarından (uydu ve hava durumu) gelen verilerin toplanması, önbelleğe alınması (caching) ve uygulamanın çevrimdışı senkronizasyon (offline-sync) kuyruğu işleyişini açıklar.

---

## 1. AGROMONITORING UYDU VERİSİ (NDVI) AKIŞI

Orjut, tarlaların klorofil (sağlık) ve toprak nemi durumunu görselleştirmek için AgroMonitoring API kullanır.
* **Akış:** 
  1. Çiftçi tarlayı haritada çizip kaydettiğinde, sistem `agromonitoring_polygon_id` (ilgili poligonun uydu sistemindeki karşılığı) kaydeder.
  2. Kullanıcı "NDVI (Sağlık)" katmanını haritada açtığında, sistem istemci üzerinden (istemci API anahtarı kullanmadan, sunucu proxy rotası üzerinden) WMS Tile (harita resim karesi) katmanlarını Leaflet üzerine oturtur.
  3. Eş zamanlı olarak veritabanındaki `ndvi_snapshots` tablosundan son uydu okumalarının (maksimum, minimum, ortalama NDVI) tarihsel gelişimi çekilerek grafiklere dökülür.

---

## 2. HAVA DURUMU (WEATHER) ENTEGRASYONU VE ÖNBELLEKLEME

Orjut, tarlanın mikro-klima hava durumunu (sıcaklık, rüzgar hızı, don riski) almak için ücretsiz olan Open-Meteo API'sini kullanır.
* **Modül:** `lib/weatherService.ts`
* **Darboğaz Koruması (Önbellekleme):** Kullanıcı aynı tarlanın sayfasını yenilediğinde sürekli API isteği atıp dış servisi yormamak için çekilen veriler `localStorage`'da önbelleğe (cache) alınır.
* **Anahtar (Key):** `weather_cache_{lat}_{lon}`
* **TTL (Time to Live):** 1 Saat (3600 saniye). Eğer son verinin çekilmesinden itibaren 1 saat geçmediyse sistem dışarı istek atmadan yerel önbellekteki veriyi kullanarak hızı maksimize eder.

---

## 3. ÇEVRİMDIŞI SENKRONİZASYON (OFFLINE-SYNC) KUYRUĞU

Tarlada veya dağlık arazide internet çekmediği durumlarda uygulamanın donmaması (Zero Silent Failures) için bir PWA kuyruk mekanizması kurgulanmıştır.
* **Veri Girişi (Hydration & Offline):** Global state yöneticisi olan `AppContext.tsx` ilk açılışta verileri indirir. İnternet kesilirse kullanıcı verileri sadece ekranda ve `localStorage` üzerinde geçici bir önekle (örn: `pending_`) tutar.
* **Network Status Listener:** Uygulamanın en üst katmanındaki `NetworkStatus.tsx` bileşeni tarayıcının `window.addEventListener('online')` ve `offline` eventlerini dinler.
* **Senkronizasyon (Flushing Queue):** İnternet bağlantısı sağlandığı an `NetworkStatus` bunu algılar ve `AppContext` içindeki kuyruk okuyucu (Sync Queue) fonksiyonu tetiklenir. Kuyruktaki tüm yarım işlemler (gider fişleri, tarla sınır değişiklikleri) sırasıyla Supabase'e itilir (POST edilir) ve ardından `localStorage`'daki `pending_` verileri temizlenip gerçek verilerle yer değiştirir.
