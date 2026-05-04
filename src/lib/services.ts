import { NDVISnapshot } from '@/types';

export async function getWeather(lat: number, lng: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=tr`);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}

export async function getNDVI(landId: string, geoJSON: any): Promise<Partial<NDVISnapshot> | null> {
  // In a real scenario, this would call AgroMonitoring API with the land's polygon.
  // MOCK Implementation for MVP:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        land_id: landId,
        date: new Date().toISOString().split('T')[0],
        mean: 0.65 + (Math.random() * 0.1),
        min: 0.42,
        max: 0.81,
        cloud_cover: Math.floor(Math.random() * 10),
        // AgroMonitoring Tile URL pattern
        tile_url: `https://api.agromonitoring.com/tile/1.0/{z}/{x}/{y}/TRUE_COLOR/{id}?appid=${process.env.AGROMONITORING_API_KEY}`
      });
    }, 1000);
  });
}
