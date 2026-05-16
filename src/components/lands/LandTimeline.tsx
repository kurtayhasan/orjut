'use client';

import React from 'react';
import { Calendar, Cloud, Bot, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TimelineItem {
  id: string;
  timestamp: string;
  weather_snapshot: {
    temp: number;
    humidity: number;
    condition: string;
  };
  ai_recommendation: string;
}

export default function LandTimeline({ history }: { history: TimelineItem[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted">
          <Calendar size={20} />
        </div>
        <p className="text-sm text-text-muted font-bold">Henüz geçmiş analiz bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {history.map((item) => (
        <div key={item.id} className="relative">
          {/* Dot */}
          <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-surface bg-primary ring-1 ring-border shadow-sm z-10" />
          
          <div className="bg-surface-2 rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors shadow-sm group">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                  {format(new Date(item.timestamp), 'd MMMM yyyy', { locale: tr })}
                </span>
                <span className="text-[10px] font-bold text-text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                  {format(new Date(item.timestamp), 'HH:mm')}
                </span>
              </div>
              
              {item.weather_snapshot && (
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Cloud size={12} className="text-info" />
                    <span>{item.weather_snapshot.temp}°C / {item.weather_snapshot.humidity}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 mt-1">
                <Bot size={16} className="text-primary" />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {item.ai_recommendation}
              </p>
            </div>
            
            <div className="mt-3 flex justify-end">
               <button className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 Detaylar <ChevronRight size={10} />
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
