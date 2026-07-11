import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!(await checkRateLimit(session.user.id, 15, 60_000))) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen biraz bekleyin.' }, { status: 429 });
    }

    const { message, lands } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Yapay zeka analiz motoru şu an yapılandırılmamış.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemContext = `Sen profesyonel bir tarım danışmanısın. Çiftçilere, ziraat mühendislerine ve tarım işletmelerine yardımcı oluyorsun.
Kullanıcının arazileri hakkında kısa bilgi: ${JSON.stringify(lands || [])}
Kullanıcıya nazik, profesyonel, doğrudan ve bilimsel verilere dayanan kısa cevaplar ver. Uzun destanlar yazma, kolay okunabilir formatlar (maddeleme vb.) kullan.`;

    const fullPrompt = `${systemContext}\n\nKullanıcı: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt,
    });

    let text = response.text || '';

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'AI servisi yanıt veremedi.' }, { status: 500 });
  }
}
