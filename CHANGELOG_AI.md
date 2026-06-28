# ORJUT AGTECH OS — YAPAY ZEKA DEĞİŞİKLİK GÜNLÜĞÜ (CHANGELOG_AI)

Bu dosya, yapay zeka (AI) asistanlarının veya kodlama ajanlarının (Coding Agents) Orjut sistemi üzerinde yaptığı **önemli tüm mimari değişikliklerin ve kod eklentilerinin** kaydını tutan resmi günlüktür.

*(Bu dosya geliştiriciler veya diğer AI ajanları tarafından kronolojik olarak aşağıdan yukarıya doğru okunmalıdır.)*

---

## [2026-06-28] - Kapsamlı Tersine Mühendislik ve Dokümantasyon Oluşturma

**AI Ajanı:** Gemini 3.1 Pro (High) - "Antigravity"
**Tetikleyici:** Kullanıcı talebi (Kapsamlı Reverse Engineering ve Single Source of Truth yaratılması)

### Değişiklikler ve Aksiyonlar
* Projedeki `schema.sql` (Veritabanı yapısı) ve `ORJUT_MASTER_CONTEXT.md` / `ORJUT_ARCHITECTURE.md` (Önceki dokümanlar) dahil olmak üzere tüm proje klasör hiyerarşisi tarandı ve tersine mühendislik ile analiz edildi.
* Projeye sıfır bilgi kaybıyla entegre olunabilmesi için proje kök dizinine aşağıdaki **12 adet Master Doküman** Türkçe olarak sıfırdan yazılarak eklendi:
  1. `MASTER_CONTEXT.md` (Projenin ana özeti, vizyonu ve genel mimarisi)
  2. `SYSTEM_ARCHITECTURE.md` (Next.js, Supabase ve PWA etkileşimleri)
  3. `PRODUCT_SPEC.md` (Kullanıcı personaları, Freemium/Hasat Pro paket limitleri)
  4. `API_REFERENCE.md` (Yapay Zeka ve dış veri API uç noktaları)
  5. `DATABASE_REFERENCE.md` (ER Diyagramı, Tablolar, RLS ve Atomik RPC işlemleri)
  6. `AI_PIPELINE.md` (RAG bağlam sıkıştırma, JSON Mode limitleri ve AI prompt stratejileri)
  7. `DATA_PIPELINE.md` (AgroMonitoring ve Open-Meteo veri toplama/önbellek süreçleri)
  8. `DEV_GUIDE.md` (Geliştirici ortamı kurulum adımları)
  9. `DEPENDENCY_MAP.md` (Modüller arası kod bağımlılık matrisi)
  10. `TECH_DEBT.md` (Çevrimdışı harita sorunları ve Pos entegrasyon eksiklikleri)
  11. `ROADMAP.md` (Kısa, orta ve uzun vadeli gelişim yol haritası)
  12. `CHANGELOG_AI.md` (Bu dosya - Değişiklik günlüğü başlatıldı)

### Notlar
* Hiçbir aktif uygulama kodu veya iş mantığı (business logic) bozulmamış veya değiştirilmemiştir.
* Sistem tamamen "Dokümantasyon İlk (Documentation First)" yaklaşımıyla modellenmiş ve gelecekteki geliştirmelere hazır hale getirilmiştir.
