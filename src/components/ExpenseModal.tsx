'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReceiptUpload from './receipts/ReceiptUpload';
import BaseModal from './ui/BaseModal';
import Button from './ui/Button';
import Input from './ui/Input';
import { ExpenseModalProps } from '@/types';

export default function ExpenseModal({ isOpen, onClose, defaultCategory }: ExpenseModalProps) {
  const { addExpense, lands, seasons, activeSeason } = useAppContext();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [landId, setLandId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptThumbnail, setReceiptThumbnail] = useState('');
  const [addToInventory, setAddToInventory] = useState(false);
  const [invName, setInvName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      if (activeSeason) setSeasonId(activeSeason.id);
    }
  }, [isOpen, defaultCategory, activeSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && !isNaN(Number(amount)) && landId) {
      const inventoryData = addToInventory ? {
        name: invName || category,
        type: category === 'Gübre/İlaç' ? 'gubre' : category === 'Tohum' ? 'tohum' : category === 'Mazot' ? 'yakit' : 'diger',
        quantity: Number(quantity),
        unit: unit
      } : undefined;

      await addExpense(Number(amount), category, date, landId, receiptUrl, receiptThumbnail, inventoryData, seasonId);
      
      // Reset form
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

  const getEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      'Mazot': '⛽',
      'Gübre/İlaç': '🌱',
      'İşçilik': '🧑‍🌾',
      'Tohum': '🔴',
      'Diğer': '📦'
    };
    return emojis[cat] || '📦';
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
          {getEmoji(category)}
        </div>
        <div className="flex-1">
          <Input 
            as="select" 
            value={category} 
            onChange={(e: any) => setCategory(e.target.value)}
            label="Gider Türü"
            className="text-2xl font-black !bg-transparent border-none p-0 h-auto"
          >
            <option value="Mazot">⛽ Mazot Gideri</option>
            <option value="Gübre/İlaç">🌱 Gübre/İlaç Gideri</option>
            <option value="Tohum">🔴 Tohum Gideri</option>
            <option value="İşçilik">🧑‍🌾 İşçilik Gideri</option>
            <option value="Diğer">📦 Diğer Gider</option>
          </Input>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mt-1">Hızlı Gider Girişi</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Tutar"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              required
              autoFocus
              leftIcon={<span className="text-2xl font-black">₺</span>}
              className="text-3xl font-black py-4"
            />
            
            <div className="flex gap-3">
              <Input
                label="Miktar"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e: any) => setQuantity(e.target.value)}
                className="text-lg font-black"
              />
              <Input
                as="select"
                label="Birim"
                value={unit}
                onChange={(e: any) => setUnit(e.target.value)}
                className="w-24 text-lg font-black"
              >
                <option value="kg">kg</option>
                <option value="lt">lt</option>
                <option value="ton">ton</option>
                <option value="paket">pkt</option>
                <option value="cuval">çvl</option>
                <option value="adet">adt</option>
              </Input>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              as="select"
              label="Arazi Seçimi"
              value={landId}
              onChange={(e: any) => setLandId(e.target.value)}
              required
              className="text-sm font-bold"
            >
              <option value="" disabled>Seçiniz...</option>
              {lands.map((land) => (
                <option key={land.id} value={land.id}>
                  {land.district || land.city} - Ada {land.block_no} / Parsel {land.parcel_no}
                </option>
              ))}
            </Input>

            <Input
              as="select"
              label="İlgili Sezon"
              value={seasonId}
              onChange={(e: any) => setSeasonId(e.target.value)}
              required
              className="text-sm font-bold"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.year})
                </option>
              ))}
            </Input>

            <Input
              label="İşlem Tarihi"
              type="date"
              value={date}
              onChange={(e: any) => setDate(e.target.value)}
              required
              className="text-sm font-bold"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Makbuz / Fiş Yükle</label>
            <ReceiptUpload onUploadSuccess={(url, base64) => {
              setReceiptUrl(url);
              if (base64) setReceiptThumbnail(base64);
            }} />
          </div>

          <div className="min-h-[64px]">
            {['Gübre/İlaç', 'Gübre', 'İlaç', 'Tohum', 'Mazot'].includes(category) && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[2rem] space-y-4 border border-indigo-100 dark:border-indigo-900/30 transition-all duration-300">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={addToInventory}
                      onChange={e => setAddToInventory(e.target.checked)}
                    />
                    <div className="w-6 h-6 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-sm font-black text-indigo-900 dark:text-indigo-200 group-hover:text-indigo-700 transition-colors">Bu ürünü stoka (Envanter) ekle</span>
                </label>
                
                {addToInventory && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      placeholder="Ürün/Marka Adı (Örn: Üre 46, Can Gübre)"
                      value={invName}
                      onChange={(e: any) => setInvName(e.target.value)}
                      required={addToInventory}
                      className="!bg-white dark:!bg-zinc-950"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 sticky bottom-0 bg-white dark:bg-zinc-900 pt-4 border-t border-zinc-50 dark:border-zinc-800 sm:relative sm:bg-transparent sm:border-none sm:pt-0">
          <Button variant="ghost" onClick={onClose} className="flex-1">Vazgeç</Button>
          <Button type="submit" className="flex-[2]">Kaydet</Button>
        </div>
      </form>
    </BaseModal>
  );
}
