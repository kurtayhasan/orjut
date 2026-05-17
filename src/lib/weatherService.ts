// Open-Meteo — free, no API key required
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL = 3_600_000; // 1 hour in ms

export interface WeatherData {
  temperature: number | null;
  humidity:    number;
  rainfall:    number;
  windSpeed:   number | null;
  uvIndex:     number;
  condition:   string;
  isError?:    boolean;
  forecast: {
    date:        string;
    maxTemp:     number;
    minTemp:     number;
    rainfall:    number;
    description: string;
  }[];
}

// WMO weather code → Turkish description (Lookup table replaces if-else chain)
const WMO_CODES: Record<number, string> = {
  0: 'Açık',
};
const WMO_RANGES: [number, number, string][] = [
  [1,  3,  'Parçalı Bulutlu'],
  [45, 48, 'Sisli'],
  [51, 67, 'Yağmurlu'],
  [71, 77, 'Karlı'],
  [80, 82, 'Sağanak Yağış'],
  [95, 99, 'Fırtına'],
];

function describeWeatherCode(code: number): string {
  if (code in WMO_CODES) return WMO_CODES[code];
  const range = WMO_RANGES.find(([min, max]) => code >= min && code <= max);
  return range ? range[2] : 'Bilinmiyor';
}

const FALLBACK: WeatherData = {
  temperature: null,
  humidity:    0,
  rainfall:    0,
  windSpeed:   null,
  uvIndex:     0,
  condition:   'Hava durumu servisi bekleniyor...',
  isError:     true,
  forecast:    [],
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // SSR guard — localStorage is browser-only
  if (typeof window === 'undefined') return FALLBACK;

  const cacheKey = `weather_cache_${lat}_${lon}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached) as { data: WeatherData; timestamp: number };
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }

  const params = new URLSearchParams({
    latitude:      lat.toString(),
    longitude:     lon.toString(),
    current:       'temperature_2m,relative_humidity_2m,rain,wind_speed_10m,uv_index',
    daily:         'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
    forecast_days: '4',
    timezone:      'Europe/Istanbul',
  });

  try {
    const res  = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    if (!json.current || !json.daily) throw new Error('Invalid weather response');

    const { current: c, daily: d } = json;
    const weather: WeatherData = {
      temperature: c.temperature_2m,
      humidity:    c.relative_humidity_2m,
      rainfall:    c.rain,
      windSpeed:   c.wind_speed_10m,
      uvIndex:     c.uv_index,
      condition:   describeWeatherCode(d.weathercode[0]),
      forecast:    d.time.slice(1, 4).map((date: string, i: number) => ({
        date,
        maxTemp:     d.temperature_2m_max[i + 1],
        minTemp:     d.temperature_2m_min[i + 1],
        rainfall:    d.precipitation_sum[i + 1],
        description: describeWeatherCode(d.weathercode[i + 1]),
      })),
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data: weather, timestamp: Date.now() }));
    return weather;
  } catch (err) {
    console.error('Weather fetch failed:', err);
    return FALLBACK;
  }
}
