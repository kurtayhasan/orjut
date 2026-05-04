import { supabase } from './supabase';
import { getWeather } from './services';

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

    // 3. Fetch latest scouting log
    const { data: scouting } = await supabase
      .from('scouting_logs')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // 4. Fetch latest NDVI snapshot
    const { data: ndvi } = await supabase
      .from('ndvi_snapshots')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // 5. Fetch current weather
    const weather = await getWeather(land.lat, land.lng);

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
      latest_scouting: scouting || null,
      latest_ndvi: ndvi ? { mean: ndvi.mean, date: ndvi.date } : null,
      current_weather: weather,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("RAG Context Building Error:", error);
    return null;
  }
}
