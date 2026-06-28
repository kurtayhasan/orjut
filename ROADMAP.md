# ORJUT AGTECH OS — GELİŞİM YOL HARİTASI (ROADMAP)

Orjut projesinin önümüzdeki 6 ay, 1 yıl ve 2+ yıl içerisindeki planlanan gelişim aşamaları.

---

## 1. KISA VADELİ HEDEFLER (Q3 - Q4 2026)

* **Web Push Canlı Bildirimleri:** Çiftçinin tarlası için ziraat mühendisi bir reçete yazdığında (veya yapay zeka acil bir don tehlikesi saptadığında), PWA Service Worker (Web Push) aracılığıyla doğrudan kullanıcının mobil telefonuna kilit ekranı bildirimi (Push Notification) gönderilmesi.
* **Otomatik Pos (PayTR) Tamamlanması:** Hasat Pro paketi satın alımlarının manuel onaydan çıkarılıp, sanal pos (webhook) otomasyonuna bağlanması. (Bkz. `TECH_DEBT.md`)
* **Hata Takip (Error Tracking):** Sentry veya Logrocket gibi sistemlerin frontend tarafına entegre edilerek istemci tarafındaki (kullanıcı cihazındaki) render veya harita çökme hatalarının izlenmesi.

---

## 2. ORTA VADELİ HEDEFLER (2027)

* **Akıllı Fatura Tarama (AI OCR):** Çiftçinin uygulamaya bir gübre faturası fotoğrafı yüklediğinde, Gemini 1.5 Flash (Multimodal) modeli kullanılarak faturadaki "Tarih, Miktar, Birim Fiyat ve Ürün Adı" bilgilerinin otomatik okunup Finans/Envanter formlarının otomatik doldurulması.
* **TKGM (Tapu Kadastro) Entegrasyonu:** Çiftçi harita üzerinde elle poligon çizmek yerine "İl, İlçe, Ada, Parsel" bilgilerini girdiğinde e-devlet CBS sistemleri üzerinden tarlanın sınırlarının saniyeler içinde hatasız ve otomatik olarak haritaya oturtulması.
* **IOT & Makine Entegrasyonu:** Akıllı traktörlerin (örneğin GPS'li ve CAN-bus destekli John Deere vb.) verilerinin çekilerek "Bu tarlada x litre mazot harcandı" bilgisinin çiftçinin el ile girmesine gerek kalmadan doğrudan `transactions` tablosuna aktarılması.

---

## 3. UZUN VADELİ VİZYON (2028+)

* **B2B Kurumsal Altyapı:** 5.000 dekar üzeri dev işletmeler, tarım kooperatifleri ve büyük seralar için ayrı bir rol paneli ("Enterprise Dashboard"). Çalışanların (traktör şoförü, sulamacı vb.) ayrı şifrelerle girip sadece kendi görevlerini görebileceği mikro-yetkilendirme sistemi.
* **Edge AI (Yerel LLM):** İnternet erişiminin aylarca olmadığı çok sapa bölgeler için, bulut tabanlı Gemini API yerine, bizzat çiftçinin telefonunun işlemcisiyle (NPU) çalışabilen, tarıma özel ince ayar yapılmış (fine-tuned) 1B-2B parametreli yerel bir Ag-LLM (Local AI) entegrasyonu. (Örn: Llama, Gemma veya Phi serisi).
* **Makro Pazar Yeri:** Çiftçilerin "Hasat Öncesi" beklenen rekoltelerini (yield) sisteme girip, tüccarların bu tarlaları harita üzerinde görüp doğrudan uygulama içinden vadeli satın alım teklifi yapabildiği bir Ag-Ticaret Borsa modülü.
