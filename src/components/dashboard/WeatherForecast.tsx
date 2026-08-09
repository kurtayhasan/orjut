'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, CloudFog } from 'lucide-react';
import { Land } from '@/types';

interface WeatherForecastProps {
  lands: Land[];
}

export default function WeatherForecast({ lands }: WeatherForecastProps) {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        let lat = 39.9334;
        let lng = 32.8597;
        
        if (lands && lands.length > 0 && lands[0].lat && lands[0].lng) {
           lat = Number(lands[0].lat);
           lng = Number(lands[0].lng);
        }

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const data = await res.json();
        
        if (data.daily) {
          const days = data.daily.time.map((time: string, i: number) => ({
            date: new Date(time),
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            precipProb: data.daily.precipitation_probability_max[i],
            code: data.daily.weathercode[i]
          }));
          setForecast(days);
        }
      } catch(e) {
        console.error("Weather forecast error:", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchForecast();
  }, [lands]);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="text-amber-400" size={24} />;
    if (code === 2 || code === 3) return <Cloud className="text-zinc-300" size={24} />;
    if (code >= 45 && code <= 48) return <CloudFog className="text-zinc-400" size={24} />;
    if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67)) return <CloudRain className="text-blue-400" size={24} />;
    if (code >= 71 && code <= 77) return <CloudSnow className="text-blue-200" size={24} />;
    if (code >= 80 && code <= 82) return <CloudDrizzle className="text-blue-500" size={24} />;
    if (code >= 95) return <CloudLightning className="text-amber-500" size={24} />;
    return <Sun className="text-amber-400" size={24} />;
  };

  if (loading) {
    return (
      <div className="bg-surface/20 rounded-2xl p-6 border border-white/5 shadow-inner mt-6 animate-pulse">
        <div className="h-6 w-48 bg-surface-3 rounded mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4,5,6,7].map(i => (
             <div key={i} className="min-w-[80px] h-[120px] bg-surface-3 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (forecast.length === 0) return null;

  return (
    <div className="bg-surface-2/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black font-heading tracking-tight text-white flex items-center gap-2">
          📅 7 Günlük Hava Tahmini
        </h3>
        <span className="text-xs font-bold text-text-muted bg-surface-3 px-3 py-1 rounded-full">
          {(lands && lands.length > 0) ? (lands[0].district || lands[0].city) : 'Merkez'}
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
        {forecast.map((day, i) => (
          <div key={i} className="min-w-[90px] snap-center flex flex-col items-center justify-between p-4 bg-surface/40 hover:bg-surface/80 border border-white/5 rounded-2xl transition-colors">
            <span className="text-xs font-black text-text-muted uppercase tracking-wider mb-2">
              {i === 0 ? 'Bugün' : day.date.toLocaleDateString('tr-TR', { weekday: 'short' })}
            </span>
            <div className="my-2 drop-shadow-md">
              {getWeatherIcon(day.code)}
            </div>
            <div className="text-xs font-black text-blue-300 mt-1 mb-3 flex items-center gap-1">
               <CloudRain size={10} /> %{day.precipProb}
            </div>
            <div className="flex items-center gap-2 text-sm font-black">
              <span className="text-white">{day.maxTemp}°</span>
              <span className="text-text-muted/60">{day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
