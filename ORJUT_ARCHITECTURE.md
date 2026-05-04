# ORJUT ZİRAİASİSTAN - SİSTEM MİMARİSİ VE TEKNİK DOKÜMANTASYON

Bu belge, **Orjut ZiraiAsistan** AgTech SaaS platformunun mevcut mimarisini, veritabanı yapısını ve iş akışlarını detaylandırmak için oluşturulmuştur.

---

## 1. Proje Genel Bakış ve Teknoloji Yığını
Orjut, çiftçilerin arazi yönetimi, finansal takip, stok yönetimi ve zirai operasyonlarını dijitalleştiren profesyonel bir B2B SaaS platformudur.

- **Framework:** Next.js 14 (App Router)
- **Veri ve Kimlik Doğrulama:** Supabase (PostgreSQL & Auth)
- **Stil:** Tailwind CSS
- **Harita & CBS:** Leaflet.js (Polygon çizimi ve koordinat takibi)
- **Mobil Deneyim:** PWA (Progressive Web App) - Çevrimdışı veri girişi desteği
- **Durum Yönetimi:** React Context API (`AppContext`)
- **İkon Seti:** Lucide React

---

## 2. Kimlik Doğrulama ve Güvenlik
Sistem, `org_id` (Organizasyon/Kullanıcı ID) tabanlı bir izolasyon stratejisi izler.

- **Auth Akışı:** Kullanıcı girişi sonrası `id` bilgisi `localStorage` üzerinde saklanır. `AppContext`, uygulama yüklendiğinde bu ID ile oturumu hidrat (hydrate) eder.
- **RLS (Row Level Security):** Supabase üzerinde her tabloda `org_id` kontrolü yapılır. Bir kullanıcı sadece kendi organizasyonuna ait verileri görebilir ve yönetebilir.
- **Şifreleme:** Kullanıcı şifreleri veritabanında bcrypt ile hash'lenmiş olarak saklanır.

---

## 3. Veritabanı Şeması ve İlişkisel Harita

### Tablolar ve Kolon Detayları:
1. **profiles:** Kullanıcı ana bilgileri (id, ad, soyad, telefon, şifre).
2. **lands:** Araziler. `org_id` ile kullanıcıya bağlıdır.
   - `boundaries`: GeoJSON formatında polygon verisi.
   - `environment_type`: 'acik_tarla' | 'sera'.
3. **transactions:** Finansal kayıtlar. `land_id` ve `org_id` ile ilişkilidir.
   - `type`: 'expense' (gider) | 'income' (gelir).
   - `quantity`, `unit`: Masrafın fiziksel büyüklüğü (Örn: 50 lt Mazot).
4. **inventory:** Stok durumu. `org_id` bazlıdır.
   - `type`: 'gubre', 'ilac', 'tohum', 'diger'.
5. **field_operations:** Zirai işlemler. `land_id` ve `inventory_id` (isteğe bağlı) ile ilişkilidir.
   - `type`: 'su' (sulama), 'gubre' (gübreleme), 'ilac' (ilaçlama).
6. **scouting_logs:** Arazi gözlemleri. `land_id` ile ilişkilidir.
   - `growth_stage`: Bitki gelişim evresi (cimlenme, ciceklenme vb.).
7. **seasons:** Tarım sezonları. Kullanıcı bazlı aktif sezon yönetimi sağlar.
8. **market_prices:** Ürün piyasa fiyatları (Örn: Mısır, Buğday borsa fiyatları).
9. **collaborators:** Arazi paylaşımı. `land_id` ve `profile_id` üzerinden Çoktan-Çoğa (N:N) ilişki kurar.

---

## 4. Kritik İş Akışları ve İş Mantığı

### Arazi ve Sera Yönetimi (Polygon/Kroki)
- Harita üzerinde `Leaflet` ile çizilen polygonlar GeoJSON olarak saklanır.
- **Sera Desteği:** Alan tipi 'Sera' ise ölçümler metrekare (`size_sqm`), 'Açık Tarla' ise dönüm (`size_decare`) üzerinden hesaplanır.
- **ON DELETE CASCADE:** Bir arazi silindiğinde, o araziye bağlı tüm zirai işlemler ve gözlemler veritabanı seviyesinde otomatik olarak silinir.

### Finans-Envanter Köprüsü (Finance-Inventory Bridge)
- `ExpenseModal` üzerinden bir masraf girilirken "Envantere ekle" seçilirse:
  1. `transactions` tablosuna finansal kayıt atılır.
  2. Eş zamanlı olarak `inventory` tablosunda yeni bir stok kalemi oluşturulur veya miktar güncellenir.
- Bu yapı, masraf girildiği anda stokların manuel müdahale gerekmeden güncellenmesini sağlar.

### Birleşik Zirai İşlemler (Unified Operations)
- Sulama, Gübreleme ve İlaçlama işlemleri tek bir formdan yönetilir.
- Gübreleme veya İlaçlama yapıldığında, seçilen stok kaleminden (`inventory_id`) kullanılan miktar otomatik olarak düşülür.
- `period_days` kolonu ile işlemin tekrarlanma sıklığı takip edilir.

### Arazi Gözlemi (Field Scouting)
- Bitki sağlığı ('saglikli', 'hastalik', 'zararli') ve gelişim aşamaları anlık fotoğraflı veya notlu olarak kaydedilir.
- Bu veriler, hasat tahmini ve risk analizi için temel teşkil eder.

---

## 5. Durum Yönetimi (State Management)
Uygulamanın kalbi `AppContext.tsx` içerisindeki `AppProvider` bileşenidir.

- **Data Hydration:** Sayfa yenilendiğinde `useEffect` tetiklenerek `localStorage`'daki `user_id` üzerinden tüm tablolar (lands, transactions, inventory vb.) Supabase'den çekilir.
- **Optimistic UI:** Veri girişlerinde (Örn: arazi silme veya masraf ekleme) arayüz anında güncellenir, sunucu yanıtı beklenirken kullanıcıya kesintisiz deneyim sunulur.
- **Offline Sync:** İnternet yokken girilen veriler `pending_` anahtarlarıyla `localStorage`'da bekletilir ve bağlantı geldiğinde otomatik senkronize edilir.

---

## 6. Gelecek AI/RAG Motoru Hazırlığı
Sistem, toplanan ham verileri Yapay Zeka için anlamlı bir "Context" (Bağlam) haline getirmek üzere tasarlanmıştır.

- **aiActionEngine.ts:** Mevcut hava durumu, arazideki ürün tipi, ekimden bu yana geçen gün sayısı ve geçmiş zirai işlemleri birleştirerek bir `Prompt` oluşturur.
- **RAG Hazırlığı:** Operasyon ve gözlem kayıtları, Gemini veya GPT modellerine "Bugün ne yapmalıyım?" sorusu sorulduğunda beslenecek yapılandırılmış veri setini (JSON) oluşturur.

---
**Versiyon:** 1.0.0 (MVP Stable)
**Son Güncelleme:** 2026-05-05
