'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReceiptUpload from '@/components/receipts/ReceiptUpload';
import BaseModal from '@/components/ui/BaseModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ExpenseModalProps } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Wallet, Fuel, Sprout, 
  Users, Package, Calendar, 
  MapPin, Archive, Tag, Camera,
  Box, RefreshCcw, Activity
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExpenseModal({ isOpen, onClose, defaultCategory }: ExpenseModalProps) {
  const { 
    addExpense, lands, seasons, activeSeason, 
    inventory, updateInventoryItem, addFieldOperation 
  } = useAppContext();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [landId, setLandId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptThumbnail, setReceiptThumbnail] = useState('');
  
  // Stock adding
  const [addToInventory, setAddToInventory] = useState(false);
  const [invName, setInvName] = useState('');
  const [stockSelectionMode, setStockSelectionMode] = useState<'new' | 'existing'>('existing');
  const [existingStockId, setExistingStockId] = useState('');
  
  // Stock using
  const [isUsingStock, setIsUsingStock] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  
  // Hybrid Workflow
  const [isHybridApplied, setIsHybridApplied] = useState(false);
  const [appliedAmount, setAppliedAmount] = useState('');
  const [hybridLandId, setHybridLandId] = useState('');
  
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      if (activeSeason) setSeasonId(activeSeason.id);
      setIsUsingStock(false);
      setAddToInventory(false);
      setIsHybridApplied(false);
      setAppliedAmount('');
      setStockSelectionMode('existing');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen, defaultCategory, activeSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;
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

    if (!description) {
      toast.error("Lütfen açıklama giriniz.");
      return;
    }

    if (addToInventory && stockSelectionMode === 'existing' && !existingStockId) {
      toast.error("Lütfen mevcut bir stok ürünü seçin veya 'Yeni Ürün' olarak kaydedin.");
      return;
    }

    if (isHybridApplied && (!appliedAmount || !hybridLandId)) {
      toast.error("Hibrit işlem için miktar ve arazi seçimi zorunludur.");
      return;
    }

    setIsSubmitting(true);
    try {
      const inventoryData = addToInventory ? {
        name: invName || category,
        type: category === 'Gübre/İlaç' ? 'fertilizer' : category === 'Tohum' ? 'seed' : category === 'Mazot' ? 'fuel' : 'other',
        quantity: Number(quantity),
        unit: unit,
        id: stockSelectionMode === 'existing' ? existingStockId : undefined
      } : undefined;

      const hybridData = isHybridApplied ? {
        appliedAmount: Number(appliedAmount),
        landId: hybridLandId,
        type: category === 'Gübre/İlaç' ? 'gubre' : category === 'Tohum' ? 'planting' : 'su'
      } : undefined;

      // 1. Process Stock Usage (Pure Stock Mode)
      if (isUsingStock && selectedInventoryId && quantity) {
        const item = inventory.find(i => i.id === selectedInventoryId);
        if (item) {
          const newQty = item.quantity - Number(quantity);
          if (newQty < 0) toast.warning("Stok miktarı sıfırın altına düşecek!");
          await updateInventoryItem(selectedInventoryId, { quantity: newQty });
        }
        
        // Pure stock usage also needs a field operation
        await addFieldOperation({
          land_id: landId,
          type: category === 'Gübre/İlaç' ? 'gubre' : category === 'Tohum' ? 'planting' : 'su',
          date,
          amount: Number(quantity),
          unit,
          method: 'Stoktan kullanım',
          notes: 'Depodan alınan ürün araziye uygulandı.',
          inventory_id: selectedInventoryId
        });
      } else {
        // 2. Process Purchase (Expense + Optional Stock Entry + Optional Hybrid App)
        await addExpense(
          Number(amount || 0), 
          category, 
          date, 
          landId, 
          description,
          receiptUrl, 
          receiptThumbnail, 
          inventoryData, 
          seasonId,
          hybridData
        );
      }

      toast.success("Kayıt başarıyla oluşturuldu.");
      onClose();
    } catch (err: any) {
      toast.error("Kayıt oluşturulurken bir hata oluştu: " + (err?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'Mazot', label: 'Mazot', icon: Fuel, color: 'text-orange-500' },
    { id: 'Gübre/İlaç', label: 'Gübre/İlaç', icon: Sprout, color: 'text-emerald-500' },
    { id: 'Tohum', label: 'Tohum', icon: Tag, color: 'text-amber-500' },
    { id: 'İşçilik', label: 'İşçilik', icon: Users, color: 'text-blue-500' },
    { id: 'Diğer', label: 'Diğer', icon: Package, color: 'text-zinc-500' }
  ];

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
                      setIsHybridApplied(false);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 min-h-[56px]",
                      isActive ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                    )}
                  >
                    <Icon size={20} className={isActive ? "text-primary" : "text-text-muted"} />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-center">{cat.label}</span>
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
                required={isUsingStock || addToInventory}
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
           <Input as="select" label="Finansın Bağlı Olduğu Arazi" value={landId} onChange={(e: any) => setLandId(e.target.value)} required>
              <option value="" disabled>Seçiniz...</option>
              {lands.map((land) => (
                <option key={land.id} value={land.id}>{land.district || land.city} (A:{land.block_no}/P:{land.parcel_no})</option>
              ))}
           </Input>
           <Input label="Harcama Tarihi" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} required />
        </div>

        {/* DESCRIPTION */}
        <Input 
          label="Açıklama" 
          placeholder="Örn: 20 Litre Mazot - Ali'nin Traktörü İçin" 
          value={description} 
          onChange={(e: any) => setDescription(e.target.value)} 
          required 
          className="font-bold"
        />

        {/* INVENTORY BRIDGE */}
        {['Gübre/İlaç', 'Tohum', 'Mazot'].includes(category) && (
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAddToInventory(!addToInventory); setIsUsingStock(false); setIsHybridApplied(false); }}
                  className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all min-h-[64px]",
                    addToInventory ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                  )}
                >
                  <Box size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Stoka Ekle</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsUsingStock(!isUsingStock); setAddToInventory(false); setIsHybridApplied(false); setAmount('0'); }}
                  className={cn(
                    "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all min-h-[64px]",
                    isUsingStock ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                  )}
                >
                  <RefreshCcw size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Stoktan Kullan</span>
                </button>
             </div>

             {/* Add to inventory extra fields (Phase 2 Smart Stock) */}
             {addToInventory && (
               <div className="p-4 bg-primary-50 border border-primary/20 rounded-xl animate-scale-in space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Ürün Seçimi</label>
                    <select 
                      className="w-full p-3 rounded-lg border border-primary/20 bg-white font-bold text-sm focus:ring-primary focus:border-primary"
                      value={stockSelectionMode}
                      onChange={(e: any) => setStockSelectionMode(e.target.value)}
                    >
                      <option value="existing">Mevcut Stoktan Seç</option>
                      <option value="new">+ Yeni Ürün Kaydet</option>
                    </select>
                  </div>

                  {stockSelectionMode === 'existing' ? (
                    <Input 
                      as="select" 
                      label="Stoktaki Ürün"
                      value={existingStockId}
                      onChange={(e: any) => setExistingStockId(e.target.value)}
                      required={addToInventory && stockSelectionMode === 'existing'}
                      className="bg-white"
                    >
                      <option value="" disabled>Ürün seçin...</option>
                      {filteredInventory.map(item => (
                        <option key={item.id} value={item.id}>{item.item_name} ({item.quantity} {item.unit})</option>
                      ))}
                    </Input>
                  ) : (
                    <Input 
                      label="Yeni Ürün Adı"
                      placeholder="Ürün/Marka Adı (Örn: Üre 46)" 
                      value={invName} 
                      onChange={(e: any) => setInvName(e.target.value)} 
                      required={addToInventory && stockSelectionMode === 'new'}
                      className="bg-white"
                    />
                  )}

                  {/* Hybrid Workflow Toggle (Phase 3) */}
                  <div className="pt-2 border-t border-primary/10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-primary/30 text-primary focus:ring-primary"
                        checked={isHybridApplied}
                        onChange={e => setIsHybridApplied(e.target.checked)}
                      />
                      <div>
                         <p className="text-xs font-black text-primary">Aldığım Miktarın Bir Kısmını Hemen Uygula</p>
                         <p className="text-[9px] font-bold text-primary/70 uppercase">Zirai işlem kaydı otomatik oluşturulur.</p>
                      </div>
                    </label>

                    {isHybridApplied && (
                      <div className="mt-4 grid grid-cols-2 gap-3 animate-scale-in">
                        <Input 
                          label="Uygulanan Miktar"
                          type="number"
                          placeholder="0"
                          value={appliedAmount}
                          onChange={(e: any) => setAppliedAmount(e.target.value)}
                          required={isHybridApplied}
                          className="bg-white"
                        />
                        <Input 
                          as="select"
                          label="Uygulanan Arazi"
                          value={hybridLandId}
                          onChange={(e: any) => setHybridLandId(e.target.value)}
                          required={isHybridApplied}
                          className="bg-white"
                        >
                          <option value="" disabled>Seçiniz...</option>
                          {lands.map(l => (
                            <option key={l.id} value={l.id}>{l.district || l.city}</option>
                          ))}
                        </Input>
                      </div>
                    )}
                  </div>
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
           <Button variant="ghost" fullWidth onClick={onClose} type="button" className="min-h-[48px]" disabled={isSubmitting}>Vazgeç</Button>
           <Button fullWidth type="submit" size="lg" className="min-h-[48px]" isLoading={isSubmitting} disabled={isSubmitting}>Kayıt İşlemini Tamamla</Button>
        </div>
      </form>
    </BaseModal>
  );
}
