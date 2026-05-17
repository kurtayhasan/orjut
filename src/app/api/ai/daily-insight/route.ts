// OFFICIAL: @google/genai SDK — gemini-2.0-flash model
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const DailyInsightSchema = z.object({
  prompt: z.string().min(1, "Analiz için geçerli bir prompt gönderilmelidir.")
});

export const dynamic = 'force-dynamic';

// 1. Initialize the official SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await (cookies() as any);
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    let response;
    try {
      // 2. Call the API using the latest official method
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
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
    const rawText = response.text ?? '';
    let cleanResponse = rawText.trim();

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
      { success: false, error: "Sistem hatası. Lütfen birazdan tekrar deneyiniz." },
      { status: 200 }
    );
  }
}
