import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const MOCK_PRICES: Record<string, number> = {
  'Pamuk': 38.5,
  'Buğday': 11.2,
  'Mısır': 9.8,
  'Arpa': 8.5,
  'Şeker Pancarı': 2.3
};

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Normally fetch from an external API or scrape here
    const crops = Object.keys(MOCK_PRICES);
    const inserts = crops.map(crop => ({
      crop_name: crop,
      price_per_kg: MOCK_PRICES[crop] + (Math.random() * 2 - 1), // small fluctuation
      source: 'TMO',
      region: 'Genel'
    }));

    const { error } = await supabaseClient.from('market_prices').insert(inserts);
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'Market prices updated.' }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
