'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ClipboardCheck, Plus, Trash2, Calendar, MapPin, Search, HeartPulse, Sprout, Wheat, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function ScoutingPage() {
  const { lands, scoutingLogs, addScoutingLog, deleteScoutingLog } = useAppContext();
  
  const [selectedLandId, setSelectedLandId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [growthStage, setGrowthStage] = useState<'cimlenme' | 'ciceklenme' | 'meyve_tutumu' | 'hasat'>('cimlenme');
  const [healthStatus, setHealthStatus] = useState<'saglikli' | 'hastalik' | 'zararli'>('saglikli');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !date || !growthStage || !healthStatus) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    await addScoutingLog({
      land_id: selectedLandId,
      date,
      growth_stage: growthStage,
      health_status: healthStatus,
      notes
    });
    setIsSubmitting(false);
    
    // Reset form
    setNotes('');
  };

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    if (!land) return 'Bilinmeyen Arazi';
    return `${land.district || land.city} - Ada ${land.block_no} / Parsel ${land.parcel_no}`;
  };

  const getGrowthStageLabel = (stage: string) => {
    switch (stage) {
      case 'cimlenme': return 'Çimlenme / Erken Evre';
      case 'ciceklenme': return 'Çiçeklenme';
      case 'meyve_tutumu': return 'Meyve Tutumu';
      case 'hasat': return 'Hasat Dönemi';
      default: return stage;
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case 'saglikli': return 'Sağlıklı';
      case 'hastalik': return 'Hastalık Belirtisi';
      case 'zararli': return 'Zararlı/Böcek Tespiti';
      default: return status;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'saglikli': return 'bg-emerald-100 text-emerald-600';
      case 'hastalik': return 'bg-amber-100 text-amber-600';
      case 'zararli': return 'bg-rose-100 text-rose-600';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Arazi Kontrolü</h1>
            <p className="text-zinc-500 font-medium text-sm">Gözlem raporları ve bitki sağlığı takibi</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-emerald-500" /> Yeni Gözlem Raporu
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Arazi Seçimi</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
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
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Büyüme Evresi</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cimlenme', label: 'Çimlenme', icon: <Sprout size={16} /> },
                    { id: 'ciceklenme', label: 'Çiçeklenme', icon: <Activity size={16} /> },
                    { id: 'meyve_tutumu', label: 'Meyve Tutumu', icon: <Wheat size={16} /> },
                    { id: 'hasat', label: 'Hasat', icon: <ClipboardCheck size={16} /> },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setGrowthStage(s.id as any)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${growthStage === s.id ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-white'}`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Sağlık Durumu</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'saglikli', label: 'Her Şey Yolunda (Sağlıklı)', color: 'border-emerald-200 text-emerald-600', active: 'bg-emerald-50 border-emerald-500' },
                    { id: 'hastalik', label: 'Hastalık Şüphesi', color: 'border-amber-200 text-amber-600', active: 'bg-amber-50 border-amber-500' },
                    { id: 'zararli', label: 'Zararlı / Böcek Tespiti', color: 'border-rose-200 text-rose-600', active: 'bg-rose-50 border-rose-500' },
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHealthStatus(h.id as any)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${healthStatus === h.id ? h.active : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-white'}`}
                    >
                      <span>{h.label}</span>
                      {healthStatus === h.id && <HeartPulse size={16} className="animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Gözlem Notları</label>
                <textarea 
                  rows={3}
                  placeholder="Yapraklarda sararma var, sulama sıklığı artırılmalı vb."
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold resize-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200 active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Raporu Kaydet'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm min-h-[500px]">
            <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Search size={20} className="text-zinc-400" /> Geçmiş Gözlemler
            </h2>

            <div className="space-y-4">
              {scoutingLogs.length === 0 ? (
                <div className="text-center p-12 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck size={28} />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">Henüz Rapor Yok</h3>
                  <p className="text-zinc-500 text-sm">Arazilerinizdeki bitki gelişimini buradan takip edin.</p>
                </div>
              ) : (
                scoutingLogs.map(log => (
                  <div key={log.id} className="p-5 bg-zinc-50 border border-zinc-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getHealthColor(log.health_status)}`}>
                          <HeartPulse size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">{getLandDisplay(log.land_id)}</h4>
                          <div className="text-xs text-zinc-500 font-medium">
                            {new Date(log.date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteScoutingLog(log.id)}
                        className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-2xl border border-zinc-100">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Gelişim</div>
                        <div className="text-sm font-bold text-zinc-700">{getGrowthStageLabel(log.growth_stage)}</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-zinc-100">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Durum</div>
                        <div className={`text-sm font-bold ${getHealthColor(log.health_status).split(' ')[1]}`}>
                          {getHealthStatusLabel(log.health_status)}
                        </div>
                      </div>
                    </div>

                    {log.notes && (
                      <div className="bg-indigo-50/50 p-4 rounded-2xl text-sm text-zinc-600 leading-relaxed italic">
                        "{log.notes}"
                      </div>
                    )}
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
