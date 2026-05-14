'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReceiptUpload from './receipts/ReceiptUpload';
import BaseModal from '@/components/ui/BaseModal';
import Button from './ui/Button';
import Input from './ui/Input';
import { ExpenseModalProps } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Wallet, Fuel, Sprout, 
  Users, Package, Calendar, 
  MapPin, Archive, Tag, Camera
} from 'lucide-react';

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
        type: category === 'Gübre/İlaç' ? 'fertilizer' : category === 'Tohum' ? 'seed' : category === 'Mazot' ? 'fuel' : 'other',
        quantity: Number(quantity),
        unit: unit
      } : undefined;

      await addExpense(Number(amount), category, date, landId, receiptUrl, receiptThumbnail, inventoryData, seasonId);
      
      // Reset form
      setAmount(''); setQuantity(''); setUnit('kg'); setAddToInventory(false); setInvName(''); setReceiptUrl(''); setReceiptThumbnail('');
      onClose();
    }
  };

  const categories = [
    { id: 'Mazot', label: 'Mazot', icon: Fuel, color: 'text-orange-500' },
    { id: 'Gübre/İlaç', label: 'Gübre/İlaç', icon: Sprout, color: 'text-emerald-500' },
    { id: 'Tohum', label: 'Tohum', icon: Tag, color: 'text-amber-500' },
    { id: 'İşçilik', label: 'İşçilik', icon: Users, color: 'text-blue-500' },
    { id: 'Diğer', label: 'Diğer', icon: Package, color: 'text-zinc-500' }
  ];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Harcama Kaydı Oluştur">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CATEGORY SELECTOR */}
        <div className="space-y-2">
           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Kategori Seçin</label>
           <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2",
                      isActive ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                    )}
                  >
                    <Icon size={20} className={isActive ? "text-primary" : "text-text-muted"} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                );
              })}
           </div>
        </div>

        {/* AMOUNT & QUANTITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Input 
             label="Toplam Tutar (₺)" 
             type="number" 
             placeholder="0.00" 
             value={amount} 
             onChange={(e: any) => setAmount(e.target.value)} 
             required 
             autoFocus
             className="text-2xl font-black text-primary"
           />
           <div className="flex gap-2">
              <Input 
                label="Miktar (Ops.)" 
                type="number" 
                placeholder="0" 
                value={quantity} 
                onChange={(e: any) => setQuantity(e.target.value)} 
                className="flex-1 font-bold"
              />
              <Input 
                as="select" 
                label="Birim" 
                value={unit} 
                onChange={(e: any) => setUnit(e.target.value)} 
                className="w-24 font-bold"
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

        {/* LAND & DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Input as="select" label="Arazi" value={landId} onChange={(e: any) => setLandId(e.target.value)} required>
              <option value="" disabled>Seçiniz...</option>
              {lands.map((land) => (
                <option key={land.id} value={land.id}>{land.district || land.city} (A:{land.block_no}/P:{land.parcel_no})</option>
              ))}
           </Input>
           <Input label="Tarih" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} required />
        </div>

        {/* INVENTORY LINKAGE */}
        {['Gübre/İlaç', 'Tohum', 'Mazot'].includes(category) && (
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            addToInventory ? "bg-primary-50 border-primary/20" : "bg-surface-2 border-border"
          )}>
             <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  checked={addToInventory}
                  onChange={e => setAddToInventory(e.target.checked)}
                />
                <div>
                   <p className="text-sm font-black text-text-primary">Bu ürünü stoka ekle</p>
                   <p className="text-[10px] font-bold text-text-muted uppercase">Gelecekteki zirai işlemler için envantere kaydedilir.</p>
                </div>
             </label>
             {addToInventory && (
               <div className="mt-4 animate-scale-in">
                  <Input 
                    placeholder="Ürün/Marka Adı (Örn: Üre 46)" 
                    value={invName} 
                    onChange={(e: any) => setInvName(e.target.value)} 
                    required={addToInventory}
                    className="bg-white"
                  />
               </div>
             )}
          </div>
        )}

        {/* RECEIPT UPLOAD */}
        <div className="space-y-2">
           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-1">
              <Camera size={12} /> Makbuz / Fiş Yükle
           </label>
           <ReceiptUpload onUploadSuccess={(url, base64) => {
             setReceiptUrl(url);
             if (base64) setReceiptThumbnail(base64);
           }} />
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-4 border-t border-border">
           <Button variant="ghost" fullWidth onClick={onClose} type="button">Vazgeç</Button>
           <Button fullWidth type="submit" size="lg">Harcamayı Kaydet</Button>
        </div>
      </form>
    </BaseModal>
  );
}
