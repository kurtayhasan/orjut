// CRITICAL FIX: Official Google Generative AI SDK implementation
// Model: gemini-1.5-flash (free-tier compatible)
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize the official SDK with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// 2. Get the stable, free-tier friendly model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // 3. Call the API using the official method
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 4. Strip markdown formatting if Gemini returns it (e.g., ```json ... ```)
    let cleanResponse = text.trim();
    const jsonBlockMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      cleanResponse = jsonBlockMatch[1];
    } else {
      const braceMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (braceMatch) cleanResponse = braceMatch[0];
    }

    // 5. Parse and return the result safely
    let data;
    try {
      data = JSON.parse(cleanResponse);
    } catch {
      console.warn('JSON parse failed, returning raw text as insight');
      data = { insight: text.trim(), critical_alert: null };
    }

    return NextResponse.json({
      success: true,
      insight: data.insight || data.recommendation || text.trim(),
      critical_alert: data.critical_alert || null,
      recommended_action: data.recommended_action || null,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Graceful fallback for rate limits (429) or quota errors
    if (
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED')
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
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
