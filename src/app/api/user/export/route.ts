import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  if (!checkRateLimit(userId, 5, 3600_000)) {
    return NextResponse.json({ error: 'Too many export requests. Try again later.' }, { status: 429 });
  }

  try {
    const [profile, lands, transactions, seasons, fieldOps, scouting, irrigation, inventory] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('lands').select('*').eq('org_id', userId),
      supabase.from('transactions').select('*').eq('org_id', userId),
      supabase.from('seasons').select('*').eq('org_id', userId),
      supabase.from('field_operations').select('*').eq('org_id', userId),
      supabase.from('scouting_logs').select('*').eq('org_id', userId),
      supabase.from('irrigation_logs').select('*').eq('org_id', userId),
      supabase.from('inventory').select('*').eq('org_id', userId),
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user: profile.data,
      data: {
        lands: lands.data || [],
        transactions: transactions.data || [],
        seasons: seasons.data || [],
        field_operations: fieldOps.data || [],
        scouting_logs: scouting.data || [],
        irrigation_logs: irrigation.data || [],
        inventory: inventory.data || []
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="orjut_export_${userId}.json"`
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Data export failed', details: err.message }, { status: 500 });
  }
}
