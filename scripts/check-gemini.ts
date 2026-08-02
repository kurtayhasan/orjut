import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

// Ortam değişkenlerini yükle
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ HATA: GEMINI_API_KEY bulunamadı!");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function runHealthCheck() {
    console.log("🔍 Gemini API Sağlamlık Testi Başlıyor (Yeni SDK @google/genai)...\n");

    // 1. Text Generation Testi (Model Adı Kontrolü)
    try {
        console.log("⏳ Test 1: Basit Metin Üretimi (gemini-3.5-flash)");
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: "Merhaba, bana sadece 'API Çalışıyor' yaz."
        });
        console.log(`✅ Başarılı: ${response.text}`);
    } catch (error: any) {
        console.error("❌ Başarısız (Metin Üretimi):", error.message);
    }

    // 2. Embedding Testi (Model Adı Kontrolü)
    try {
        console.log("\n⏳ Test 2: Vektör Gömme (gemini-embedding-001)");
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001', 
            contents: "Ziraat Mühendisi RAG Sistemi",
            config: { outputDimensionality: 768 }
        });
        const length = response.embeddings?.[0]?.values?.length;
        console.log(`✅ Başarılı: ${length} boyutlu vektör oluşturuldu.`);
    } catch (error: any) {
        console.error("❌ Başarısız (Embedding):", error.message);
    }

    // 3. File API Quota (Yükleme Testi)
    try {
        console.log("\n⏳ Test 3: File API (Dosya Yükleme İzni)");
        fs.writeFileSync('temp_test.txt', 'Tarım verisi test.');
        
        const uploadResult = await ai.files.upload({ 
            file: 'temp_test.txt', 
            config: { mimeType: 'text/plain' }
        });
        console.log(`✅ Başarılı: Dosya yüklendi (URI: ${uploadResult.uri})`);
        
        await ai.files.delete({ name: uploadResult.name! });
        console.log(`✅ Başarılı: Dosya silindi.`);
        fs.unlinkSync('temp_test.txt');

    } catch (error: any) {
        console.error("❌ Başarısız (File API):", error.message);
    }

    console.log("\n🏁 Test Tamamlandı.");
}

runHealthCheck();
