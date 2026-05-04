import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildLandContext } from '@/lib/ragEngine';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { landId, userId } = await req.json();

    if (!landId || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Verify Premium Status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (!profile?.is_premium) {
      return NextResponse.json({ 
        error: "Bu özellik sadece Premium üyeler içindir.",
        is_premium: false 
      }, { status: 403 });
    }

    // 2. Build RAG Context
    const context = await buildLandContext(landId);
    if (!context) {
      return NextResponse.json({ error: "Context building failed" }, { status: 500 });
    }

    // 3. Call Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Sen kıdemli bir ziraat mühendisisin. Bu RAG JSON verisini analiz et. 
    Kullanıcının arazisindeki verileri (hava durumu, operasyonlar, NDVI uydu verileri) kullanarak spesifik tavsiyelerde bulun.
    SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
    { "risk": "...", "action": "...", "urgency": "düşük|orta|yüksek" }
    
    Veri: ${JSON.stringify(context)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handling potential markdown fences)
    const jsonStr = responseText.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error("AI Analysis Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
