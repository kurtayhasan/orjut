const AGRO_API_KEY = process.env.NEXT_PUBLIC_AGRO_API_KEY;
const BASE_URL = 'https://api.agromonitoring.com/agro/1.0';

export interface SoilData {
  dt: number;
  t10: number; // Surface temp
  moisture: number; // Soil moisture
  t0: number; // Surface temp (skin)
}

export async function fetchSoilData(lat: number, lon: number): Promise<SoilData | null> {
  if (!AGRO_API_KEY) {
    console.warn("AGRO_API_KEY is not defined, returning mock soil data");
    return null;
  }
  try {
    // Current Soil Data API (by polyId normally, but Agro Monitoring also supports coords for some endpoints,
    // wait, AgroMonitoring Current Soil requires a polyid. If we don't have polyid, we can create one or mock.)
    // Let's create a polygon on the fly or use current weather for Soil Data?
    // Actually, AgroMonitoring soil API: GET http://api.agromonitoring.com/agro/1.0/soil?polyid={polyid}&appid={appid}
    // We can't fetch it without a polyid. We need to create a polygon first if not exists.
    // To simplify and not bloat DB with polygons just for weather, let's check if Open-Meteo has soil moisture.
    // Yes! Open-Meteo has `soil_moisture_0_to_1cm` and `soil_temperature_0cm`.
    throw new Error("Not implemented polyid yet");
  } catch (error) {
    console.error("Failed to fetch Agro Soil Data:", error);
    return null;
  }
}

// NOTE: Since AgroMonitoring requires Polygon Registration (polyid) for Soil Data, 
// a more resilient approach for a "Saha Testi" without complex polygon management 
// is to use Open-Meteo's rich Soil variables which only require lat/lon.
// I will export an Open-Meteo soil fetcher here instead to ensure 100% real data without polyid failures.

export async function fetchOpenMeteoSoilData(lat: number, lon: number) {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'soil_temperature_0cm,soil_moisture_0_to_1cm',
      timezone: 'Europe/Istanbul',
    });
    
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error("OpenMeteo Soil API error");
    const json = await res.json();
    
    if (json.current) {
      return {
        temperature: json.current.soil_temperature_0cm,
        moisture: json.current.soil_moisture_0_to_1cm
      };
    }
    return null;
  } catch (error) {
    console.error("OpenMeteo Soil Error:", error);
    return null;
  }
}
