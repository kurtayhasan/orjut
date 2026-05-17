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
import EmptyState from '@/components/EmptyState';

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
    fieldOperations, scoutingLogs, userRole 
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

  return (
    <div className="space-y-8 animate-fade-in pb-10">
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

      {/* BÖLÜM 1 — KARŞILAMA VE HIZLI AKSİYONLAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">
            Merhaba, {userProfile?.first_name || 'Çiftçi'} 👋
          </h1>
          <p className="text-text-muted font-bold text-sm">Arazilerinizde her şey yolunda görünüyor.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" leftIcon={<Plus size={18} />} onClick={() => setIsExpenseModalOpen(true)}>MASRAF EKLE</Button>
          <Link href="/dashboard/operations">
            <Button size="md" leftIcon={<Tractor size={18} />}>İŞLEM KAYDET</Button>
          </Link>
        </div>
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
                <h2 className="text-2xl md:text-4xl font-black font-heading text-white leading-tight mb-4 tracking-tight">
                  {dailyInsight ? "Sizin için 24 saatlik arazi raporu hazır." : "Verileriniz işleniyor..."}
                </h2>
                
                {/* PHASE 4: PROACTIVE ALERTS */}
                {criticalAlert && (
                  <div className="mb-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 animate-pulse-subtle">
                     <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-300 shrink-0 mt-0.5" size={20} />
                        <div>
                           <p className="text-sm font-black text-white uppercase tracking-wider mb-1">🚨 KRİTİK UYARI</p>
                           <p className="text-base font-bold text-amber-50 leading-tight">{criticalAlert}</p>
                        </div>
                     </div>
                  </div>
                )}

                {dailyInsight ? (
                  <div className="space-y-4">
                    <div className="text-base md:text-lg font-medium text-white/90 leading-relaxed max-w-3xl whitespace-pre-line">
                      {dailyInsight}
                    </div>
                    <div className="flex gap-4 pt-2">
                       <Button size="sm" variant="neutral" className="bg-white text-primary border-none hover:bg-white/90 font-black" leftIcon={<Microscope size={16} />}>Detaylı Rapor</Button>
                       <Button onClick={handleStartAnalysis} size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-black">Yeniden Analiz Et</Button>
                    </div>
                  </div>
                ) : (
                   <Button onClick={handleStartAnalysis} variant="neutral" className="bg-white text-primary hover:bg-white/90 font-black" leftIcon={<Sparkles size={18} />}>Analizi Başlat</Button>
                )}
              </div>
            </div>

            {/* Per-Land AI Status (New Phase) */}
            <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
               {lands.slice(0, 3).map(land => {
                 const { lastOp, lastSc } = getLandLastActivity(land.id);
                 return (
                   <div key={land.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="text-xs font-black text-white/80 uppercase tracking-wider truncate mr-2">{land.district} - {land.crop_type}</h4>
                         <ShieldCheck size={14} className={cn(lastSc?.health_status === 'saglikli' ? "text-emerald-400" : "text-amber-400")} />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] text-white/50 font-bold">
                           {lastOp ? `${formatDateShort(lastOp.date)}: ${lastOp.type}` : 'İşlem yok'}
                         </span>
                         <span className="text-[11px] text-white/90 font-black leading-tight line-clamp-1">
                           {lastSc?.notes || 'Gözlem kaydı bekleniyor...'}
                         </span>
                      </div>
                   </div>
                 );
               })}
               {lands.length === 0 && (
                 <div className="md:col-span-3 text-center py-4">
                    <p className="text-xs font-bold text-white/40 italic">Arazi verisi bulunamadı. AI analizi için lütfen arazi ekleyin.</p>
                 </div>
               )}
            </div>
          </div>
        </Card>

        {/* Quick Stats Column (Repositioned) */}
        <div className="flex flex-col gap-6">
           <Card padding="md" className="bg-surface-2 border-border shadow-inner flex-1">
              <div className="flex items-center gap-2 mb-6">
                 <BarChart3 size={20} className="text-text-primary" />
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
           </Card>

           {/* Critical Stock Widget (Phase 2) */}
           {lowStockItems.length > 0 && (
             <Card className="bg-danger-bg border-danger/20" padding="md">
               <div className="flex items-center gap-2 text-danger mb-3">
                 <AlertTriangle size={20} />
                 <h4 className="text-sm font-black font-heading uppercase tracking-tight">Kritik Stok</h4>
               </div>
               <div className="space-y-2">
                 {lowStockItems.slice(0, 2).map(item => (
                   <button 
                     key={item.id}
                     onClick={() => setIsExpenseModalOpen(true)}
                     className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors"
                   >
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                        <span className="text-xs font-bold text-text-primary">{item.item_name}</span>
                     </div>
                     <span className="text-xs font-black text-danger">{item.quantity} {item.unit}</span>
                   </button>
                 ))}
                 <Button 
                   variant="danger" 
                   size="sm" 
                   fullWidth 
                   className="mt-2"
                   onClick={() => setIsExpenseModalOpen(true)}
                 >
                   Eksikleri Tamamla
                 </Button>
               </div>
             </Card>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* BÖLÜM 4 — SON İŞLEMLER */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black font-heading text-text-primary uppercase tracking-tight">İşlem Günlüğü</h3>
            <Link href="/dashboard/finance" className="text-xs font-black text-primary hover:underline">TÜM GEÇMİŞ →</Link>
          </div>
          <Card padding="none" className="divide-y divide-border overflow-hidden shadow-sm">
            {isLoadingTransactions ? (
              <ListSkeleton count={5} />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState title="Henüz işlem yok" description="Harcalarınızı buraya kaydederek takibini yapabilirsiniz." emoji="💸" />
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-surface-2 transition-colors active:bg-surface-3 cursor-pointer group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5",
                      tx.description === 'Mazot' ? 'bg-orange-100 text-orange-600' : 
                      tx.description === 'Gübre' ? 'bg-emerald-100 text-emerald-600' : 
                      tx.description === 'İlaç' ? 'bg-purple-100 text-purple-600' : 
                      tx.description === 'Tohum' ? 'bg-amber-100 text-amber-600' : 
                      tx.description === 'İşçilik' ? 'bg-blue-100 text-blue-600' : 'bg-surface-3 text-text-muted'
                    )}>
                      {tx.description === 'Mazot' ? '⛽' : tx.description === 'Gübre' ? '🌱' : tx.description === 'İlaç' ? '🧪' : tx.description === 'Tohum' ? '🌾' : tx.description === 'İşçilik' ? '🧑‍🌾' : '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary truncate text-base leading-none mb-1.5">{tx.description}</p>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        {tx.lands ? <><MapPin size={10} /> {tx.lands.district} / {tx.lands.parcel_no}</> : 'Genel İşlem'} 
                        <span className="opacity-30">•</span> 
                        <Calendar size={10} /> {formatDateShort(tx.date)}
                      </p>
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
    </div>
  );
}
