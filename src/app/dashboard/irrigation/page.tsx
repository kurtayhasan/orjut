'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Droplet, Plus, Trash2, Calendar, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function IrrigationPage() {
  const { lands, irrigationLogs, addIrrigationLog, deleteIrrigationLog } = useAppContext();
  
  const [selectedLandId, setSelectedLandId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'saat' | 'ton' | 'litre'>('saat');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLandId || !date || !amount || !unit || !method) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    await addIrrigationLog({
      land_id: selectedLandId,
      date,
      amount: Number(amount),
      unit,
      method,
      notes
    });
    setIsSubmitting(false);
    
    // Reset form
    setAmount('');
    setNotes('');
  };

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    if (!land) return 'Bilinmeyen Arazi';
    return `${land.district || land.city} - Ada ${land.block_no} / Parsel ${land.parcel_no}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <Droplet size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Sulama Takibi</h1>
            <p className="text-zinc-500 font-medium text-sm">Arazi sulama kayıtları ve su tüketimi</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" /> Yeni Sulama Kaydı
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Arazi Seçimi</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
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
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold"
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
                    placeholder="Örn: 8"
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Birim</label>
                  <select 
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold cursor-pointer"
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                  >
                    <option value="saat">Saat</option>
                    <option value="ton">Ton</option>
                    <option value="litre">Litre</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Sulama Yöntemi</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold cursor-pointer"
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                >
                  <option value="" disabled>Yöntem seçin...</option>
                  <option value="Damlama">Damlama</option>
                  <option value="Yağmurlama">Yağmurlama</option>
                  <option value="Salma">Salma (Vahşi)</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Not (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  placeholder="Gecikme oldu, ekstra gübre verildi vb."
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold resize-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200 active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm min-h-[500px]">
            <h2 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <Search size={20} className="text-zinc-400" /> Geçmiş Sulamalar
            </h2>

            <div className="space-y-3">
              {irrigationLogs.length === 0 ? (
                <div className="text-center p-12 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplet size={28} />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">Henüz Kayıt Yok</h3>
                  <p className="text-zinc-500 text-sm">Arazilerinize ait sulama kayıtlarını buradan takip edebilirsiniz.</p>
                </div>
              ) : (
                irrigationLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Droplet size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{getLandDisplay(log.land_id)}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-1">
                          <span>{new Date(log.date).toLocaleDateString('tr-TR')}</span>
                          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                          <span>{log.method}</span>
                          {log.notes && (
                            <>
                              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                              <span className="truncate max-w-[120px]">{log.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-black text-lg text-blue-600">{log.amount}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{log.unit}</div>
                      </div>
                      <button 
                        onClick={() => deleteIrrigationLog(log.id)}
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
