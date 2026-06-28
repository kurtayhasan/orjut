# ORJUT AGTECH OS — ÜRÜN VİZYONU VE İŞ KURALLARI (PRODUCT SPEC)

Bu doküman projenin işletme kurallarını, hedef kitlesini ve paket limitlerini kapsar.

---

## 1. HEDEF KİTLE VE KULLANICI TİPLERİ (PERSONAS)

Orjut ekosisteminde üç ana kullanıcı tipi vardır:

### A. Çiftçi (Farmer)
* **Profili:** Arazilerini harita üzerinde işaretler, günlük gider ve hasat kayıtlarını tutar.
* **Eylemler:** Tarla ekle/sil, envanter (depo) güncelle, masraf faturası gir, AI'dan günlük hava durumu/zirai tahmin al, Ziraat mühendisi reçetelerini oku.
* **Limitleri:** Kendi organizasyon (`org_id`) verileri dışına çıkamaz.

### B. Ziraat Mühendisi (Engineer)
* **Profili:** Bölgesindeki çiftçilere danışmanlık yapan, tarlaların bitki sağlığı durumlarını dijital olarak skorlayıp öneriler sunan ziraat uzmanı.
* **Eylemler:** Çiftçi davet et (özel davet linkiyle portföyüne ekle), çiftçilerin tarlalarını listele, tarlaya teşhis koy, zirai ilaç ve gübre reçetesi yaz.

### C. Sistem Yöneticisi (Admin)
* **Profili:** Sistemin kurucusu veya üst yetkilisi.
* **Eylemler:** Çiftçilerin üyelik (Hasat Pro) taleplerini (havale ödemelerini vb.) onaylar. İhtiyaç halinde destek vermek için tüm kullanıcıların profil kayıtlarını veya arazi bilgilerini görür (RLS bypass).

---

## 2. PAKETLER VE İŞ MODELİ

Sistem Freemium B2B SaaS modeli ile çalışır.

### Ücretsiz Paket (Free Tier)
* **Arazi Sınırı:** Maksimum 3 arazi eklenebilir.
* **Büyüklük Sınırı:** Toplam eklenebilen arazi büyüklüğü maksimum 100 dekar olabilir.
* **Özellikler:** Temel harita çizimi, finansal muhasebe yönetimi, genel stok yönetimi.

### Hasat Pro (Premium Tier)
* **Fiyatlandırma:** Aylık 499 ₺ / Yıllık 4.990 ₺ (2 ay hediye).
* **Arazi Sınırı:** Sınırsız sayıda arazi eklenebilir. (Sistemi korumak amaçlı 5.000 dekar üzerine kurumsal paket önerilir)
* **Özellikler:** AI Proaktif Zirai Danışman, Uydu üzerinden NDVI Sağlık Analizi Isı Haritaları, Toprak Nemi Katmanları.

---

## 3. TEMEL İŞ KURALLARI (BUSINESS RULES)

* **Envanter ve Finans Bağlantısı:** Bir gider (örneğin ilaçlama faturası) sisteme girilirken "Envantere Ekle" seçilirse, sistem masrafı işlerken aynı anda "Depo" stok miktarını da otomatik arttırır ve birim maliyeti (tutar/miktar) günceller.
* **Hibrit İşlem (Doğrudan Uygulama):** Kullanıcı bir malı alıp hemen tarlaya uygularsa; sistem faturayı kaydeder, depoyu arttırır, tarlaya operasyonu ekler ve hemen ardından deponun içinden kullanılan miktar kadar düşer. Bu atomik bir zincirdir.
* **Mühendis - Çiftçi İlişkisi:** Bir çiftçinin yalnızca BİR aktif mühendisi olabilir.
* **Proaktif Davet (Auto-Bind):** Çiftçi, mühendisin davet linkine (`/invite?engineerId=...`) tıkladığında ve giriş yaptığında, sistem çiftçinin mevcut bir mühendisi yoksa otomatik olarak ilişkiyi onaylar (`status: 'approved'`).
* **Sıfır Sessiz Hata (Zero Silent Failures):** Sistemde kullanıcının yaptığı her kayıt işleminde, analiz butonuna tıklamasında UI üzerinde kesinlikle "Sonner" bildirim kütüphanesiyle toast bildirimi gösterilmelidir. Sistemin donduğu algısı kırılmalıdır.
* **İlerici Açıklama (Progressive Disclosure):** Çiftçiye hiçbir zaman NDVI klorofil verisinin ham indeks değeri veya GeoJSON dizileri doğrudan sunulmaz. Veriler her zaman "%85 Sağlıklı" gibi ilerleme çubuklarına veya anlaşılır renkli skorlara dönüştürülür.
