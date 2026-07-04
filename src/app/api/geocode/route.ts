import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate Limit: Geocode max 5 requests per minute
    if (!(await checkRateLimit(session.user.id, 5, 60_000))) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen biraz bekleyin.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'search';
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    let url = '';
    if (type === 'reverse') {
      if (!lat || !lon) return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
      url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    } else {
      if (!q) return NextResponse.json({ error: 'q is required' }, { status: 400 });
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Orjut AgTech OS / 1.0 (Contact: admin@orjut.com)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch geocoding data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
