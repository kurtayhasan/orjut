'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryPieChart({ data }: { data: any[] }) {
  // data: { name: 'Mazot', value: 12000, color: '#F97316' }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => `₺${Number(value || 0).toLocaleString()}`}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-6 px-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider min-w-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></div>
            <span className="truncate">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
