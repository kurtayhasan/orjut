import { supabase } from './supabase';
import { fetchWeather } from './weatherService';

export async function buildLandContext(landId: string) {
  try {
    // 1. Fetch Land Details
    const { data: land } = await supabase.from('lands').select('*').eq('id', landId).single();
    if (!land) throw new Error("Land not found");

    // 2. Fetch last 3 field operations
    const { data: operations } = await supabase
      .from('field_operations')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(3);

    // 3. Fetch last 15 scouting logs (Token Limit Protection)
    const { data: scoutingLogs } = await supabase
      .from('scouting_logs')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(15);

    // 4. Fetch last 20 transactions/expenses (Token Limit Protection)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(20);

    // 5. Fetch latest NDVI snapshot
    const { data: ndvi } = await supabase
      .from('ndvi_snapshots')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // 6. Fetch current weather
    const weather = await fetchWeather(land.lat, land.lng);

    // Aggregate Context
    return {
      land: {
        crop: land.crop_type,
        size: land.size_decare,
        city: land.city,
        planting_date: land.planting_date,
        environment: land.environment_type
      },
      recent_operations: operations || [],
      latest_scouting: scoutingLogs?.[0] || null,
      scouting_logs: scoutingLogs || [],
      recent_transactions: transactions || [],
      latest_ndvi: ndvi ? { mean: ndvi.mean, date: ndvi.date } : null,
      current_weather: weather,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("RAG Context Building Error:", error);
    return null;
  }
}

export async function buildMinifiedRAGContext(landId: string) {
  try {
    const { data: land } = await supabase.from('lands').select('*').eq('id', landId).single();
    if (!land) throw new Error("Land not found");

    // Fetch last 3 history records for context
    const { data: history } = await supabase
      .from('ai_insights_history')
      .select('*')
      .eq('land_id', landId)
      .order('timestamp', { ascending: false })
      .limit(3);

    const weather = await fetchWeather(land.lat, land.lng);

    // Minified format: CTX:[{D:"MM-DD", T:temp, H:hum, ACT:"recommendation"}], CURR:{T:temp, H:hum}
    const minifiedHistory = history?.map(h => ({
      D: h.timestamp ? h.timestamp.split('T')[0].slice(5) : '',
      T: h.weather_snapshot?.temp,
      H: h.weather_snapshot?.humidity,
      ACT: h.ai_recommendation?.slice(0, 30) // Limit recommendation length in context
    })) || [];

    return {
      LAND: { C: land.crop_type, S: land.size_decare, E: land.environment_type === 'sera' ? 'S' : 'A' },
      CTX: minifiedHistory,
      CURR: { T: weather.temperature, H: weather.humidity, C: weather.condition },
      RAW_WEATHER: weather // Keep for insertion into history
    };
  } catch (error) {
    console.error("Minified RAG Error:", error);
    return null;
  }
}
