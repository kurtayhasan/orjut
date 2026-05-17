import { NextResponse } from 'next/server';
import { buildMinifiedRAGContext } from '@/lib/ragEngine';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const AnalyzeSchema = z.object({
  landId: z.string().uuid("Geçersiz arazi kimliği (UUID)."),
  userId: z.string().uuid("Geçersiz kullanıcı kimliği (UUID).")
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // Verify auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parseResult = AnalyzeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: parseResult.error.issues[0]?.message || "Geçersiz parametreler." 
      }, { status: 200 });
    }
    const { landId, userId } = parseResult.data;

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
      return NextResponse.json({ 
        error: "Analiz motoru şu an yoğun veya eksik tarla verisi var. Lütfen masraflarınızı ve arazinizi kontrol edip tekrar deneyiniz." 
      }, { status: 200 });
    }

    // Check GEMINI_API_KEY presence
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "Analiz motoru şu an yoğun veya eksik tarla verisi var. Lütfen masraflarınızı ve arazinizi kontrol edip tekrar deneyiniz." 
      }, { status: 200 });
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

    // Validate prompt string
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ 
        error: "Analiz motoru şu an yoğun veya eksik tarla verisi var. Lütfen masraflarınızı ve arazinizi kontrol edip tekrar deneyiniz." 
      }, { status: 200 });
    }

    let analysis;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      analysis = JSON.parse(responseText || '{}');
    } catch (geminiError) {
      console.error("Gemini AI or JSON parsing failed:", geminiError);
      analysis = {
        risk: "Analiz gerçekleştirilemedi.",
        action: "Hava ve tarla verileri şu an yapay zeka tarafından işlenemiyor, lütfen birazdan tekrar deneyiniz.",
        urgency: "düşük"
      };
    }

    // 4. Save to History (Phase 3)
    try {
      await supabase.from('ai_insights_history').insert([{
        land_id: landId,
        weather_snapshot: {
          temp: context?.CURR?.T ?? 0,
          humidity: context?.CURR?.H ?? 0,
          condition: context?.CURR?.C ?? 'Bilinmiyor'
        },
        ai_recommendation: analysis?.action || 'Tavsiye alınamadı.'
      }]);
    } catch (insertError) {
      console.error("Failed to insert AI insight to history:", insertError);
    }

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error("AI Analysis Route Error:", error);
    return NextResponse.json({ error: "Analiz motoru şu an yoğun veya eksik tarla verisi var. Lütfen masraflarınızı ve arazinizi kontrol edip tekrar deneyiniz." }, { status: 200 });
  }
}
