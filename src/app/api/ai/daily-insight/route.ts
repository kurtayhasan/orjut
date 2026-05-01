import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Robust JSON extraction
    let cleanResponse = responseText;
    const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      cleanResponse = jsonBlockMatch[1];
    } else {
      const braceMatch = responseText.match(/\{[\s\S]*\}/);
      if (braceMatch) cleanResponse = braceMatch[0];
    }

    let data;
    try {
      data = JSON.parse(cleanResponse);
    } catch (e) {
      console.warn("JSON Parse failed, falling back to text", cleanResponse);
      data = { insight: responseText, critical_alert: null };
    }

    return NextResponse.json({ 
      success: true, 
      insight: data.insight || data.recommendation || responseText, 
      critical_alert: data.critical_alert || null 
    });
  } catch (error: any) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
