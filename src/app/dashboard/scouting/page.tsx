'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  ClipboardCheck, Plus, Trash2, Calendar, 
  MapPin, Search, HeartPulse, Sprout, 
  Wheat, Activity, MoreVertical, Info,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import EmptyState from '@/components/EmptyState';
import { cn, formatDateShort } from '@/lib/utils';

export default function ScoutingPage() {
  const { lands, scoutingLogs, addScoutingLog, deleteScoutingLog } = useAppContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    try {
      await addScoutingLog({
        land_id: selectedLandId,
        date,
        growth_stage: growthStage,
        health_status: healthStatus,
        notes
      });
      toast.success("Gözlem raporu kaydedildi.");
      setIsAddModalOpen(false);
      setNotes('');
    } catch (err) {
      toast.error("Rapor kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLandDisplay = (landId: string) => {
    const land = lands.find(l => l.id === landId);
    return land ? `${land.district || land.city} - A:${land.block_no}/P:${land.parcel_no}` : 'Bilinmeyen Arazi';
  };

  const getGrowthStageLabel = (stage: string) => {
    switch (stage) {
      case 'cimlenme': return 'Çimlenme';
      case 'ciceklenme': return 'Çiçeklenme';
      case 'meyve_tutumu': return 'Meyve Tutumu';
      case 'hasat': return 'Hasat Dönemi';
      default: return stage;
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case 'saglikli': return 'Sağlıklı';
      case 'hastalik': return 'Hastalık Şüphesi';
      case 'zararli': return 'Zararlı Tespiti';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Arazi Gözlemi</h1>
          <p className="text-text-muted font-bold text-sm">Bitki sağlığını ve gelişim evrelerini dökümante edin.</p>
        </div>
        <Button size="md" leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>Yeni Gözlem Ekle</Button>
      </div>

      {/* TIMELINE */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black font-heading text-text-primary uppercase tracking-tight">Gözlem Geçmişi</h3>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{scoutingLogs.length} Rapor</span>
         </div>

         <div className="space-y-4">
            {scoutingLogs.length > 0 ? (
              scoutingLogs.map((log) => (
                <Card key={log.id} padding="lg" className="hover:shadow-md transition-all group">
                   <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-2 md:w-24 shrink-0 border-r border-border pr-6 md:pr-0 md:border-r-0 md:border-b-0">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                           log.health_status === 'saglikli' ? "bg-success-bg text-success" : 
                           log.health_status === 'hastalik' ? "bg-warning-bg text-warning" : "bg-danger-bg text-danger"
                         )}>
                            <HeartPulse size={24} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{formatDateShort(log.date)}</span>
                      </div>

                      <div className="flex-1 space-y-4">
                         <div className="flex items-start justify-between">
                            <div>
                               <h4 className="text-lg font-bold text-text-primary leading-tight">{getLandDisplay(log.land_id)}</h4>
                               <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-wider">{getGrowthStageLabel(log.growth_stage || 'cimlenme')} Evresi</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className={cn(
                                 "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                                 log.health_status === 'saglikli' ? "bg-success text-white" : 
                                 log.health_status === 'hastalik' ? "bg-warning text-[#1B2E1C]" : "bg-danger text-white"
                               )}>
                                  {getHealthStatusLabel(log.health_status || 'saglikli')}
                               </span>
                               <button 
                                 onClick={() => { deleteScoutingLog(log.id); toast.success("Rapor silindi."); }}
                                 className="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         </div>

                         {log.notes && (
                           <div className="p-4 bg-surface-2 rounded-xl border border-border text-sm text-text-primary leading-relaxed italic">
                              "{log.notes}"
                           </div>
                         )}
                      </div>
                   </div>
                </Card>
              ))
            ) : (
              <EmptyState title="Gözlem kaydı yok" description="Tarlalarınızdaki gelişimi takip etmek için ilk raporu oluşturun." emoji="🔍" />
            )}
         </div>
      </div>

      {/* ADD MODAL */}
      <BaseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Gözlem Raporu"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
           <Input as="select" label="Arazi Seçimi" value={selectedLandId} onChange={e => setSelectedLandId(e.target.value)} required>
              <option value="" disabled>Seçiniz...</option>
              {lands.map(l => (
                <option key={l.id} value={l.id}>{l.district || l.city} - A:{l.block_no}/P.{l.parcel_no}</option>
              ))}
           </Input>

           <Input label="Gözlem Tarihi" type="date" value={date} onChange={e => setDate(e.target.value)} required />

           <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-primary">Büyüme Evresi</label>
              <div className="grid grid-cols-2 gap-2">
                 {(['cimlenme', 'ciceklenme', 'meyve_tutumu', 'hasat'] as const).map(s => (
                   <button
                     key={s}
                     type="button"
                     onClick={() => setGrowthStage(s)}
                     className={cn(
                       "p-3 rounded-lg border-2 flex items-center gap-2 text-xs font-bold transition-all",
                       growthStage === s ? "bg-primary-50 border-primary text-primary shadow-sm" : "bg-surface-2 border-border text-text-muted"
                     )}
                   >
                     {s === 'cimlenme' ? <Sprout size={16} /> : s === 'ciceklenme' ? <Activity size={16} /> : s === 'meyve_tutumu' ? <Wheat size={16} /> : <ClipboardCheck size={16} />}
                     {getGrowthStageLabel(s)}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-primary">Genel Sağlık Durumu</label>
              <div className="flex flex-col gap-2">
                 {(['saglikli', 'hastalik', 'zararli'] as const).map(h => (
                   <button
                     key={h}
                     type="button"
                     onClick={() => setHealthStatus(h)}
                     className={cn(
                       "w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all",
                       healthStatus === h ? (
                         h === 'saglikli' ? "bg-success-bg border-success text-success" :
                         h === 'hastalik' ? "bg-warning-bg border-warning text-warning" : "bg-danger-bg border-danger text-danger"
                       ) : "bg-surface-2 border-border text-text-muted"
                     )}
                   >
                     <span>{getHealthStatusLabel(h)}</span>
                     {healthStatus === h && (
                       h === 'saglikli' ? <CheckCircle2 size={18} /> : h === 'hastalik' ? <AlertCircle size={18} /> : <AlertCircle size={18} />
                     )}
                   </button>
                 ))}
              </div>
           </div>

           <Input label="Gözlem Notları" placeholder="Örn: Alt yapraklarda hafif sararma var..." value={notes} onChange={e => setNotes(e.target.value)} />

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" fullWidth onClick={() => setIsAddModalOpen(false)}>Vazgeç</Button>
              <Button fullWidth type="submit" isLoading={isSubmitting}>Raporu Kaydet</Button>
           </div>
        </form>
      </BaseModal>
    </div>
  );
}
