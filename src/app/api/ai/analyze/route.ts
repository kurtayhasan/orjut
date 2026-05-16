import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildMinifiedRAGContext } from '@/lib/ragEngine';
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

    // 2. Build Minified RAG Context (Phase 5)
    const context: any = await buildMinifiedRAGContext(landId);
    if (!context) {
      return NextResponse.json({ error: "Context building failed" }, { status: 500 });
    }

    // 3. Call Gemini AI with forced JSON mode
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Using 1.5 flash for reliable JSON mode
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Sen kıdemli bir ziraat mühendisisin. Bu ultra-sıkıştırılmış (minified) veriyi analiz et:
    LAND: {C:Ürün, S:Alan, E:A(Açık)/S(Sera)}
    CTX: Geçmiş kayıtlar
    CURR: Güncel hava (T:Sıcaklık, H:Nem, C:Durum)

    Kullanıcının tarlası için riskleri ve eylem planını belirle.
    SADECE şu JSON formatında yanıt ver:
    { "risk": "...", "action": "...", "urgency": "düşük|orta|yüksek" }
    
    Veri: ${JSON.stringify(context)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const analysis = JSON.parse(responseText);

    // 4. Save to History (Phase 3)
    await supabase.from('ai_insights_history').insert([{
      land_id: landId,
      weather_snapshot: {
        temp: context.CURR.T,
        humidity: context.CURR.H,
        condition: context.CURR.C
      },
      ai_recommendation: analysis.action
    }]);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error("AI Analysis Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
