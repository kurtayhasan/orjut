// OFFICIAL: @google/genai SDK — gemini-2.0-flash model
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// 1. Initialize the official SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // 2. Call the API using the latest official method
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
    });

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
      console.warn('JSON parse failed, returning raw text as insight');
      data = { insight: rawText.trim(), critical_alert: null };
    }

    return NextResponse.json({
      success: true,
      insight: data.insight || data.recommendation || rawText.trim(),
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
