// Vercel Cron Job: Daily Briefing — runs at 06:00 TR time (03:00 UTC)
// This endpoint is triggered automatically by Vercel's cron scheduler
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Authentication
  const authHeader = req.headers.get('authorization');
  
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET is missing in environment variables');
    return NextResponse.json({ error: 'Cron is not properly configured' }, { status: 500 });
  }

  const isCronTokenValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCronTokenValid) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON secret' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
    return NextResponse.json({ error: 'Service role key is missing' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Fetch all users with lands
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name');

    if (profileError || !profiles) {
      throw new Error('Failed to fetch profiles');
    }

    let briefingsSent = 0;

    for (const profile of profiles) {
      // Get this user's lands
      const { data: lands } = await supabase
        .from('lands')
        .select('*')
        .eq('org_id', profile.id)
        .limit(5);

      if (!lands || lands.length === 0) continue;

      // Build a brief prompt
      const landsSummary = lands.map(l => 
        `${l.size_decare} dönüm ${l.crop_type} (${l.city})`
      ).join(', ');

      const prompt = `Sen kıdemli bir ziraat danışmanısın. Kullanıcı ${profile.first_name}'in arazileri: ${landsSummary}. Bugün ${new Date().toLocaleDateString('tr-TR')} tarihi itibariyle kısa, net bir sabah brifing'i hazırla. SADECE JSON: {"insight": "...", "critical_alert": "..."}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
        });

        const text = response.text ?? '';
        briefingsSent++;
      } catch (aiError) {
        console.error(`AI error for user ${profile.id}:`, aiError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily briefing completed. ${briefingsSent} briefings generated.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
