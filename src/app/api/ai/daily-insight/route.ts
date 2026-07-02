// OFFICIAL: @google/genai SDK — gemini-2.0-flash model
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const DailyInsightSchema = z.object({
  prompt: z.string().min(1, "Analiz için geçerli bir prompt gönderilmelidir.")
});

export const dynamic = 'force-dynamic';

// We initialize the official SDK inside the handler for build-time safety

export async function POST(req: NextRequest) {
  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      cookieStore = cookies();
    }
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!checkRateLimit(session.user.id, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen 1 dakika bekleyin.' },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Geçersiz veri formatı" }, { status: 200 });
    }

    const parseResult = DailyInsightSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: parseResult.error.issues[0]?.message || "Geçersiz parametreler." 
      }, { status: 200 });
    }
    const { prompt } = parseResult.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Yapay zeka analiz motoru şu an yapılandırılmamış (GEMINI_API_KEY eksik)." 
      }, { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // RAG Semantic Search Phase
    const { queryRAGDocuments } = await import('@/lib/ragEngine');
    const ragDocs = await queryRAGDocuments(prompt, 2);
    
    let enhancedPrompt = prompt;
    if (ragDocs && ragDocs.length > 0) {
      enhancedPrompt = `Soru/Bağlam: ${prompt}\n\nAşağıdaki tarımsal veritabanı kaynaklarından yararlan (eğer alakalı ise):\n`;
      ragDocs.forEach((doc: any, i: number) => {
        enhancedPrompt += `[Kaynak ${i+1}]: ${doc.content}\n`;
      });
    }

    let response;
    try {
      // 2. Call the API using the latest official method
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: enhancedPrompt,
      });
    } catch (geminiError: any) {
      console.error('GEMINI_FATAL:', geminiError);
      
      // Graceful fallback for rate limits (429) or quota errors
      if (
        geminiError?.status === 429 ||
        geminiError?.message?.includes('429') ||
        geminiError?.message?.includes('quota') ||
        geminiError?.message?.includes('RESOURCE_EXHAUSTED')
      ) {
        return NextResponse.json({
          success: true,
          insight: 'Sistem yoğunluğu nedeniyle detaylı analiz alınamadı.',
          critical_alert: null,
          recommended_action: 'Lütfen hava durumunu manuel kontrol ederek operasyonlarınıza karar verin.',
          rate_limited: true,
        });
      }

      return NextResponse.json(
        { success: false, error: "Analiz verileri şu an hazırlanamadı, lütfen bekleyiniz." },
        { status: 200 }
      );
    }

    // 3. Extract and clean the response text
    let rawText = '';
    if (response) {
      const anyResponse = response as any;
      if (typeof anyResponse.text === 'function') {
        rawText = anyResponse.text() || '';
      } else {
        rawText = anyResponse.text || '';
      }
    }
    
    let cleanResponse = String(rawText).trim();

    // Strip markdown formatting if Gemini wraps it in ```json ... ```
    const jsonBlockMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      cleanResponse = jsonBlockMatch[1];
    } else {
      const braceMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (braceMatch) cleanResponse = braceMatch[0];
    }

    // 4. Parse and return the result safely
    let data;
    try {
      data = JSON.parse(cleanResponse);
    } catch {
      console.error('JSON parse failed, returning raw text as insight');
      data = { insight: rawText.trim(), critical_alert: null };
    }

    return NextResponse.json({
      success: true,
      insight: data.insight || data.recommendation || rawText.trim(),
      critical_alert: data.critical_alert || null,
      recommended_action: data.recommended_action || null,
    });
  } catch (error: any) {
    console.error('Outer DailyInsight Route Error:', error);
    return NextResponse.json(
      { success: false, error: "Sistem hatası: " + (error?.message || String(error)) },
      { status: 200 }
    );
  }
}
