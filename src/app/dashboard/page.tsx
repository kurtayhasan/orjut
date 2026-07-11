'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { 
  TrendingDown, TrendingUp, LandPlot, 
  Activity, Calendar, MapPin, 
  ChevronRight, ArrowUpRight, 
  CreditCard, Sprout, Fuel, 
  Users, Package, Droplet,
  FlaskConical, Bug, Tractor,
  Plus, Bell, Search, Settings,
  LogOut, PieChart, BarChart3,
  Sun, Wind, CloudRain, Sparkles, AlertTriangle,
  BrainCircuit, ShieldCheck, Microscope, Zap,
  GraduationCap, ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';

// Skeleton Component
const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-surface-2/50 rounded-xl animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-3 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-surface-3 rounded" />
            <div className="h-3 w-20 bg-surface-3 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-surface-3 rounded" />
      </div>
    ))}
  </div>
);

export default function DashboardPage() {
  const { 
    lands, transactions, isLoadingTransactions, 
    userProfile, weather, dailyInsight, criticalAlert,
    requestWeatherAndInsight, inventory, setIsExpenseModalOpen,
    fieldOperations, scoutingLogs, userRole, isLoadingProfile,
    isAnalyzing
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');

  const lowStockItems = useMemo(() => inventory.filter(i => i.quantity < 10), [inventory]);

  const filteredTransactions = useMemo(() => {
    const list = transactions.slice(0, 5);
    if (activeTab === 'all') return list;
    return list.filter(t => t.type === activeTab);
  }, [transactions, activeTab]);

  const handleStartAnalysis = () => {
    requestWeatherAndInsight();
  };

  const unappliedPrescriptions = useMemo(() => 
    scoutingLogs.filter(log => (log.prescription_text || log.prescription_action) && !log.is_prescription_applied), 
    [scoutingLogs]
  );

  const categoryStats = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    if (total === 0) return [];
    
    const grouped: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      const cat = t.description || 'Diğer';
      grouped[cat] = (grouped[cat] || 0) + Number(t.amount || 0);
    });
    
    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Helper to get last activity for a land
  const getLandLastActivity = (landId: string) => {
    const ops = fieldOperations.filter(o => o.land_id === landId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const scs = scoutingLogs.filter(s => s.land_id === landId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastOp = ops[0];
    const lastSc = scs[0];
    
    return { lastOp, lastSc };
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 dark:text-zinc-400 font-black text-xs uppercase tracking-widest animate-pulse">
          Oturum Bilgileri Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* BÖLÜM 1 — KARŞILAMA VE GİRİŞ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">
            Merhaba, {userProfile?.first_name || 'Çiftçi'} 👋
          </h1>
          <p className="text-text-muted font-bold text-sm">Orjut AgTech Tarım İşletim Sistemine Hoş Geldiniz.</p>
        </div>
      </div>

      {lands.length === 0 ? (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4">
          <Card className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6" padding="none">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse mt-8">
              <Tractor size={48} className="stroke-[1.5]" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-black font-heading text-text-primary">İlk Arazinizi Ekleyin!</h2>
              <p className="text-sm font-bold text-text-muted leading-relaxed px-4">
                Hoş geldiniz! Akıllı tarım asistanınızın çalışması, NDVI sağlık analizlerinin yapılması ve konumunuza özel gerçek zamanlı hava durumunun alınabilmesi için lütfen harita üzerinden ilk arazinizi ekleyin.
              </p>
            </div>
            <Link href="/dashboard/lands" className="pb-8">
              <Button size="lg" className="font-black uppercase tracking-wider text-xs shadow-lg px-8 py-4" leftIcon={<Plus size={18} />}>
                İlk Arazimi Ekle
              </Button>
            </Link>
          </Card>
        </div>
      ) : (
        <>
          {/* PHASE 2: PRESCRIPTION ALERT BANNER */}
          {userRole !== 'engineer' && unappliedPrescriptions.length > 0 && (
            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-none shadow-lg animate-bounce-subtle" padding="lg">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <GraduationCap size={28} />
                     </div>
                     <div className="text-white">
                        <h3 className="text-lg font-black font-heading tracking-tight">Zirai Reçete Bildirimi</h3>
                        <p className="text-sm font-bold text-amber-50/90">Ziraat Mühendisinizden {unappliedPrescriptions.length} adet yeni zirai tavsiye/reçete var.</p>
                     </div>
                  </div>
                  <Link href="/dashboard/scouting">
                     <Button className="bg-white text-amber-600 hover:bg-amber-50 border-none font-black shadow-md" size="md" rightIcon={<ArrowRight size={18} />}>
                       Reçeteleri Gör
                     </Button>
                  </Link>
               </div>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" size="md" leftIcon={<Plus size={18} />} onClick={() => setIsExpenseModalOpen(true)}>MASRAF EKLE</Button>
            <Link href="/dashboard/operations">
              <Button size="md" leftIcon={<Tractor size={18} />}>İŞLEM KAYDET</Button>
            </Link>
          </div>

          {/* BÖLÜM 2 — PREMIUM AI ANALİZ VE HAVA DURUMU (EXPANDED) */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <Card padding="none" className="xl:col-span-3 bg-primary border-none shadow-2xl overflow-hidden relative group min-h-[320px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary-dark opacity-100" />
              
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
                <BrainCircuit size={200} />
              </div>
              <div className="absolute bottom-0 left-0 p-12 opacity-5">
                <Sparkles size={160} />
              </div>
              
              <div className="relative z-0 p-6 md:p-10 flex flex-col flex-1">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
                  {/* Weather Widget */}
                  <div className="flex items-center gap-6 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-lg shrink-0">
                    <div className="text-center">
                      <Sun className="text-amber-300 mb-1 mx-auto drop-shadow-md" size={40} />
                      <div className="text-4xl font-black text-white">{weather.temp ?? '--'}°</div>
                      <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1 truncate max-w-[120px]">
                        {lands.length > 0 ? (lands[0].district || lands[0].city || 'Arazi Konumu').toUpperCase() : 'KONUM BEKLENİYOR'}
                      </div>
                    </div>
                    <div className="w-px h-16 bg-white/20" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/90 text-sm font-bold">
                        <Wind size={18} className="text-blue-200" /> {weather.windspeed ?? '--'} km/s
                      </div>
                      <div className="flex items-center gap-3 text-white/90 text-sm font-bold">
                        <CloudRain size={18} className="text-blue-300" /> {(weather as any).humidity !== null ? `%${(weather as any).humidity} Nem` : '%-- Nem'}
                      </div>
                    </div>
                  </div>

                  {/* AI Insight Header */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Zap size={20} className="text-amber-300 fill-amber-300" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Akıllı Tarım Asistanı</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black font-heading text-white leading-tight tracking-tight mb-2">Günlük Proaktif Analiz Raporu</h2>
                    <p className="text-xs font-bold text-white/70">Gerçek zamanlı hava durumu ve ekin evresi analizleriyle oluşturulan tavsiyeler.</p>
                  </div>
                </div>

                {/* AI Insight Content */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/10 p-6 rounded-3xl flex-1 flex flex-col justify-between">
                  <div className="text-white text-sm font-bold leading-relaxed space-y-2 mb-4">
                     {criticalAlert && (
                       <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
                         <AlertTriangle size={18} />
                         <span>{criticalAlert}</span>
                       </div>
                     )}
                     {dailyInsight ? (
                       <p className="whitespace-pre-line">{dailyInsight}</p>
                     ) : (
                       <div className="flex flex-col items-center justify-center py-6 text-center text-white/60">
                         <BrainCircuit size={36} className="animate-pulse mb-3" />
                         <p className="text-xs font-bold">Yapay zeka analiz raporunuz hazırlanmaya hazır.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 border-white/30 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-2"
                            onClick={() => handleStartAnalysis()}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Analiz Ediliyor...</span>
                              </>
                            ) : (
                              <span>Analizi Başlat</span>
                            )}
                          </Button>
                        </div>
                      )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-black text-white/50 uppercase tracking-widest">
                     <span>ORJUT AI ENGINE v1.2</span>
                     <span>SON GÜNCELLEME: BUGÜN</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* BÖLÜM 3 — FİNANSAL SAĞLIK / GİDER ANALİZİ */}
            <Card className="xl:col-span-1 flex flex-col justify-between" padding="lg">
               <div>
                  <div className="flex items-center justify-between border-b border-surface-3 pb-4 mb-4">
                     <h4 className="text-sm font-black font-heading uppercase tracking-widest text-text-primary">Gider Analizi</h4>
                  </div>
                  <div className="space-y-5">
                     {categoryStats.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent">
                         <p className="text-xs font-bold text-text-muted leading-relaxed max-w-[180px] mx-auto">
                           Gider analizi oluşturmak için henüz masraf girmediniz.
                         </p>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="mt-4 font-black text-[10px] uppercase tracking-wider"
                           onClick={() => setIsExpenseModalOpen(true)}
                         >
                           Gider Ekle
                         </Button>
                       </div>
                     ) : (
                       categoryStats.map((stat, idx) => (
                         <div key={stat.name} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                               <span className="text-text-muted truncate mr-2">{stat.name}</span>
                               <span className="text-text-primary shrink-0">%{stat.percentage}</span>
                            </div>
                            <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                               <div 
                                 className={cn(
                                   "h-full rounded-full transition-all duration-500", 
                                   idx === 0 ? "bg-primary" : "bg-primary/60"
                                 )} 
                                 style={{ width: `${stat.percentage}%` }} 
                               />
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </Card>
          </div>

          {/* BÖLÜM 4 — EN SON HAREKETLER VE ARAZİ LİSTESİ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-black font-heading text-text-primary uppercase tracking-tight">Son Masraflar ve İşlemler</h3>
                <Link href="/dashboard/transactions" className="text-xs font-black text-primary hover:underline">TÜMÜ →</Link>
              </div>
              <Card padding="none" className="overflow-hidden">
                {isLoadingTransactions ? (
                  <div className="p-6"><ListSkeleton count={4} /></div>
                ) : transactions.length === 0 ? (
                  <div className="p-10 text-center text-text-muted font-bold text-sm">
                    Henüz işlem veya masraf kaydedilmemiş.
                  </div>
                ) : (
                  transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-5 border-b border-surface-3 hover:bg-surface-2/40 transition-colors last:border-b-0">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          tx.type === 'expense' ? "bg-red-50 text-danger" : "bg-green-50 text-success"
                        )}>
                          {tx.type === 'expense' ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-text-primary text-base leading-tight mb-1 truncate">{tx.description || tx.category}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded">{tx.category}</span>
                            <span className="text-[10px] font-bold text-text-muted">{formatDateShort(tx.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={cn(
                          "font-black text-lg tracking-tight",
                          tx.type === 'expense' ? "text-danger" : "text-success"
                        )}>
                          {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                        {tx.receipt_url && <span className="text-[9px] font-black text-primary uppercase bg-primary-50 px-1.5 py-0.5 rounded mt-1">Belge Mevcut</span>}
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </div>

            {/* BÖLÜM 5 — ARAZİ ÖZETİ VE NAVİGASYON */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-black font-heading text-text-primary uppercase tracking-tight">Arazilerim</h3>
                <Link href="/dashboard/lands" className="text-xs font-black text-primary hover:underline">TÜMÜ →</Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {lands.slice(0, 4).map(land => (
                   <Card key={land.id} padding="md" hoverable className="flex items-center justify-between group cursor-pointer border-2 hover:border-primary/20">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <LandPlot size={24} />
                         </div>
                         <div>
                            <h4 className="font-black text-text-primary text-base leading-tight mb-1">{land.district || land.city}</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded">{land.crop_type}</span>
                               <span className="text-[10px] font-bold text-text-muted">{land.size_decare} Dönüm</span>
                            </div>
                         </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ChevronRight size={18} className="text-text-muted group-hover:text-primary" />
                      </div>
                   </Card>
                 ))}
                 {lands.length === 0 && (
                   <div className="bg-surface-2 p-10 rounded-3xl border-2 border-dashed border-border text-center">
                      <p className="text-sm font-bold text-text-muted">Henüz arazi kaydı yapmadınız.</p>
                      <Link href="/dashboard/lands">
                        <Button variant="outline" size="sm" className="mt-4">Arazi Ekle</Button>
                      </Link>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
