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
    
    // Clean markdown if present
    if (responseText.startsWith('```json')) responseText = responseText.substring(7);
    if (responseText.startsWith('```')) responseText = responseText.substring(3);
    if (responseText.endsWith('```')) responseText = responseText.substring(0, responseText.length - 3);
    responseText = responseText.trim();

    // Sometimes Gemini adds extra words before/after JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const data = JSON.parse(responseText);

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
