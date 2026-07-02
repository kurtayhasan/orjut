import { useState, useCallback } from 'react';
import { fetchWeather, WeatherData } from '@/lib/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherForLocation = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, fetchWeatherForLocation, setWeather };
};
