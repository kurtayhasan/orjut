/**
 * Orjut AgTech OS — Master PDF Ingestion Pipeline (Nihai Sürüm)
 * * Kurulum : npm install pdf-lib
 * Çalıştır: npx tsx scripts/pdf-ingest.ts <dosya.pdf veya klasör/>
 */

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── İstemciler ───────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGES_PER_CHUNK = 15; // Devasa belgelerde kota aşımını önlemek için 15 sayfalık dilimler

// ─── Structured Output Şeması ─────────────────────────────────────────────────

const agronomySchema: Schema = {
  type: Type.ARRAY,
  description: "Tarım belgesinden çıkarılan atomik zirai bileşenler",
  items: {
    type: Type.OBJECT,
    properties: {
      kategori: {
        type: Type.STRING,
        description: "Bitki Koruma / Bitki Besleme / Yetiştiricilik / Toprak ve Su Yönetimi / Desteklemeler / Mevzuat",
      },
      etmen_adi: {
        type: Type.STRING,
        description: "Hastalık, zararlı, yabancı ot veya bakım konusunun tam adı (Örn: Sarı Pas, Süne, Ayrık Otu)",
      },
      etkilenen_urunler: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Örn: [Buğday, Arpa, Pamuk]",
      },
      hedef_organ: {
        type: Type.STRING,
        description: "Yaprak, başak, kök, kökboğazı vb.",
      },
      gorsel_belirtiler: {
        type: Type.STRING,
        description: "Çiftçi fotoğraf çektiğinde AI'ın eşleştireceği renk, leke, doku ipuçları",
      },
      zarar_mekanizmasi: {
        type: Type.STRING,
        description: "Bitkiye verdiği fiziksel zarar şekli",
      },
      fenolojik_evre: {
        type: Type.STRING,
        description: "Müdahalenin geçerli olduğu bitki evresi (Örn: Kardeşlenme, Sapa kalkma)",
      },
      ornekleme_yontemi: {
        type: Type.STRING,
        description: "Tarlada sayım/gözlem yöntemi (Örn: 1/4 m2 çember, diagonal hat)",
      },
      ekonomik_zarar_esigi: {
        type: Type.STRING,
        description: "İlaçlama kararı için kesin sayısal sınır (Örn: m2'de 10 nimf, %5 bulaşıklık)",
      },
      kulturel_ve_biyolojik_onlemler: {
        type: Type.STRING,
        description: "İlaçsız mücadele: dayanıklı çeşitler, faydalı böcekler, anız yönetimi",
      },
      aktif_etken_maddeler: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Bakanlık onaylı etken maddeler listesi",
      },
      uygulama_dozu: {
        type: Type.STRING,
        description: "Dekara veya 100L suya düşen net dozaj",
      },
      ihas_suresi: {
        type: Type.STRING,
        description: "Hasat öncesi bekleme süresi (İHAS) — gün cinsinden",
      },
      direnc_yonetimi: {
        type: Type.STRING,
        description: "Tank karışabilirlik ve direnç yönetimi (MoA) uyarıları",
      },
      orijinal_metin_ve_tablolar: {
        type: Type.STRING,
        description: "Bu bölüme ait orijinal metin; TABLO VARSA eksiksiz MARKDOWN TABLOSU olarak buraya yaz",
      },
    },
    required: ["kategori", "etmen_adi"],
  },
};

// ─── Yardımcılar ve Rate Limit Koruması ────────────────────────────────────────

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return response.embeddings?.[0]?.values ?? [];
}

/**
 * 429 Kota (Resource Exhausted) hatalarına karşı otomatik bekleyip tekrar deneme (Exponential Backoff)
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 10000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota'))) {
      console.warn(`\n⚠️ API Kotası (429) yakalandı. ${delay / 1000} saniye güvenli bekleme yapılıyor ve tekrar deneniyor...`);
      await new Promise((r) => setTimeout(r, delay));
      return callWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

async function splitPdfByPages(filePath: string): Promise<Buffer[]> {
  const srcBytes = fs.readFileSync(filePath);
  const srcDoc = await PDFDocument.load(srcBytes);
  const totalPages = srcDoc.getPageCount();
  const chunks: Buffer[] = [];

  for (let start = 0; start < totalPages; start += PAGES_PER_CHUNK) {
    const end = Math.min(start + PAGES_PER_CHUNK, totalPages);
    const chunkDoc = await PDFDocument.create();
    const indices = Array.from({ length: end - start }, (_, i) => start + i);
    const copied = await chunkDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => chunkDoc.addPage(p));
    chunks.push(Buffer.from(await chunkDoc.save()));
    console.log(`   📑 Dilim ${chunks.length}: sayfa ${start + 1}–${end} / ${totalPages}`);
  }

  return chunks;
}

async function analyzeChunkWithGemini(
  pdfBuffer: Buffer,
  tempDir: string,
  chunkIndex: number
): Promise<any[]> {
  const tempPath = path.join(tempDir, `chunk_${chunkIndex}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer);

  let uploadedFile: any = null;

  try {
    // 1. File API'ye yükle (Retry korumalı)
    uploadedFile = await callWithRetry(async () => {
      return await ai.files.upload({
        file: tempPath,
        config: { mimeType: "application/pdf" },
      });
    });

    // 2. İşlenmeyi bekle
    let fileInfo = await ai.files.get({ name: uploadedFile.name });
    while (fileInfo.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 3000));
      fileInfo = await ai.files.get({ name: uploadedFile.name });
    }
    if (fileInfo.state === "FAILED") throw new Error("File API: FAILED state");

    // 3. Gemini analizi — Retry korumalı güvenli çağrı
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-1.5-flash", // En stabil ve kota dostu model
        contents: [
          { fileData: { fileUri: uploadedFile.uri, mimeType: "application/pdf" } },
          {
            text: `Bu tarım belgesi bölümünü derinlemesine analiz et ve tüm zirai bilgileri çıkar.

KURAL 1 — MİKRO PARÇALAMA (EN KRİTİK):
Her zararlı, hastalık ve yabancı otu KESİNLİKLE AYRI birer JSON nesnesi olarak çıkar.
Süne ≠ Kımıl, Sarı Pas ≠ Kara Pas — her biri ayrı nesne. 

KURAL 2 — TABLO KORUMA:
Dozaj, İHAS, gübreleme veya uygulama tablosu gördüğünde "orijinal_metin_ve_tablolar"
alanına eksiksiz MARKDOWN TABLOSU olarak yaz. Asla kısaltma.

KURAL 3 — DÜRÜSTLÜK:
Bilgi yoksa o alanı boş bırak. Uydurma, tahmin etme.`,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: agronomySchema,
          temperature: 0.1,
          systemInstruction:
            "Sen T.C. Tarım ve Orman Bakanlığı mevzuatına hakim Kıdemli Ziraat Mühendisi ve Veri Mimarısın. Her etmeni atomik düzeyde ayır, tablo bütünlüğünü koru.",
        },
      });
    });

    if (!response.text) return [];

    const parsed = JSON.parse(response.text);
    return Array.isArray(parsed) ? parsed : [];
  } finally {
    if (uploadedFile?.name) {
      await ai.files.delete({ name: uploadedFile.name }).catch(() => { });
    }
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

// ─── Ana Pipeline ─────────────────────────────────────────────────────────────

async function processPdf(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "orjut-ingest-"));

  console.log(`\n${"═".repeat(55)}`);
  console.log(`🚀 BAŞLIYOR: ${fileName}`);
  console.log(`${"═".repeat(55)}`);

  try {
    // ── Kontrol: Bu belge zaten işlenmiş mi? ─────────────────
    const { data: existingData, error: checkErr } = await supabase
      .from("tarim_dokumanlari")
      .select("id")
      .eq("dokuman_adi", fileName)
      .limit(1);

    if (!checkErr && existingData && existingData.length > 0) {
      console.log(`ℹ️ "${fileName}" veritabanında zaten mevcut. Atlanıyor (Mükerrer işlem engellendi).`);
      return;
    }

    // ── Adım 1: PDF'i sayfa bazlı böl ──────────────────────
    console.log("\n📄 PDF sayfa bazlı bölünüyor...");
    const pdfChunks = await splitPdfByPages(filePath);
    console.log(`→ ${pdfChunks.length} dilim oluşturuldu.`);

    // ── Adım 2: Her dilimi Gemini ile analiz et ─────────────
    const allComponents: any[] = [];

    for (let i = 0; i < pdfChunks.length; i++) {
      console.log(`\n🧠 Dilim ${i + 1}/${pdfChunks.length} analiz ediliyor...`);
      try {
        const components = await analyzeChunkWithGemini(
          pdfChunks[i],
          tempDir,
          i
        );
        allComponents.push(...components);
        console.log(`   ✅ ${components.length} bileşen çıkarıldı.`);
      } catch (err) {
        console.error(`   ❌ Dilim ${i + 1} hatası:`, err);
      }

      // Kota ve Rate limit koruması: dilimler arası 3 saniye mola
      if (i < pdfChunks.length - 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    console.log(`\n→ Toplam çıkarılan bileşen: ${allComponents.length}`);

    // ── Adım 3: Embed + Supabase yaz ───────────────────────
    console.log("\n💾 Embedding ve Supabase yazımı başlıyor...");
    let successCount = 0;

    for (let i = 0; i < allComponents.length; i++) {
      const comp = allComponents[i];
      const etmen = comp.etmen_adi || "Genel";

      const chunkText = [
        `[Konu: ${etmen}] [Kategori: ${comp.kategori}]`,
        comp.etkilenen_urunler?.length ? `Ürün: ${comp.etkilenen_urunler.join(", ")}` : "",
        comp.fenolojik_evre ? `Evre: ${comp.fenolojik_evre}` : "",
        comp.gorsel_belirtiler ? `Belirti: ${comp.gorsel_belirtiler}` : "",
        comp.ekonomik_zarar_esigi ? `Eşik: ${comp.ekonomik_zarar_esigi}` : "",
        comp.aktif_etken_maddeler?.length ? `Etken Madde: ${comp.aktif_etken_maddeler.join(", ")}` : "",
        comp.ihas_suresi ? `İHAS: ${comp.ihas_suresi}` : "",
        comp.orijinal_metin_ve_tablolar ? `\nDetaylar:\n${comp.orijinal_metin_ve_tablolar}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const embedding = await callWithRetry(() => generateEmbedding(chunkText));

        const { error } = await supabase.from("tarim_dokumanlari").insert({
          dokuman_adi: fileName,
          icerik: chunkText,
          embedding,
          metadata: {
            title: fileName,
            chunk_index: i,
            etmen_adi: etmen,
            kategori: comp.kategori,
            etkilenen_urunler: comp.etkilenen_urunler ?? [],
            hedef_organ: comp.hedef_organ ?? null,
            fenolojik_evre: comp.fenolojik_evre ?? null,
            ekonomik_zarar_esigi: comp.ekonomik_zarar_esigi ?? null,
            aktif_etken_maddeler: comp.aktif_etken_maddeler ?? [],
            uygulama_dozu: comp.uygulama_dozu ?? null,
            ihas_suresi: comp.ihas_suresi ?? null,
            direnc_yonetimi: comp.direnc_yonetimi ?? null,
          },
        });

        if (error) {
          console.error(`   ❌ Supabase hatası (${etmen}): ${error.message}`);
        } else {
          successCount++;
        }
      } catch (e) {
        console.error(`   ❌ Embedding/kayıt hatası (${etmen}):`, e);
      }

      // Her 10 kayıtta bir kısa mola
      if (i > 0 && i % 10 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`\n${"═".repeat(55)}`);
    console.log(`🎉 TAMAMLANDI!`);
    console.log(`   Başarılı : ${successCount}/${allComponents.length} kayıt`);
    console.log(`   Belge    : ${fileName}`);
    console.log(`${"═".repeat(55)}\n`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// ─── CLI Çalıştırma ───────────────────────────────────────────────────────────

(async () => {
  const input = process.argv[2];

  if (!input) {
    console.error("Kullanım:");
    console.error("  Tek PDF : npx tsx scripts/pdf-ingest.ts <dosya.pdf>");
    console.error("  Klasör  : npx tsx scripts/pdf-ingest.ts <klasör/>");
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Bulunamadı: ${input}`);
    process.exit(1);
  }

  const stat = fs.statSync(input);

  if (stat.isDirectory()) {
    const pdfFiles = fs
      .readdirSync(input)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort()
      .map((f) => path.join(input, f));

    if (pdfFiles.length === 0) {
      console.error("Klasörde PDF bulunamadı.");
      process.exit(1);
    }

    console.log(`\n📁 ${pdfFiles.length} PDF bulundu — işlenmeye başlanıyor.`);

    for (let i = 0; i < pdfFiles.length; i++) {
      try {
        await processPdf(pdfFiles[i]);
      } catch (err) {
        console.error(`❌ ${path.basename(pdfFiles[i])} işlenirken hata:`, err);
      }

      if (i < pdfFiles.length - 1) {
        console.log("⏳ Sonraki PDF için güvenli bekleme (5 sn)...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    console.log(`\n✅ Klasördeki tüm PDF tarama işlemleri bitti.`);
  } else {
    await processPdf(input);
  }
})().catch((err) => {
  console.error("Pipeline hatası:", err);
  process.exit(1);
});