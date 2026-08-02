import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServer } from '@/lib/supabase/server';
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

    const { message, lands, landId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    const { executeMultiStepRAG } = await import('@/lib/ai/ragEngine');
    
    // We already have supabase (which is getSupabaseServer). 
    // Wait, the earlier code in route.ts created `const supabase = await getSupabaseServer();`.
    const text = await executeMultiStepRAG(message, landId, supabase);

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'AI servisi yanıt veremedi.' }, { status: 500 });
  }
}
