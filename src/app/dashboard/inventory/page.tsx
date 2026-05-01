'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Box, Sprout, TrendingUp, Calendar, MapPin, ChevronRight, Activity, ArrowUpRight, BarChart3 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

const CROP_LIFECYCLES: Record<string, number> = {
  'Mısır': 120,
  'Buğday': 240,
  'Arpa': 210,
  'Pamuk': 160,
  'Şeker Pancarı': 180,
  'Ayçiçeği': 130
};

export default function InventoryPage() {
  const { lands, isLoadingLands } = useAppContext();

  const calculateDays = (plantingDate?: string) => {
    if (!plantingDate) return null;
    const diff = new Date().getTime() - new Date(plantingDate).getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days >= 0 ? days : 0;
  };

  const getProgress = (crop: string, plantingDate?: string) => {
    const days = calculateDays(plantingDate);
    if (days === null) return 0;
    const cycle = CROP_LIFECYCLES[crop] || 150;
    return Math.min(100, (days / cycle) * 100);
  };

  const totalExpectedYield = lands.reduce((sum, l) => sum + (l.expected_yield_per_decare || 0) * (l.size_decare || 0), 0);

  return (
    <div className="space-y-6 pb-48">
      {/* Header */}
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Box size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Ürün Envanteri</h1>
            <p className="text-zinc-500 font-medium text-sm">Arazilerdeki ürün durumu ve hasat tahminleri</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Toplam Beklenen Hasat</p>
          <div className="text-2xl font-black text-zinc-900 text-center">{(totalExpectedYield / 1000).toFixed(1)} Ton</div>
        </div>
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">En Çok Ekili Ürün</p>
          <div className="text-2xl font-black text-emerald-600 text-center">
            {Object.entries(lands.reduce((acc, l) => {
              acc[l.crop_type] = (acc[l.crop_type] || 0) + l.size_decare;
              return acc;
            }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
          </div>
        </div>
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Ortalama Gelişim</p>
          <div className="text-2xl font-black text-indigo-600 text-center">
            {lands.length > 0 ? (lands.reduce((sum, l) => sum + getProgress(l.crop_type, l.planting_date), 0) / lands.length).toFixed(0) : 0}%
          </div>
        </div>
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Hasada Kalan (Ort.)</p>
          <div className="text-2xl font-black text-amber-600 text-center">
            {lands.length > 0 ? Math.max(0, Math.floor(lands.reduce((sum, l) => sum + (CROP_LIFECYCLES[l.crop_type] || 150) - (calculateDays(l.planting_date) || 0), 0) / lands.length)) : 0} Gün
          </div>
        </div>
      </div>

      {/* Lands Inventory List */}
      <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 bg-white flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900">Arazi Bazlı Ürün Takibi</h2>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">{lands.length} Parsel</div>
        </div>
        
        <div className="divide-y divide-zinc-50">
          {lands.length > 0 ? (
            lands.map((land) => (
              <div key={land.id} className="p-6 hover:bg-zinc-50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                      <Sprout size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 tracking-tight">{land.district || land.city}</h4>
                      <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} /> Ada {land.block_no} / Parsel {land.parcel_no}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-black text-zinc-600 uppercase">{land.crop_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                      <span className="text-zinc-400">Ürün Gelişim Durumu</span>
                      <span className="text-indigo-600">{getProgress(land.crop_type, land.planting_date).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                        style={{ width: `${getProgress(land.crop_type, land.planting_date)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400">
                      <span>Ekim: {new Date(land.planting_date).toLocaleDateString('tr-TR')}</span>
                      <span>Hasat (Tahmini): {new Date(new Date(land.planting_date).getTime() + (CROP_LIFECYCLES[land.crop_type] || 150) * 86400000).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <div className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Beklenen Hasat</div>
                    <div className="text-xl font-black text-zinc-900 tracking-tight">
                      {((land.expected_yield_per_decare || 0) * (land.size_decare || 0) / 1000).toFixed(1)} Ton
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1 mt-1 uppercase tracking-widest">
                      <TrendingUp size={12} />
                      {land.expected_yield_per_decare} kg/dönüm
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 flex flex-col items-center justify-center">
              <EmptyState message="Henüz bir arazi kaydınız bulunmuyor." icon={Box} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
