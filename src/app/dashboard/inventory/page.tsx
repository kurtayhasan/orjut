'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Box, Sprout, TrendingUp, Calendar, MapPin, ChevronRight, Activity, ArrowUpRight, BarChart3, Plus, Trash2, Package, Filter, AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';

const CROP_LIFECYCLES: Record<string, number> = {
  'Mısır': 120,
  'Buğday': 240,
  'Arpa': 210,
  'Pamuk': 160,
  'Şeker Pancarı': 180,
  'Ayçiçeği': 130
};

export default function InventoryPage() {
  const { lands, inventory, addInventoryItem, deleteInventoryItem } = useAppContext();
  const [view, setView] = useState<'crops' | 'inputs'>('crops');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Item State
  const [name, setName] = useState('');
  const [type, setType] = useState<'gubre' | 'ilac' | 'tohum' | 'diger'>('gubre');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unit) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    await addInventoryItem({ name, type, quantity: Number(quantity), unit });
    setName(''); setQuantity(''); setUnit(''); setShowAddForm(false);
  };

  const totalExpectedYield = lands.reduce((sum, l) => sum + (l.expected_yield_per_decare || 0) * (l.size_decare || 0), 0);

  return (
    <div className="space-y-6 pb-48">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Box size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Envanter Yönetimi</h1>
            <p className="text-zinc-500 font-medium text-sm">Ürün gelişimleri ve stok takibi</p>
          </div>
        </div>
        
        <div className="flex p-1 bg-zinc-100 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setView('crops')}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${view === 'crops' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Ürünler (Arazide)
          </button>
          <button 
            onClick={() => setView('inputs')}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${view === 'inputs' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Stok (Depoda)
          </button>
        </div>
      </header>

      {view === 'crops' ? (
        <>
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
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-emerald-500" /> Yeni Stok Ekle
              </h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ürün Adı</label>
                  <input type="text" placeholder="Örn: Üre Gübresi" className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-semibold" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-semibold appearance-none cursor-pointer" value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="gubre">🌱 Gübre</option>
                    <option value="ilac">🧪 İlaç</option>
                    <option value="tohum">🌾 Tohum</option>
                    <option value="diger">📦 Diğer</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Miktar</label>
                    <input type="number" placeholder="0" className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-semibold" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Birim</label>
                    <select className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-semibold appearance-none cursor-pointer" value={unit} onChange={e => setUnit(e.target.value)} required>
                      <option value="" disabled>Seçiniz</option>
                      <option value="kg">kg</option>
                      <option value="lt">lt</option>
                      <option value="paket">paket</option>
                      <option value="cuval">çuval</option>
                      <option value="adet">adet</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Ekle</button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
              <div className="p-5 border-b border-zinc-100 bg-white flex justify-between items-center">
                <h2 className="text-base font-bold text-zinc-900">Mevcut Stoklar</h2>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{inventory.length} Ürün</div>
              </div>
              <div className="divide-y divide-zinc-50">
                {inventory.length > 0 ? (
                  inventory.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-xl">
                          {item.type === 'gubre' ? '🌱' : item.type === 'ilac' ? '🧪' : item.type === 'tohum' ? '🌾' : '📦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">{item.name}</h4>
                          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-lg font-black ${item.quantity < 10 ? 'text-rose-500' : 'text-zinc-900'}`}>{item.quantity}</div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.unit}</div>
                        </div>
                        <button onClick={() => deleteInventoryItem(item.id)} className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 flex flex-col items-center justify-center text-zinc-400 italic">
                    <Package size={48} className="mb-4 opacity-10" />
                    Henüz stok kaydı bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
