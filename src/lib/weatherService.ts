// Open-Meteo — tamamen ücretsiz, API key yok
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
  temperature: number;      // °C
  humidity: number;         // %
  rainfall: number;         // mm (bugün)
  windSpeed: number;        // km/h
  uvIndex: number;          // 0-11
  condition: string;        // "Açık", "Yağmurlu" vb.
  forecast: {               // önümüzdeki 3 gün
    date: string;
    maxTemp: number;
    minTemp: number;
    rainfall: number;
    description: string;    // "Yağmurlu", "Güneşli" vb.
  }[];
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // Check cache
  const cacheKey = `weather_cache_${lat}_${lon}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 3600000) { // 1 hour
      return data;
    }
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,rain,wind_speed_10m,uv_index',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
    forecast_days: '4',
    timezone: 'Europe/Istanbul'
  });
  
  try {
    const res = await fetch(`${BASE_URL}?${params}`);
    const data = await res.json();
    
    if (!data.current || !data.daily) throw new Error("Invalid weather data");

    const weather: WeatherData = {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfall: data.current.rain,
      windSpeed: data.current.wind_speed_10m,
      uvIndex: data.current.uv_index,
      condition: getWeatherDescription(data.daily.weathercode[0]),
      forecast: data.daily.time.slice(1, 4).map((time: string, i: number) => ({
        date: time,
        maxTemp: data.daily.temperature_2m_max[i+1],
        minTemp: data.daily.temperature_2m_min[i+1],
        rainfall: data.daily.precipitation_sum[i+1],
        description: getWeatherDescription(data.daily.weathercode[i+1])
      }))
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data: weather, timestamp: Date.now() }));
    return weather;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    // Return a safe fallback or throw depending on UI requirements. 
    // Here we throw to let the caller handle it or use cached data.
    throw error;
  }
}

// WMO weather code'larını Türkçe açıklamaya çevir
function getWeatherDescription(code: number): string {
  if (code === 0) return "Açık";
  if (code >= 1 && code <= 3) return "Parçalı Bulutlu";
  if (code >= 45 && code <= 48) return "Sisli";
  if (code >= 51 && code <= 67) return "Yağmurlu";
  if (code >= 71 && code <= 77) return "Karlı";
  if (code >= 80 && code <= 82) return "Sağanak Yağış";
  if (code >= 95 && code <= 99) return "Fırtına";
  return "Bilinmiyor";
}
