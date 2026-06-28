# ORJUT AGTECH OS — YAPAY ZEKA VE RAG BORU HATTI (AI PIPELINE)

Orjut projesinin merkezinde, ham veri tabanı bilgilerini alarak agronomik tavsiyeler üreten hibrit bir yapay zeka boru hattı yatar.

---

## 1. RAG (RETRIEVAL-AUGMENTED GENERATION) MİMARİSİ

Veritabanında kullanıcının yıllar boyunca biriktirdiği harcamalar, takipler ve binlerce koordinattan oluşan çokgen noktaları, doğrudan LLM'e (Large Language Model) gönderilirse hem API kota limitleri dolar (Token israfı) hem de gecikme (Latency) süresi çok uzar.

Bunu önlemek için Orjut'ta **RAG Ingestion & Minification Pipeline** (Bağlam Sıkıştırma) kullanılır (`lib/ragEngine.ts`):

1. **Sınır Koordinatları Yuvarlama (Truncation):** Arazinin GeoJSON poligon verisindeki koordinatlar çok uzundur. Sisteme gönderilmeden önce virgülden sonra **6 basamak** kalacak şekilde (örneğin: `37.747812`) tıraşlanır. Bu işlem token kullanımını %70'e kadar düşürür.
2. **Geçmişin Filtrelenmesi:** Kullanıcının tüm operasyonları yerine sadece **en son 3 işlem**, **en son 15 gözlem raporu** ve **en son 20 harcama kaydı** seçilir.
3. **Recursive JSON Limiter (15.000 Karakter Sınırı):** RAG bağlam nesnesi (`LAND`, `CONTEXT`, `CURRENT`) hazırlandıktan sonra JSON metnine (string) çevrilir. Eğer metin 15.000 karakterden uzunsa, algoritma RAG dizilerinden sondan başlayarak kayıtları uçurur (pop) ve tam 15k sınırının altına düştüğünde LLM'e gönderir.

```text
Ham Veritabanı --> [Koordinat Yuvarlama] --> [Tarih Filtreleme] --> [15k Karakter Limit Sıkıştırması] --> Gemini API
```

---

## 2. PROAKTİF KARAR MEKANİZMASI VE PROMPT STRATEJİSİ

`lib/aiActionEngine.ts` içerisindeki prompt (istem) düz bir "bu nedir" promptu değil, **proaktif kurallar silsilesidir**:

* **Ekim Günü Algoritması:** Sistem prompt'a bitkinin ekim tarihini de ekleyerek LLM'in bitkinin hangi fenolojik (gelişim) evresinde olduğunu hesaplamasını ister (Örn: "Pamuk ekileli 45 gün oldu, taraklanma döneminde, şu böceğe dikkat et").
* **Meteorolojik Çapraz Kontrol:** LLM, arazinin 3 günlük hava durumu tahminiyle operasyon verisini birleştirir.
  * *Eylem:* "Yarın %90 ihtimalle sağanak yağış var. Depodaki gübreyi bugün atmayın, aksi halde yıkanıp topraktan akacaktır."
* **Kritik Alarm Tetikleyicisi (`critical_alert`):** Sıcaklık don seviyesine (örneğin 2°C'nin altına) indiğinde veya çok yüksek nemde mantar riski belirdiğinde, LLM JSON çıktısındaki `urgency` seviyesini yüksek tutar ve arayüzde kırmızı acil durum bildirimi yaratır.

---

## 3. KULLANILAN MODELLER VE JSON MODU KULLANIMI

* **Günlük Özet (Dashboard):** `@google/genai` resmi SDK'sı üzerinden `gemini-3.1-flash-lite-preview` modeli koşturulur. Bu model düşük gecikmeyle (low-latency) temel özet sunar.
* **Derin Arazi Analizi (Detailed Analysis):** `@google/generative-ai` kütüphanesi ile daha akıllı olan `gemini-1.5-flash` modeli çalıştırılır. Sistemin düz metin (markdown vb.) dönmemesi ve doğrudan uygulama arayüzünde widget'lara basılabilmesi için API çağrısında **Forced JSON Mode** (`responseMimeType: "application/json"`) kesin olarak belirlenmiştir.
