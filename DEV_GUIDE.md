# ORJUT AGTECH OS — GELİŞTİRİCİ KILAVUZU (DEV GUIDE)

Bu doküman, Orjut projesine yeni katılan bir yazılım mühendisinin veya AI asistanının projeyi yerel bilgisayarında eksiksiz biçimde ayağa kaldırması için gereken adımları içerir.

---

## 1. YEREL ORTAM KURULUMU (LOCAL ENVIRONMENT)

### A. Gereksinimler
* Node.js v18 veya üstü
* npm veya pnpm paket yöneticisi
* Bir Supabase hesabı (Veritabanı için)
* Bir Google AI Studio (Gemini) API anahtarı

### B. Bağımlılıkların Yüklenmesi
Terminalden proje kök dizininde aşağıdaki komutu çalıştırın:
```bash
npm install
# veya
npm ci
```

### C. Çevre Değişkenleri (Environment Variables)
Proje kök dizininde `.env.local` adlı bir dosya oluşturun ve içini aşağıdaki gibi doldurun:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJE-ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...<ANON-KEY>
GEMINI_API_KEY=AIzaSy...<GEMINI-KEY>
```
*(Supabase URL ve Anon Key değerleri Supabase Dashboard -> Project Settings -> API altından alınır.)*

---

## 2. VERİTABANI KURULUMU

Orjut tamamen Supabase altyapısına dayanır. Tabloların, Trigger'ların ve Güvenlik Kurallarının (RLS) çalışması için şemanın oluşturulması şarttır.
1. Supabase kontrol panelinize gidin ve "SQL Editor" sayfasını açın.
2. Projenin kök dizininde yer alan `schema.sql` dosyasının tüm içeriğini kopyalayın ve SQL Editor'e yapıştırıp çalıştırın (Run).
3. Bu işlem tabloları, `handle_new_user` trigger'ını ve tüm "Row Level Security" politikalarını otomatik kuracaktır.

---

## 3. PROJEYİ BAŞLATMA VE DOĞRULAMA

### A. Geliştirici Sunucusunu Başlatma
Terminal üzerinden aşağıdaki komutu çalıştırın:
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde başlayacaktır.

### B. Tesisat Doğrulama Akışı
Sistemin çalıştığını test etmek için şu adımları takip edin:
1. Kayıt (Sign Up) ekranından telefon numaranızla veya E-posta ile yeni bir kullanıcı oluşturun. (Bu adımda Supabase Trigger'ının `profiles` tablosuna sizi kaydettiğini doğrulayın).
2. "Dashboard" ekranına gidin, harita üzerinden "Arazi Ekle" butonuna basarak ilk poligonunuzu çizin ve kaydedin.
3. Bir gider/masraf girin ve gider faturasıyla birlikte "Depo (Envanter)" stoklarının da düzgün hesaplanıp hesaplanmadığına bakın.
4. "AI Günlük Analiz" butonuna basarak Gemini asistanının API anahtarı üzerinden başarılı sonuç döndürdüğünü teyit edin.

---

## 4. KODLAMA STANDARTLARI

* **TypeScript:** Proje kesin tipli (Strict Typed) olarak ayarlanmıştır. Mümkün olduğunca `any` tipi kullanmaktan kaçının.
* **Component Yapısı:** UI bileşenleri `src/components/` klasörüne iş mantığından soyutlanarak (Dumb components vs Smart containers) yazılmalıdır.
* **State Management:** Sadece sayfa geçişlerinde global olarak kalması gereken verileri `AppContext` içerisine alın, aksi halde Local Component State (`useState`) kullanın.
* **UI Kuralları:** Hata, uyarı ve başarı bildirimleri için sessiz kalmayın (Zero Silent Failures prensibi). Her işlemin sonunu `sonner` toast mesajı ile kullanıcıya bildirin.
