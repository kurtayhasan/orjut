'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { 
  Droplet, Plus, Trash2, Calendar, MapPin, 
  Search, FlaskConical, Bug, Filter, Clock, 
  Box, Tractor, ChevronRight, CheckCircle2,
  Info, AlertCircle, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import EmptyState from '@/components/EmptyState';
import { cn, formatDateShort } from '@/lib/utils';
import { operationSchema } from '@/lib/schemas/operation.schema';

export default function OperationsPage() {
  const { lands, fieldOperations, addFieldOperation, deleteFieldOperation, inventory } = useAppContext();
  const searchParams = useSearchParams();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [type, setType] = useState<'su' | 'gubre' | 'ilac'>('su');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  
  const [filter, setFilter] = useState<'all' | 'su' | 'gubre' | 'ilac'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsAddModalOpen(true);
      
      // Phase 4: Pre-fill from prescription
      const landId = searchParams.get('land_id');
      const opType = searchParams.get('type');
      const opNotes = searchParams.get('notes');
      
      if (landId) setSelectedLandId(landId);
      if (opType) setType(opType as any);
      if (opNotes) setNotes(opNotes);
    }
  }, [searchParams]);

  useEffect(() => {
    if (type === 'su') {
      setUnit('saat');
      setSelectedInventoryId('');
    } else if (type === 'gubre') {
      setUnit('kg');
    } else {
      setUnit('lt');
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Phase 4: Stock usage mandatory for Gubre/Ilac
    if ((type === 'gubre' || type === 'ilac') && !selectedInventoryId) {
      toast.error("Gübreleme ve ilaçlama işlemleri için stok seçimi zorunludur.");
      return;
    }

    const opData = {
      land_id: selectedLandId,
      type,
      date,
      amount: Number(amount),
      unit,
      method,
      inventory_id: selectedInventoryId || null,
      notes
    };

    const validation = operationSchema.safeParse(opData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Check stock amount
    if (selectedInventoryId) {
      const item = inventory.find(i => i.id === selectedInventoryId);
      if (item && item.quantity < Number(amount)) {
        toast.warning(`Stokta yeterli ürün yok (${item.quantity} ${item.unit} mevcut). Kayıt yine de oluşturuluyor...`);
      }
    }
    
    setIsSubmitting(true);
    try {
      await addFieldOperation(opData);
      toast.success("İşlem başarıyla kaydedildi ve stok güncellendi.");
      setIsAddModalOpen(false);
      // Reset
      setAmount(''); setNotes(''); setMethod(''); setSelectedInventoryId('');
    } catch (err) {
      toast.error("İşlem kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOps = fieldOperations.filter(op => {
    return filter === 'all' || (op.type as string) === filter;
  });

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    return land ? `${land.district || land.city} (A:${land.block_no}/P:${land.parcel_no})` : 'Bilinmeyen Arazi';
  };

  const filteredInventory = inventory.filter(item => {
    if (type === 'gubre') return item.type === 'fertilizer';
    if (type === 'ilac') return item.type === 'pesticide';
    return false;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Zirai İşlemler</h1>
          <p className="text-text-muted font-bold text-sm">Saha operasyonlarını ve stok tüketimini yönetin.</p>
        </div>
        <Button size="md" className="min-h-[48px]" leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>Yeni İşlem Kaydet</Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex bg-surface-2 p-1 rounded-lg border border-border w-full md:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'su', 'gubre', 'ilac'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 md:px-6 py-2 px-4 min-h-[40px] text-[10px] font-black uppercase tracking-widest rounded-md transition-all whitespace-nowrap",
                  filter === f ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-primary"
                )}
              >
                {f === 'all' ? 'Tümü' : f === 'su' ? 'Sulama' : f === 'gubre' ? 'Gübreleme' : 'İlaçlama'}
              </button>
            ))}
         </div>
      </div>

      {/* OPERATIONS LIST */}
      <Card padding="none" className="overflow-hidden">
         <div className="divide-y divide-border">
            {filteredOps.length > 0 ? (
              filteredOps.map((op) => (
                <div key={op.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-2 transition-all group">
                   <div className="flex items-center gap-4 min-w-[300px]">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-black/5",
                        (op.type as string) === 'su' ? "bg-blue-100 text-blue-600" : 
                        (op.type as string) === 'gubre' ? "bg-emerald-100 text-emerald-600" : 
                        "bg-amber-100 text-amber-600"
                      )}>
                         {(op.type as string) === 'su' ? <Droplet size={24} /> : (op.type as string) === 'gubre' ? <FlaskConical size={24} /> : <Bug size={24} />}
                      </div>
                      <div>
                         <h4 className="font-bold text-text-primary leading-tight mb-0.5">{getLandDisplay(op.land_id)}</h4>
                         <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                            <span className="uppercase tracking-wider">{(op.type as string) === 'su' ? 'Sulama' : (op.type as string) === 'gubre' ? 'Gübreleme' : 'İlaçlama'}</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateShort(op.date)}</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1"><Tractor size={12} /> {op.method}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                         <div className="text-xl font-black font-heading text-text-primary tracking-tight">
                            {op.amount} <span className="text-sm font-bold text-text-muted">{op.unit}</span>
                         </div>
                         {op.notes && (
                           <p className="text-[10px] font-bold text-text-muted italic truncate max-w-[150px]">"{op.notes}"</p>
                         )}
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-3 text-text-muted hover:text-primary transition-colors min-h-[48px] min-w-[48px]">
                            <MoreVertical size={20} />
                         </button>
                         <button 
                           onClick={() => { deleteFieldOperation(op.id); toast.success("Kayıt silindi."); }}
                           className="p-3 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 min-h-[48px] min-w-[48px]"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              <EmptyState title="İşlem kaydı bulunamadı" description="Tarlada yaptığınız işlemleri ekleyerek takibe başlayın." emoji="🚜" />
            )}
         </div>
      </Card>

      {/* INFO BOX */}
      <Card className="bg-primary-50 border-primary-100" padding="md">
         <div className="flex items-start gap-3">
            <Info className="text-primary mt-0.5 shrink-0" size={18} />
            <div>
               <h4 className="text-sm font-black font-heading text-primary uppercase tracking-tight">Stok Entegrasyonu</h4>
               <p className="text-sm font-medium text-text-primary leading-relaxed mt-1">
                  Gübreleme ve ilaçlama işlemlerinde stoktan ürün seçimi zorunludur. Kayıt yapıldığında ürün miktarı envanterinizden otomatik olarak düşülür.
               </p>
            </div>
         </div>
      </Card>

      {/* ADD MODAL */}
      <BaseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Zirai İşlem Kaydı"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">İşlem Tipi</label>
              <div className="grid grid-cols-3 gap-2">
                 {(['su', 'gubre', 'ilac'] as const).map(t => (
                   <button
                     key={t}
                     type="button"
                     onClick={() => setType(t)}
                     className={cn(
                       "py-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all min-h-[64px]",
                       type === t ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                     )}
                   >
                     {t === 'su' ? <Droplet size={18} /> : t === 'gubre' ? <FlaskConical size={18} /> : <Bug size={18} />}
                     <span className="text-[10px] font-black uppercase">{t === 'su' ? 'SULAMA' : t === 'gubre' ? 'GÜBRE' : 'İLAÇ'}</span>
                   </button>
                 ))}
              </div>
           </div>

           <Input as="select" label="Arazi Seçimi" value={selectedLandId} onChange={e => setSelectedLandId(e.target.value)} required className="min-h-[48px]">
              <option value="" disabled>Seçiniz...</option>
              {lands.map(l => (
                <option key={l.id} value={l.id}>{l.district || l.city} - Ada {l.block_no}/P.{l.parcel_no}</option>
              ))}
           </Input>

           {/* STOCK SELECTION (Phase 4) */}
           {(type === 'gubre' || type === 'ilac') && (
             <div className="p-4 bg-primary-50 border border-primary/20 rounded-xl space-y-3 animate-scale-in">
                <Input 
                  as="select" 
                  label="Kullanılacak Stok Ürünü" 
                  value={selectedInventoryId} 
                  onChange={e => setSelectedInventoryId(e.target.value)} 
                  required
                  className="bg-white"
                >
                   <option value="" disabled>Stok seçin...</option>
                   {filteredInventory.map(item => (
                     <option key={item.id} value={item.id}>{item.item_name} ({item.quantity} {item.unit} mevcut)</option>
                   ))}
                </Input>
                {filteredInventory.length === 0 && (
                  <p className="text-[10px] font-bold text-danger uppercase">Stokta uygun ürün bulunamadı. Lütfen önce finans sayfasından stok girişi yapın.</p>
                )}
             </div>
           )}

           <Input label="Tarih" type="date" value={date} onChange={e => setDate(e.target.value)} required className="min-h-[48px]" />

           <div className="grid grid-cols-2 gap-4">
              <Input label="Miktar" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} required className="min-h-[48px]" />
              <Input as="select" label="Birim" value={unit} onChange={e => setUnit(e.target.value)} required className="min-h-[48px]">
                {type === 'su' ? (
                  <>
                    <option value="saat">Saat</option>
                    <option value="ton">Ton</option>
                    <option value="m3">m³</option>
                  </>
                ) : (
                  <>
                    <option value="kg">kg</option>
                    <option value="lt">lt</option>
                    <option value="paket">Paket</option>
                  </>
                )}
              </Input>
           </div>

           <Input as="select" label="Uygulama Yöntemi" value={method} onChange={e => setMethod(e.target.value)} required className="min-h-[48px]">
              <option value="" disabled>Seçiniz...</option>
              {type === 'su' ? (
                <>
                  <option value="Damlama">Damlama</option>
                  <option value="Salma">Salma</option>
                  <option value="Yağmurlama">Yağmurlama</option>
                </>
              ) : (
                <>
                  <option value="Traktör/Pülverizatör">Traktör/Pülverizatör</option>
                  <option value="Sırt Pompası">Sırt Pompası</option>
                  <option value="Dron">Dron ile Uygulama</option>
                </>
              )}
           </Input>

           <Input label="Notlar" placeholder="Opsiyonel..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[48px]" />

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" fullWidth onClick={() => setIsAddModalOpen(false)} className="min-h-[48px]">Vazgeç</Button>
              <Button fullWidth type="submit" isLoading={isSubmitting} className="min-h-[48px]">İşlemi Kaydet</Button>
           </div>
        </form>
      </BaseModal>
    </div>
  );
}
