'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  Droplet, Plus, Trash2, Calendar, 
  MapPin, Search, Waves, Info, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import EmptyState from '@/components/EmptyState';
import { cn, formatDateShort } from '@/lib/utils';

export default function IrrigationPage() {
  const { lands, irrigationLogs, addIrrigationLog, deleteIrrigationLog } = useAppContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    try {
      await addIrrigationLog({
        land_id: selectedLandId,
        date,
        amount: Number(amount),
        unit,
        method,
        notes
      });
      toast.success("Sulama kaydı oluşturuldu.");
      setIsAddModalOpen(false);
      setAmount(''); setNotes('');
    } catch (err) {
      toast.error("Hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    return land ? `${land.district || land.city} - A:${land.block_no}/P:${land.parcel_no}` : 'Bilinmeyen Arazi';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Sulama Takibi</h1>
          <p className="text-text-muted font-bold text-sm">Su tüketiminizi ve sulama periyotlarınızı yönetin.</p>
        </div>
        <Button size="md" leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>Yeni Sulama Kaydı</Button>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
               <Waves size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bu Ay Toplam</p>
               <h3 className="text-xl font-black text-text-primary">
                  {irrigationLogs.length > 0 ? irrigationLogs.reduce((s, l) => s + (l.amount || 0), 0) : 0} <span className="text-sm font-bold">Saat</span>
               </h3>
            </div>
         </Card>
         <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <Droplet size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sulanabilir Alan</p>
               <h3 className="text-xl font-black text-text-primary">
                  {lands.filter(l => l.is_irrigated).reduce((s, l) => s + l.size_decare, 0)} <span className="text-sm font-bold">Dönüm</span>
               </h3>
            </div>
         </Card>
         <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
               <Calendar size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Son Sulama</p>
               <h3 className="text-xl font-black text-text-primary">
                  {irrigationLogs[0] ? formatDateShort(irrigationLogs[0].date) : '-'}
               </h3>
            </div>
         </Card>
      </div>

      {/* HISTORY LIST */}
      <Card padding="none" className="overflow-hidden">
         <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
            <h3 className="text-sm font-black font-heading text-text-primary uppercase tracking-tight">Geçmiş Sulamalar</h3>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{irrigationLogs.length} Kayıt</span>
         </div>
         <div className="divide-y divide-border">
            {irrigationLogs.length > 0 ? (
              irrigationLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-all group cursor-pointer active:bg-surface-3">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                         <Droplet size={20} />
                      </div>
                      <div>
                         <h4 className="font-bold text-text-primary leading-tight mb-0.5">{getLandDisplay(log.land_id)}</h4>
                         <div className="flex items-center gap-3 text-xs font-bold text-text-muted">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateShort(log.date)}</span>
                            <span className="opacity-30">•</span>
                            <span className="uppercase tracking-wider">{log.method}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <div className="text-xl font-black font-heading text-blue-600 tracking-tight">
                            {log.amount || 0} <span className="text-xs">{log.unit || 'saat'}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => { deleteIrrigationLog(log.id); toast.success("Kayıt silindi."); }}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))
            ) : (
              <EmptyState title="Sulama kaydı yok" description="Arazilerinize ait sulama işlemlerini buraya kaydedin." emoji="💧" />
            )}
         </div>
      </Card>

      {/* ADD MODAL */}
      <BaseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Sulama Kaydı"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
           <Input as="select" label="Arazi Seçimi" value={selectedLandId} onChange={e => setSelectedLandId(e.target.value)} required>
              <option value="" disabled>Seçiniz...</option>
              {lands.filter(l => l.is_irrigated).map(l => (
                <option key={l.id} value={l.id}>{l.district || l.city} - Ada {l.block_no}/P.{l.parcel_no}</option>
              ))}
           </Input>

           <Input label="Tarih" type="date" value={date} onChange={e => setDate(e.target.value)} required />

           <div className="grid grid-cols-2 gap-4">
              <Input label="Süre / Miktar" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} required />
              <Input as="select" label="Birim" value={unit} onChange={e => setUnit(e.target.value as any)} required>
                <option value="saat">Saat</option>
                <option value="ton">Ton</option>
                <option value="litre">Litre</option>
              </Input>
           </div>

           <Input as="select" label="Sulama Yöntemi" value={method} onChange={e => setMethod(e.target.value)} required>
              <option value="" disabled>Seçiniz...</option>
              <option value="Damlama">Damlama</option>
              <option value="Yağmurlama">Yağmurlama</option>
              <option value="Salma">Salma</option>
              <option value="Pivot">Pivot</option>
              <option value="Diğer">Diğer</option>
           </Input>

           <Input label="Notlar" placeholder="Hava rüzgarlıydı vb." value={notes} onChange={e => setNotes(e.target.value)} />

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" fullWidth onClick={() => setIsAddModalOpen(false)}>Vazgeç</Button>
              <Button fullWidth type="submit" isLoading={isSubmitting}>Kaydet</Button>
           </div>
        </form>
      </BaseModal>
    </div>
  );
}
