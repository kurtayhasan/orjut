'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReceiptUpload from './receipts/ReceiptUpload';

export default function ExpenseModal({ isOpen, onClose, defaultCategory }: { isOpen: boolean, onClose: () => void, defaultCategory: string }) {
  const { addExpense, lands } = useAppContext();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [landId, setLandId] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptThumbnail, setReceiptThumbnail] = useState('');
  const [addToInventory, setAddToInventory] = useState(false);
  const [invQuantity, setInvQuantity] = useState('');
  const [invUnit, setInvUnit] = useState('kg');
  const [invName, setInvName] = useState('');

  // Update category if default changes when modal opens
  React.useEffect(() => {
    if (isOpen) setCategory(defaultCategory);
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && !isNaN(Number(amount)) && landId) {
      const inventoryData = addToInventory ? {
        name: invName || category,
        type: category === 'Gübre/İlaç' ? 'gubre' : category === 'Tohum' ? 'tohum' : 'diger',
        quantity: Number(invQuantity),
        unit: invUnit
      } : undefined;

      await addExpense(Number(amount), category, date, landId, receiptUrl, receiptThumbnail, inventoryData);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setLandId('');
      setReceiptUrl('');
      setReceiptThumbnail('');
      setAddToInventory(false);
      setInvQuantity('');
      setInvName('');
      onClose();
    }
  };

  const handleUploadSuccess = (url: string, base64?: string) => {
    setReceiptUrl(url);
    if (base64) {
      setReceiptThumbnail(base64); // use base64 as thumbnail if offline
    }
  };

  const getEmoji = (cat: string) => {
    if (cat === 'Mazot') return '⛽';
    if (cat === 'Gübre/İlaç') return '🌱';
    if (cat === 'İşçilik') return '🧑‍🌾';
    return '📦';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-2xl">
            {getEmoji(category)}
          </div>
          <div className="flex-1">
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="text-xl font-bold text-zinc-900 bg-transparent outline-none focus:ring-0 cursor-pointer w-full"
            >
              <option value="Mazot">⛽ Mazot Gideri</option>
              <option value="Gübre/İlaç">🌱 Gübre/İlaç Gideri</option>
              <option value="Tohum">🔴 Tohum Gideri</option>
              <option value="İşçilik">🧑‍🌾 İşçilik Gideri</option>
              <option value="Diğer">📦 Diğer Gider</option>
            </select>
            <p className="text-sm text-zinc-500">Miktarı girin ve kaydedin.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-2xl font-medium">₺</span>
              <input 
                type="number"
                className="w-full border-2 border-zinc-200 text-3xl font-bold text-zinc-900 py-4 pl-12 pr-4 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1">Arazi Seç</label>
              <select 
                className="w-full border-2 border-zinc-200 text-lg font-bold text-zinc-900 py-3 px-4 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none transition-colors bg-white"
                value={landId}
                onChange={e => setLandId(e.target.value)}
                required
              >
                <option value="" disabled>Seçiniz...</option>
                {lands.map((land: any) => (
                  <option key={land.id} value={land.id}>
                    {land.district || land.city} - Ada {land.block_no} / Parsel {land.parcel_no}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1">Tarih</label>
              <input 
                type="date"
                className="w-full border-2 border-zinc-200 text-lg font-bold text-zinc-900 py-3 px-4 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1">Makbuz (Opsiyonel)</label>
              <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Inventory Bridge Toggle */}
            {(category === 'Gübre/İlaç' || category === 'Gübre' || category === 'İlaç' || category === 'Tohum') && (
              <div className="bg-indigo-50 p-4 rounded-2xl space-y-3 border border-indigo-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    checked={addToInventory}
                    onChange={e => setAddToInventory(e.target.checked)}
                  />
                  <span className="text-sm font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors">Bu ürünü stoka (Envanter) ekle</span>
                </label>
                
                {addToInventory && (
                  <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Ürün/Marka Adı</label>
                      <input 
                        type="text"
                        placeholder="Örn: Üre 46, Can Gübre vb."
                        className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        value={invName}
                        onChange={e => setInvName(e.target.value)}
                        required={addToInventory}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Miktar</label>
                        <input 
                          type="number"
                          placeholder="0"
                          className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                          value={invQuantity}
                          onChange={e => setInvQuantity(e.target.value)}
                          required={addToInventory}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Birim</label>
                        <select 
                          className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                          value={invUnit}
                          onChange={e => setInvUnit(e.target.value)}
                        >
                          <option value="kg">kg</option>
                          <option value="lt">lt</option>
                          <option value="paket">paket</option>
                          <option value="cuval">çuval</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-zinc-600 font-semibold bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">İptal</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
