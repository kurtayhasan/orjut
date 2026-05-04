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
  const [invName, setInvName] = useState('');
  
  // Unified Quantity and Unit for both Transaction and Inventory
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

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
        quantity: Number(quantity),
        unit: unit
      } : undefined;

      await addExpense(Number(amount), category, date, landId, receiptUrl, receiptThumbnail, inventoryData);
      setAmount('');
      setQuantity('');
      setUnit('kg');
      setDate(new Date().toISOString().split('T')[0]);
      setLandId('');
      setReceiptUrl('');
      setReceiptThumbnail('');
      setAddToInventory(false);
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
    return     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-10 border border-transparent dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl">
            {getEmoji(category)}
          </div>
          <div className="flex-1">
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="text-xl font-black text-zinc-900 dark:text-zinc-100 bg-transparent outline-none focus:ring-0 cursor-pointer w-full appearance-none"
            >
              <option value="Mazot" className="dark:bg-zinc-900">⛽ Mazot Gideri</option>
              <option value="Gübre/İlaç" className="dark:bg-zinc-900">🌱 Gübre/İlaç Gideri</option>
              <option value="Tohum" className="dark:bg-zinc-900">🔴 Tohum Gideri</option>
              <option value="İşçilik" className="dark:bg-zinc-900">🧑‍🌾 İşçilik Gideri</option>
              <option value="Diğer" className="dark:bg-zinc-900">📦 Diğer Gider</option>
            </select>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">Gider Detayı</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-2xl font-black">₺</span>
                <input 
                  type="number"
                  className="w-full border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-3xl font-black text-zinc-900 dark:text-zinc-100 py-4 pl-12 pr-4 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">Miktar</label>
                  <input 
                    type="number"
                    className="w-full border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-lg font-black text-zinc-900 dark:text-zinc-100 py-3.5 px-4 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                    placeholder="0"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">Birim</label>
                  <select 
                    className="w-full border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-lg font-black text-zinc-900 dark:text-zinc-100 py-3.5 px-3 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all appearance-none"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  >
                    <option value="kg" className="dark:bg-zinc-900">kg</option>
                    <option value="lt" className="dark:bg-zinc-900">lt</option>
                    <option value="ton" className="dark:bg-zinc-900">ton</option>
                    <option value="paket" className="dark:bg-zinc-900">pkt</option>
                    <option value="cuval" className="dark:bg-zinc-900">çvl</option>
                    <option value="adet" className="dark:bg-zinc-900">adt</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">Arazi Seçimi</label>
              <select 
                className="w-full border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-lg font-black text-zinc-900 dark:text-zinc-100 py-3.5 px-4 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all appearance-none cursor-pointer"
                value={landId}
                onChange={e => setLandId(e.target.value)}
                required
              >
                <option value="" disabled className="dark:bg-zinc-900">Seçiniz...</option>
                {lands.map((land: any) => (
                  <option key={land.id} value={land.id} className="dark:bg-zinc-900">
                    {land.district || land.city} - Ada {land.block_no} / Parsel {land.parcel_no}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">İşlem Tarihi</label>
              <input 
                type="date"
                className="w-full border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-lg font-black text-zinc-900 dark:text-zinc-100 py-3.5 px-4 rounded-2xl focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">Makbuz / Fiş Yükle</label>
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
                      <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Ürün/Marka Adı (Stok Kaydı İçin)</label>
                      <input 
                        type="text"
                        placeholder="Örn: Üre 46, Can Gübre vb."
                        className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        value={invName}
                        onChange={e => setInvName(e.target.value)}
                        required={addToInventory}
                      />
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
