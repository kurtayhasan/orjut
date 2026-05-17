import { supabase } from './supabase';
import { fetchWeather } from './weatherService';

export async function buildLandContext(landId: string) {
  try {
    // 1. Fetch Land Details
    const { data: land } = await supabase.from('lands').select('*').eq('id', landId).single();

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

    // 6. Fetch current weather with isolated try-catch and safe coordinate handling
    let weather;
    try {
      const latVal = (land?.lat !== undefined && land?.lat !== null && !isNaN(Number(land.lat))) ? Number(land.lat) : 37.7478;
      const lngVal = (land?.lng !== undefined && land?.lng !== null && !isNaN(Number(land.lng))) ? Number(land.lng) : 27.3971;
      weather = await fetchWeather(latVal, lngVal);
    } catch (weatherErr) {
      console.error("RAG Weather fetch failed, using fallback:", weatherErr);
      weather = {
        temperature: null,
        humidity: 0,
        rainfall: 0,
        windSpeed: null,
        uvIndex: 0,
        condition: 'Hava durumu verisi şu an alınamadı',
        isError: true,
        forecast: []
      };
    }

    // Aggregate Context (Bulletproof defaults)
    return {
      land: {
        crop: land?.crop_type || 'Bilinmiyor',
        size: land?.size_decare || 0,
        city: land?.city || 'Bilinmiyor',
        planting_date: land?.planting_date || new Date().toISOString(),
        environment: land?.environment_type || 'acik'
      },
      recent_operations: Array.isArray(operations) ? operations : [],
      latest_scouting: Array.isArray(scoutingLogs) && scoutingLogs.length > 0 ? scoutingLogs[0] : null,
      scouting_logs: Array.isArray(scoutingLogs) ? scoutingLogs : [],
      recent_transactions: Array.isArray(transactions) ? transactions : [],
      latest_ndvi: ndvi ? { mean: ndvi?.mean ?? 0, date: ndvi?.date ?? '' } : null,
      current_weather: weather || { temperature: null, humidity: 0, rainfall: 0, windSpeed: null, uvIndex: 0, condition: 'Hava durumu verisi şu an alınamadı', forecast: [] },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("RAG Context Building Error:", error);
    // Bulletproof fallback return structure instead of null
    return {
      land: { crop: 'Bilinmiyor', size: 0, city: 'Bilinmiyor', planting_date: new Date().toISOString(), environment: 'acik' },
      recent_operations: [],
      latest_scouting: null,
      scouting_logs: [],
      recent_transactions: [],
      latest_ndvi: null,
      current_weather: { temperature: null, humidity: 0, rainfall: 0, windSpeed: null, uvIndex: 0, condition: 'Hava durumu verisi şu an alınamadı', forecast: [] },
      timestamp: new Date().toISOString()
    };
  }
}

export async function buildMinifiedRAGContext(landId: string) {
  try {
    const { data: land } = await supabase.from('lands').select('*').eq('id', landId).single();

    // Fetch last 3 history records for context
    const { data: history } = await supabase
      .from('ai_insights_history')
      .select('*')
      .eq('land_id', landId)
      .order('timestamp', { ascending: false })
      .limit(3);

    // Fetch current weather with isolated try-catch and safe coordinate handling
    let weather;
    try {
      const latVal = (land?.lat !== undefined && land?.lat !== null && !isNaN(Number(land.lat))) ? Number(land.lat) : 37.7478;
      const lngVal = (land?.lng !== undefined && land?.lng !== null && !isNaN(Number(land.lng))) ? Number(land.lng) : 27.3971;
      weather = await fetchWeather(latVal, lngVal);
    } catch (weatherErr) {
      console.error("Minified RAG Weather fetch failed, using fallback:", weatherErr);
      weather = {
        temperature: null,
        humidity: 0,
        rainfall: 0,
        windSpeed: null,
        uvIndex: 0,
        condition: 'Hava durumu verisi şu an alınamadı',
        isError: true,
        forecast: []
      };
    }

    // Minified format: CTX:[{D:"MM-DD", T:temp, H:hum, ACT:"recommendation"}], CURR:{T:temp, H:hum}
    const minifiedHistory = (Array.isArray(history) ? history : [])?.map(h => ({
      D: h?.timestamp && typeof h.timestamp === 'string' ? h.timestamp.split('T')?.[0]?.slice(5) || '' : '',
      T: h?.weather_snapshot?.temp ?? 0,
      H: h?.weather_snapshot?.humidity ?? 0,
      ACT: h?.ai_recommendation && typeof h.ai_recommendation === 'string' ? h.ai_recommendation.slice(0, 30) : ''
    })) || [];

    return {
      LAND: { C: land?.crop_type || 'Bilinmiyor', S: land?.size_decare || 0, E: land?.environment_type === 'sera' ? 'S' : 'A' },
      CTX: minifiedHistory,
      CURR: { T: weather?.temperature || 0, H: weather?.humidity || 0, C: weather?.condition || 'Bilinmiyor' },
      RAW_WEATHER: weather // Keep for insertion into history
    };
  } catch (error) {
    console.error("Minified RAG Error:", error);
    // Bulletproof fallback return structure instead of null
    return {
      LAND: { C: 'Bilinmiyor', S: 0, E: 'A' },
      CTX: [],
      CURR: { T: 0, H: 0, C: 'Hava durumu verisi şu an alınamadı' },
      RAW_WEATHER: { temperature: null, humidity: 0, rainfall: 0, windSpeed: null, uvIndex: 0, condition: 'Hava durumu verisi şu an alınamadı', forecast: [] }
    };
  }
}
