'use client';
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export default function MarketTrendMini({ data }: { data: { date: string, price: number }[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-16 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ fontSize: '10px', padding: '4px 8px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            labelStyle={{ display: 'none' }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            formatter={(value: any) => [`₺${Number(value || 0).toFixed(2)}`, 'Fiyat']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
