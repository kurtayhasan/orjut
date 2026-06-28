# ORJUT AGTECH OS — API REFERANS DOKÜMANI (API REFERENCE)

Sistemdeki Serverless Next.js API'leri genellikle `/api/` altında barındırılır. Bu doküman dış dünya ile veya yapay zeka entegrasyonu ile haberleşen ana endpoint'leri açıklar.

---

## 1. `POST /api/ai/analyze` (Arazi Derin AI Analizi)

Seçili olan tek bir arazi için detaylı ve proaktif hava/toprak/operasyon analizini yapar.

* **Yetki:** İstemcinin (kullanıcının) profilinde `is_premium = true` olmak zorundadır. Değilse 403 Forbidden döner. Supabase Session gereklidir.
* **LLM Modeli:** `gemini-1.5-flash` (Forced JSON Mode ile çalıştırılır).
* **Payload (Body):**
  ```json
  {
    "landId": "uuid-string",
    "userId": "uuid-string"
  }
  ```
  *(Veriler Zod üzerinden şemayla doğrulanır.)*
* **Response (Success - 200 OK):**
  ```json
  {
    "risk": "Gece sıcaklıkları 4 dereceye düşüyor, don riski mevcut.",
    "action": "Seralarda ısıtıcıları devreye sokun, sulamayı azaltın.",
    "urgency": "yüksek"
  }
  ```
* **Yan Etki (Side Effect):** İstek başarılı olduğunda veritabanında `ai_insights_history` tablosuna analiz sonucu ve o anki hava durumu enstantanesi kaydedilir.

---

## 2. `POST /api/ai/daily-insight` (Günlük Özet ve Proaktif Tavsiye)

Çiftçi sisteme (dashboard) girdiğinde, genel bağlamı (tüm tarlalar, genel konum) alıp kısaca özetleyen sabah raporunu üretir.

* **Yetki:** Tüm kullanıcılar erişebilir. (Kota yönetimi AI SDK üzerinden sağlanır).
* **LLM Modeli:** `@google/genai` resmi SDK'sı üzerinden `gemini-3.1-flash-lite-preview`.
* **Payload (Body):** İçinde JSON sıkıştırma işleminden (minification) geçmiş RAG context datasını alır.
* **Hata Toleransı (Fallback & Rate Limiting):**
  Google Gemini API eğer 429 Too Many Requests verirse, servis çökmek (500 Error) yerine istemciye güvenli bir yedek mesaj döner:
  ```json
  {
    "success": true,
    "insight": "Sistem yoğunluğu nedeniyle detaylı analiz alınamadı.",
    "recommended_action": "Lütfen hava durumunu manuel kontrol ederek operasyonlarınıza karar verin.",
    "rate_limited": true
  }
  ```
  *(Gelecekte bu hata alınırsa arka planda retry-queue mekanizması devreye alınmalıdır.)*

---

## 3. Dış Servis Bağlantıları (Uygulama İçinden Çıkılan İstekler)

### AgroMonitoring API (NDVI & Soil Moisture)
* **Amaç:** `LeafletMap.tsx` içinde haritanın üzerine binen NDVI ve Toprak nemi ısı haritalarının (TileLayers) getirilmesi.
* **Endpoint:** `http://api.agromonitoring.com/agromonitoring/image/1.0/...`
* **İşleyiş:** İstemci tarafında AgroMonitoring poligon kimliği (`agromonitoring_polygon_id`) üzerinden çağrılır.

### Open-Meteo API
* **Amaç:** Arazinin koordinatlarına (`lat`, `lng`) özel hava durumu tahminlerini (Sıcaklık, nem, yağış vb.) getirmek.
* **Entegrasyon Sınıfı:** `lib/weatherService.ts`
* **Önbellek:** Veriler çekildikten sonra LocalStorage'a `weather_cache_{lat}_{lon}` olarak kaydedilir. TTL (Time to Live) süresi **1 saat**tir. Saat dolmadan aynı koordinata bir daha dış API çağrısı yapılmaz.
