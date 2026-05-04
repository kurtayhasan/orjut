'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Droplet, Plus, Trash2, Calendar, MapPin, Search, FlaskConical, Bug, Filter, Clock, Box } from 'lucide-react';
import { toast } from 'sonner';

export default function OperationsPage() {
  const { lands, fieldOperations, addFieldOperation, deleteFieldOperation, inventory } = useAppContext();
  
  const [selectedLandId, setSelectedLandId] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [type, setType] = useState<'su' | 'gubre' | 'ilac'>('su');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [method, setMethod] = useState('');
  const [periodDays, setPeriodDays] = useState('');
  const [notes, setNotes] = useState('');
  
  const [filter, setFilter] = useState<'all' | 'su' | 'gubre' | 'ilac'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !date || !amount || !unit || !method) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    await addFieldOperation({
      land_id: selectedLandId,
      type,
      date,
      amount: Number(amount),
      unit,
      method,
      period_days: periodDays ? Number(periodDays) : undefined,
      inventory_id: selectedInventoryId || undefined,
      notes
    });
    setIsSubmitting(false);
    
    // Reset form
    setAmount('');
    setNotes('');
    setPeriodDays('');
  };

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    if (!land) return 'Bilinmeyen Arazi';
    return `${land.district || land.city} - Ada ${land.block_no} / Parsel ${land.parcel_no}`;
  };

  const filteredOps = fieldOperations.filter(op => filter === 'all' || op.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'su': return <Droplet size={20} />;
      case 'gubre': return <FlaskConical size={20} />;
      case 'ilac': return <Bug size={20} />;
      default: return <Droplet size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'su': return 'bg-blue-100 text-blue-600';
      case 'gubre': return 'bg-emerald-100 text-emerald-600';
      case 'ilac': return 'bg-amber-100 text-amber-600';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'su': return 'Sulama';
      case 'gubre': return 'Gübreleme';
      case 'ilac': return 'İlaçlama';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Filter size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Zirai İşlemler</h1>
            <p className="text-zinc-500 font-medium text-sm">Sulama, gübreleme ve ilaçlama yönetimi</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-500" /> Yeni İşlem Kaydı
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">İşlem Tipi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['su', 'gubre', 'ilac'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        if (t === 'su') setUnit('saat');
                        else if (t === 'gubre') setUnit('kg');
                        else setUnit('lt');
                      }}
                      className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${type === t ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-white hover:border-zinc-200'}`}
                    >
                      {getTypeIcon(t)}
                      <span className="text-[10px] font-bold uppercase">{getTypeLabel(t)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Arazi Seçimi</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={selectedLandId}
                    onChange={e => setSelectedLandId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Arazi seçin...</option>
                    {lands.map(l => (
                      <option key={l.id} value={l.id}>{getLandDisplay(l.id)} ({l.crop_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Tarih</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Miktar</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    placeholder="Örn: 10"
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Birim</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  >
                    <option value="" disabled>Seçiniz</option>
                    {type === 'su' ? (
                      <>
                        <option value="saat">Saat</option>
                        <option value="ton">Ton</option>
                        <option value="m3">m³</option>
                        <option value="litre">Litre</option>
                      </>
                    ) : type === 'gubre' ? (
                      <>
                        <option value="kg">kg</option>
                        <option value="paket">Paket</option>
                        <option value="lt">Litre</option>
                        <option value="cuval">Çuval</option>
                      </>
                    ) : (
                      <>
                        <option value="lt">Litre</option>
                        <option value="cc">cc</option>
                        <option value="gr">Gram</option>
                        <option value="paket">Paket</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Inventory Linkage */}
              {(type === 'gubre' || type === 'ilac') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Stoktan Düş (Opsiyonel)</label>
                  <div className="relative">
                    <Box size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <select 
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
                      value={selectedInventoryId}
                      onChange={e => {
                        setSelectedInventoryId(e.target.value);
                        const item = inventory.find(i => i.id === e.target.value);
                        if (item) {
                          setUnit(item.unit);
                          setMethod(item.name);
                        }
                      }}
                    >
                      <option value="">Stok seçilmedi</option>
                      {inventory.filter(i => i.type === type).map(i => (
                        <option key={i.id} value={i.id}>{i.name} (Kalan: {i.quantity} {i.unit})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Yöntem / Uygulama</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                  >
                    <option value="" disabled>Yöntem seçin...</option>
                    {type === 'su' ? (
                      <>
                        <option value="Damlama">Damlama</option>
                        <option value="Salma">Salma</option>
                        <option value="Yağmurlama">Yağmurlama</option>
                        <option value="Pivot">Pivot</option>
                      </>
                    ) : type === 'gubre' ? (
                      <>
                        <option value="Taban Gübresi">Taban Gübresi</option>
                        <option value="Üst Gübre">Üst Gübre</option>
                        <option value="Yaprak Gübresi">Yaprak Gübresi</option>
                        <option value="Fertigasyon">Fertigasyon (Damlama ile)</option>
                      </>
                    ) : (
                      <>
                        <option value="Pülverizatör">Pülverizatör (Traktör)</option>
                        <option value="Atomizör">Atomizör</option>
                        <option value="Sırt Pompası">Sırt Pompası</option>
                        <option value="Dron">Dron ile Uygulama</option>
                      </>
                    )}
                    <option value="Diger">Diğer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Periyot (Gün)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                    <input 
                      type="number"
                      placeholder="Opsiyonel"
                      className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold"
                      value={periodDays}
                      onChange={e => setPeriodDays(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Not (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  placeholder="Hava rüzgarlıydı, verim iyi bekliyoruz vb."
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold resize-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <Search size={20} className="text-zinc-400" /> İşlem Geçmişi
              </h2>
              
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                {(['all', 'su', 'gubre', 'ilac'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    {f === 'all' ? 'Tümü' : getTypeLabel(f)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredOps.length === 0 ? (
                <div className="text-center p-12 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                  <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter size={28} />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">Henüz Kayıt Yok</h3>
                  <p className="text-zinc-500 text-sm">Arazilerinize ait zirai işlemleri buradan takip edebilirsiniz.</p>
                </div>
              ) : (
                filteredOps.map(op => (
                  <div key={op.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getTypeColor(op.type)}`}>
                        {getTypeIcon(op.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-900">{getLandDisplay(op.land_id)}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getTypeColor(op.type)}`}>
                            {getTypeLabel(op.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-1">
                          <span>{new Date(op.date).toLocaleDateString('tr-TR')}</span>
                          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                          <span>{op.method}</span>
                          {op.period_days && (
                            <>
                              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                              <span className="text-indigo-600">{op.period_days} Günlük Periyot</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-black text-lg text-zinc-900">{op.amount}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{op.unit}</div>
                      </div>
                      <button 
                        onClick={() => deleteFieldOperation(op.id)}
                        className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Kaydı Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
