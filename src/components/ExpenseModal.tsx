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
  MapPin, Archive, Tag, Camera,
  Box, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExpenseModal({ isOpen, onClose, defaultCategory }: ExpenseModalProps) {
  const { addExpense, lands, seasons, activeSeason, inventory, updateInventoryItem } = useAppContext();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [landId, setLandId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptThumbnail, setReceiptThumbnail] = useState('');
  
  // Stock adding
  const [addToInventory, setAddToInventory] = useState(false);
  const [invName, setInvName] = useState('');
  
  // Stock using
  const [isUsingStock, setIsUsingStock] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      if (activeSeason) setSeasonId(activeSeason.id);
      setIsUsingStock(false);
      setAddToInventory(false);
    }
  }, [isOpen, defaultCategory, activeSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!landId) {
      toast.error("Lütfen arazi seçiniz.");
      return;
    }

    if (isUsingStock && !selectedInventoryId) {
      toast.error("Lütfen stoktan bir ürün seçiniz.");
      return;
    }

    if (!amount && !isUsingStock) {
      toast.error("Lütfen tutar giriniz.");
      return;
    }

    try {
      const inventoryData = addToInventory ? {
        name: invName || category,
        type: category === 'Gübre/İlaç' ? 'fertilizer' : category === 'Tohum' ? 'seed' : category === 'Mazot' ? 'fuel' : 'other',
        quantity: Number(quantity),
        unit: unit
      } : undefined;

      // If using stock, we might want to update inventory quantity
      if (isUsingStock && selectedInventoryId && quantity) {
        const item = inventory.find(i => i.id === selectedInventoryId);
        if (item) {
          const newQty = item.quantity - Number(quantity);
          if (newQty < 0) {
            toast.warning("Stok miktarı sıfırın altına düşecek!");
          }
          await updateInventoryItem(selectedInventoryId, { quantity: newQty });
        }
      }

      await addExpense(Number(amount || 0), category, date, landId, receiptUrl, receiptThumbnail, inventoryData, seasonId);
      
      toast.success("Kayıt başarıyla oluşturuldu.");
      // Reset form
      setAmount(''); setQuantity(''); setUnit('kg'); setAddToInventory(false); setIsUsingStock(false); 
      setInvName(''); setReceiptUrl(''); setReceiptThumbnail(''); setSelectedInventoryId('');
      onClose();
    } catch (err) {
      toast.error("Kayıt oluşturulurken bir hata oluştu.");
    }
  };

  const categories = [
    { id: 'Mazot', label: 'Mazot', icon: Fuel, color: 'text-orange-500' },
    { id: 'Gübre/İlaç', label: 'Gübre/İlaç', icon: Sprout, color: 'text-emerald-500' },
    { id: 'Tohum', label: 'Tohum', icon: Tag, color: 'text-amber-500' },
    { id: 'İşçilik', label: 'İşçilik', icon: Users, color: 'text-blue-500' },
    { id: 'Diğer', label: 'Diğer', icon: Package, color: 'text-zinc-500' }
  ];

  // Filter inventory based on category
  const filteredInventory = inventory.filter(item => {
    if (category === 'Mazot') return item.type === 'fuel';
    if (category === 'Gübre/İlaç') return item.type === 'fertilizer';
    if (category === 'Tohum') return item.type === 'seed';
    return true;
  });

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
                    onClick={() => {
                      setCategory(cat.id);
                      setIsUsingStock(false);
                      setAddToInventory(false);
                    }}
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
             label={isUsingStock ? "Tahmini Değer (Ops. ₺)" : "Toplam Tutar (₺)"} 
             type="number" 
             placeholder="0.00" 
             value={amount} 
             onChange={(e: any) => setAmount(e.target.value)} 
             required={!isUsingStock}
             autoFocus={!isUsingStock}
             className="text-2xl font-black text-primary"
           />
           <div className="flex gap-2">
              <Input 
                label="Miktar" 
                type="number" 
                placeholder="0" 
                value={quantity} 
                onChange={(e: any) => setQuantity(e.target.value)} 
                className="flex-1 font-bold"
                required={isUsingStock}
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

        {/* INVENTORY BRIDGE (Phase 4) */}
        {['Gübre/İlaç', 'Tohum', 'Mazot'].includes(category) && (
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Add to stock */}
                <button
                  type="button"
                  onClick={() => { setAddToInventory(!addToInventory); setIsUsingStock(false); }}
                  className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    addToInventory ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                  )}
                >
                  <Box size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Stoka Ekle</span>
                </button>

                {/* Option 2: Use from stock */}
                <button
                  type="button"
                  onClick={() => { setIsUsingStock(!isUsingStock); setAddToInventory(false); setAmount('0'); }}
                  className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    isUsingStock ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                  )}
                >
                  <RefreshCcw size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Stoktan Kullan</span>
                </button>
             </div>

             {/* Add to inventory extra fields */}
             {addToInventory && (
               <div className="p-4 bg-primary-50 border border-primary/20 rounded-xl animate-scale-in">
                  <Input 
                    label="Stok Kayıt Adı"
                    placeholder="Ürün/Marka Adı (Örn: Üre 46)" 
                    value={invName} 
                    onChange={(e: any) => setInvName(e.target.value)} 
                    required={addToInventory}
                    className="bg-white"
                  />
                  <p className="text-[10px] font-bold text-primary uppercase mt-2">Bu harcama envanterinize yeni bir giriş olarak kaydedilecek.</p>
               </div>
             )}

             {/* Use from inventory extra fields */}
             {isUsingStock && (
               <div className="p-4 bg-primary-50 border border-primary/20 rounded-xl animate-scale-in space-y-3">
                  <Input 
                    as="select" 
                    label="Stoktaki Ürün"
                    value={selectedInventoryId}
                    onChange={(e: any) => setSelectedInventoryId(e.target.value)}
                    required={isUsingStock}
                    className="bg-white"
                  >
                    <option value="" disabled>Ürün seçin...</option>
                    {filteredInventory.map(item => (
                      <option key={item.id} value={item.id}>{item.item_name} ({item.quantity} {item.unit} mevcut)</option>
                    ))}
                  </Input>
                  <p className="text-[10px] font-bold text-primary uppercase">Bu işlem seçilen stok miktarını otomatik olarak azaltacaktır.</p>
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
           <Button fullWidth type="submit" size="lg">Kayıt İşlemini Tamamla</Button>
        </div>
      </form>
    </BaseModal>
  );
}
