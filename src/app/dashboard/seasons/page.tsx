'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  CalendarDays, Plus, Calendar, 
  FileText, FileSpreadsheet, Share2, 
  X, Save, Archive, History,
  ChevronRight, ArrowRight, Sparkles
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import SeasonCompareCard from '@/components/seasons/SeasonCompareCard';
import { generateSeasonPDF, generateSeasonExcel, shareViaWhatsApp } from '@/lib/reportGenerator';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import { cn } from '@/lib/utils';

export default function SeasonsPage() {
  const { seasons, activeSeason, setActiveSeason, toggleSeasonStatus, transactions, lands, startNewSeason } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newSeasonName, setNewSeasonName] = React.useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1} Sezonu`);
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDownloadPDF = () => {
    if (!activeSeason) return;
    try {
      generateSeasonPDF(activeSeason, transactions, lands);
      toast.success("PDF Raporu hazır.");
    } catch (err) {
      toast.error("Rapor oluşturulamadı.");
    }
  };

  const handleDownloadExcel = () => {
    if (!activeSeason) return;
    try {
      generateSeasonExcel(activeSeason, transactions, lands);
      toast.success("Excel Raporu hazır.");
    } catch (err) {
      toast.error("Rapor oluşturulamadı.");
    }
  };

  const handleShareWhatsApp = async () => {
    if (!activeSeason) return;
    try {
      const pdfBlob = generateSeasonPDF(activeSeason, transactions, lands);
      if (pdfBlob) {
        await shareViaWhatsApp(pdfBlob, activeSeason.name);
      }
    } catch (err) {
      toast.error("Paylaşım başarısız oldu.");
    }
  };

  const handleStartSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await startNewSeason(newSeasonName, startDate, endDate);
      setIsModalOpen(false);
      toast.success("Yeni sezon başarıyla başlatıldı.");
    } catch (err) {
      toast.error("Sezon başlatılamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl text-primary border border-primary/20 shadow-lg shadow-primary/10">
            <Archive size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading text-zinc-100 tracking-tight">Sezonlar & Arşiv</h1>
            <p className="text-text-muted font-bold text-sm">Üretim döngülerini dökümante edin ve analiz edin.</p>
          </div>
        </div>
        <Button size="md" leftIcon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
          Yeni Sezon Başlat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SEASON LIST */}
        <div className="lg:col-span-4 space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Kayıtlı Sezonlar</h3>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{seasons.length} Döngü</span>
           </div>
           
           <div className="space-y-3">
              {seasons.length > 0 ? (
                seasons.map((season: any) => (
                  <Card 
                    key={season.id} 
                    padding="sm"
                    hoverable
                    onClick={() => setActiveSeason(season)}
                    className={cn(
                      "transition-all group",
                      activeSeason?.id === season.id 
                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20" 
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col">
                          <h4 className={cn(
                            "font-black tracking-tight transition-colors",
                            activeSeason?.id === season.id ? "text-primary" : "text-zinc-100"
                          )}>
                            {season.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">
                             <Calendar size={12} className="text-text-muted/50" />
                             {new Date(season.start_date).toLocaleDateString('tr-TR')} - {new Date(season.end_date).toLocaleDateString('tr-TR')}
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSeasonStatus(season.id, season.is_active);
                            }}
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all",
                              season.is_active 
                                ? "text-danger bg-danger/10 border-danger/20 hover:bg-danger/20" 
                                : "text-success bg-success/10 border-success/20 hover:bg-success/20"
                            )}
                          >
                            {season.is_active ? 'ARŞİVLE' : 'AKTİFLEŞTİR'}
                          </button>
                          {season.is_active && (
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" title="Şu anki aktif sezon" />
                          )}
                       </div>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState title="Henüz sezon yok" description="İlk üretim döngünüzü başlatarak takibe başlayın." emoji="⏳" />
              )}
           </div>
        </div>

        {/* COMPARISON & DETAILS */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Performans Karşılaştırması</h3>
              {activeSeason && (
                <div className="flex gap-2">
                   <button onClick={handleDownloadPDF} className="p-2 bg-white/[0.05] text-zinc-100 rounded-lg hover:bg-white/10 border border-white/5 transition-all" title="PDF Raporu">
                      <FileText size={16} />
                   </button>
                   <button onClick={handleDownloadExcel} className="p-2 bg-white/[0.05] text-zinc-100 rounded-lg hover:bg-white/10 border border-white/5 transition-all" title="Excel Raporu">
                      <FileSpreadsheet size={16} />
                   </button>
                   <button onClick={handleShareWhatsApp} className="p-2 bg-white/[0.05] text-zinc-100 rounded-lg hover:bg-white/10 border border-white/5 transition-all" title="WhatsApp ile Paylaş">
                      <Share2 size={16} />
                   </button>
                </div>
              )}
           </div>

           {seasons.length >= 2 ? (
             <SeasonCompareCard season1={seasons[0]} season2={seasons[1]} />
           ) : (
             <Card className="bg-white/[0.01] border-dashed border-white/10 py-12 text-center">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                   <History size={32} className="text-text-muted" />
                </div>
                <p className="text-sm font-bold text-text-muted max-w-xs mx-auto">
                   Karşılaştırma ve detaylı analiz için en az 2 sezon kaydına ihtiyacınız var.
                </p>
             </Card>
           )}

           {/* INSIGHT CARD */}
           <Card className="bg-primary/10 border-primary/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles size={64} className="text-primary" />
              </div>
              <div className="relative z-10 space-y-3">
                 <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">SİSTEM TAVSİYESİ</span>
                 </div>
                 <h4 className="text-lg font-black text-zinc-100 tracking-tight leading-tight">
                    Sezonlar arası kârlılık oranınızı %14 artırabilirsiniz.
                 </h4>
                 <p className="text-sm text-text-muted font-medium leading-relaxed">
                    Geçen yılın mazot ve gübre kullanım verileri incelendiğinde, bu sezon daha optimize bir stok yönetimi ile maliyetleri düşürmeniz mümkün.
                 </p>
                 <button className="text-xs font-black text-primary flex items-center gap-1 hover:underline pt-2">
                    VERİ ANALİZİNİ GÖR <ArrowRight size={14} />
                 </button>
              </div>
           </Card>
        </div>
      </div>

      {/* NEW SEASON MODAL */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Yeni Sezon Başlat"
      >
        <form onSubmit={handleStartSeason} className="space-y-6">
           <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-3">
              <CalendarDays className="text-primary shrink-0" size={24} />
              <p className="text-xs font-bold text-text-primary leading-relaxed">
                 Yeni bir sezon başlatmak, mevcut finansal verilerinizi arşivler ve yeni bir sayfa açar. 
                 Arşivlenmiş verilere her zaman buradan erişebilirsiniz.
              </p>
           </div>

           <Input 
             label="Sezon Tanımlaması" 
             value={newSeasonName}
             onChange={(e) => setNewSeasonName(e.target.value)}
             required
             placeholder="Örn: 2025 Yaz Hasadı"
           />
           
           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Başlangıç Tarihi" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input 
                label="Hedef Bitiş Tarihi" 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
           </div>

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)} type="button">Vazgeç</Button>
              <Button fullWidth type="submit" isLoading={isSubmitting} leftIcon={<Save size={20} />}>Sezonu Başlat</Button>
           </div>
        </form>
      </BaseModal>
    </div>
  );
}
