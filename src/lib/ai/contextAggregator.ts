import { supabase } from '@/lib/supabase/client';
import { fetchWeather } from '@/lib/weatherService';

export async function getLandContextText(landId: string): Promise<string> {
  try {
    // 1. Fetch Land Details
    const { data: land } = await supabase.from('lands').select('*').eq('id', landId).single();
    if (!land) return 'Belirtilen arazi bulunamadı.';

    // 2. Fetch last 3 field operations
    const { data: operations } = await supabase
      .from('field_operations')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(3);

    // 3. Fetch latest NDVI snapshot
    const { data: ndvi } = await supabase
      .from('ndvi_snapshots')
      .select('*')
      .eq('land_id', landId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Fetch current weather
    let weatherText = 'Hava durumu verisi alınamadı.';
    try {
      const latVal = (land.lat !== undefined && land.lat !== null && !isNaN(Number(land.lat))) ? Number(land.lat) : 37.7478;
      const lngVal = (land.lng !== undefined && land.lng !== null && !isNaN(Number(land.lng))) ? Number(land.lng) : 27.3971;
      const weather = await fetchWeather(latVal, lngVal);
      if (weather && !weather.isError) {
        weatherText = `${weather.temperature}°C, Nem: %${weather.humidity}, Durum: ${weather.condition}`;
      }
    } catch (err) {
      console.warn('Weather fetch failed in context aggregator');
    }

    // Build plain Turkish text
    let contextStr = `Tarla Bilgisi: ${land.city} bölgesinde, ${land.size_decare} dekar alanda ${land.crop_type} ekili.\n`;
    contextStr += `Anlık Hava Durumu: ${weatherText}\n`;
    
    if (ndvi) {
      contextStr += `Son NDVI Durumu: Ortalama ${ndvi.mean} (Tarih: ${ndvi.date})\n`;
    }

    if (operations && operations.length > 0) {
      const opsText = operations.map(o => `${o.type} (${o.date})`).join(', ');
      contextStr += `Son Saha Operasyonları: ${opsText}\n`;
    } else {
      contextStr += `Son Saha Operasyonları: Kayıtlı işlem yok.\n`;
    }

    return contextStr;
  } catch (error) {
    console.error('Error in contextAggregator:', error);
    return 'Arazi bağlamı alınırken bir hata oluştu.';
  }
}
