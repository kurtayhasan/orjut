'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { CalendarDays, Plus, Calendar, FileText, FileSpreadsheet, Share2, X, Save } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import SeasonCompareCard from '@/components/seasons/SeasonCompareCard';
import { generateSeasonPDF, generateSeasonExcel, shareViaWhatsApp } from '@/lib/reportGenerator';
import { toast } from 'sonner';

export default function SeasonsPage() {
  const { seasons, activeSeason, setActiveSeason, transactions, lands, startNewSeason } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newSeasonName, setNewSeasonName] = React.useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1} Sezonu`);
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);

  const handleDownloadPDF = () => {
    if (!activeSeason) return;
    try {
      generateSeasonPDF(activeSeason, transactions, lands);
    } catch (err) {
      toast.error("Rapor oluşturulamadı, lütfen tekrar deneyin.");
    }
  };

  const handleDownloadExcel = () => {
    if (!activeSeason) return;
    try {
      generateSeasonExcel(activeSeason, transactions, lands);
    } catch (err) {
      toast.error("Rapor oluşturulamadı, lütfen tekrar deneyin.");
    }
  };

  const handleShareWhatsApp = async () => {
    if (!activeSeason) return;
    try {
      const pdfBlob = generateSeasonPDF(activeSeason, transactions, lands);
      await shareViaWhatsApp(pdfBlob, activeSeason.name);
    } catch (err) {
      toast.error("Paylaşım başarısız oldu.");
    }
  };

  const handleStartSeason = async () => {
    await startNewSeason(newSeasonName, startDate, endDate);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-40">
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <CalendarDays size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Sezonlar & Arşiv</h1>
            <p className="text-zinc-500 font-medium text-sm">Geçmiş sezonları incele ve karşılaştır</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Yeni Sezon Başlat
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-zinc-900">Sezon Listesi</h2>
          {seasons.length > 0 ? (
            <div className="space-y-3">
              {seasons.map((season: any) => (
                <div 
                  key={season.id} 
                  className={`p-4 border-2 rounded-2xl transition-all cursor-pointer ${activeSeason?.id === season.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-zinc-100 hover:border-indigo-100'}`}
                  onClick={() => setActiveSeason(season)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-zinc-900">{season.name}</h3>
                    {season.is_active && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Aktif</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                    <Calendar size={14} />
                    {new Date(season.start_date).toLocaleDateString('tr-TR')} - {new Date(season.end_date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz bir sezon kaydı yok." icon={CalendarDays} />
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">Sezon Karşılaştırması</h2>
            {activeSeason && (
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors">
                  <FileText size={16} /> PDF İndir
                </button>
                <button onClick={handleDownloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet size={16} /> Excel İndir
                </button>
                <button onClick={handleShareWhatsApp} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
                  <Share2 size={16} /> Paylaş
                </button>
              </div>
            )}
          </div>
          {seasons.length >= 2 ? (
            <SeasonCompareCard season1={seasons[0]} season2={seasons[1]} />
          ) : (
            <div className="bg-white border-2 border-zinc-100 border-dashed rounded-3xl p-8 text-center text-zinc-500 font-medium">
              Karşılaştırma yapabilmek için en az 2 sezon kaydınızın olması gerekmektedir.
            </div>
          )}
        </div>
      </div>

      {/* New Season Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-zinc-900">Yeni Sezon Başlat</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} className="text-zinc-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Sezon Adı</label>
                <input 
                  type="text" 
                  value={newSeasonName}
                  onChange={(e) => setNewSeasonName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                  placeholder="Örn: 2025-2026 Sezonu"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Başlangıç</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Bitiş</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50/50 rounded-b-3xl border-t border-zinc-100">
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-all">İptal</button>
                <button 
                  onClick={handleStartSeason}
                  className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Sezonu Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
