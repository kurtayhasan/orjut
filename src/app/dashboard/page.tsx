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
  Sun, Wind, CloudRain, Sparkles
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
    userProfile, weather, dailyInsight, 
    requestWeatherAndInsight 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');

  const filteredTransactions = useMemo(() => {
    const list = transactions.slice(0, 5);
    if (activeTab === 'all') return list;
    return list.filter(t => t.type === activeTab);
  }, [transactions, activeTab]);

  const handleStartAnalysis = () => {
    requestWeatherAndInsight();
  };

  const categories = ['Mazot', 'Gübre', 'İlaç', 'Tohum', 'İşçilik'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* BÖLÜM 1 — KARŞILAMA VE HIZLI AKSİYONLAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">
            Merhaba, {userProfile?.first_name || 'Çiftçi'} 👋
          </h1>
          <p className="text-text-muted font-bold text-sm">Arazilerinizde her şey yolunda görünüyor.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance">
            <Button variant="outline" size="md" leftIcon={<Plus size={18} />}>MASRAF EKLE</Button>
          </Link>
          <Link href="/dashboard/operations">
            <Button size="md" leftIcon={<Tractor size={18} />}>İŞLEM KAYDET</Button>
          </Link>
        </div>
      </div>

      {/* BÖLÜM 2 — AI ANALİZ VE HAVA DURUMU */}
      <Card padding="none" className="bg-primary border-none shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary-dark opacity-100" />
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={120} />
        </div>
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          {/* Weather Widget */}
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <Sun className="text-amber-300 mb-1 mx-auto" size={32} />
              <div className="text-3xl font-black text-white">{weather.temp ?? '--'}°</div>
              <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">SÖKE, AYDIN</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                <Wind size={14} /> {weather.windspeed ?? '--'} km/s
              </div>
              <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                <CloudRain size={14} /> %12 Yağış
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">GÜNLÜK ZİRAİ ANALİZ</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-heading text-white leading-tight mb-3">
              {dailyInsight ? "Bugün için sulama tavsiyeniz hazır." : "Arazilerinizi yapay zeka ile analiz edin."}
            </h2>
            {dailyInsight ? (
              <p className="text-sm font-medium text-white/90 leading-relaxed max-w-2xl line-clamp-2">
                {dailyInsight}
              </p>
            ) : (
               <button onClick={handleStartAnalysis} className="text-xs font-black text-primary hover:underline mt-2">Detaylı analiz raporu oluştur →</button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* BÖLÜM 4 — SON İŞLEMLER */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black font-heading text-text-primary uppercase tracking-tight">Son İşlemler</h3>
            <Link href="/dashboard/finance" className="text-xs font-black text-primary hover:underline">TÜMÜ →</Link>
          </div>
          <Card padding="none" className="divide-y divide-border overflow-hidden">
            {isLoadingTransactions ? (
              <ListSkeleton count={5} />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState title="Henüz işlem yok" description="Harcalarınızı buraya kaydederek takibini yapabilirsiniz." emoji="💸" />
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors active:bg-surface-3 cursor-pointer group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-black/5",
                      tx.description === 'Mazot' ? 'bg-orange-100 text-orange-600' : 
                      tx.description === 'Gübre' ? 'bg-emerald-100 text-emerald-600' : 
                      tx.description === 'İlaç' ? 'bg-purple-100 text-purple-600' : 
                      tx.description === 'Tohum' ? 'bg-amber-100 text-amber-600' : 
                      tx.description === 'İşçilik' ? 'bg-blue-100 text-blue-600' : 'bg-surface-3 text-text-muted'
                    )}>
                      {tx.description === 'Mazot' ? '⛽' : tx.description === 'Gübre' ? '🌱' : tx.description === 'İlaç' ? '🧪' : tx.description === 'Tohum' ? '🌾' : tx.description === 'İşçilik' ? '🧑‍🌾' : '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary truncate">{tx.description}</p>
                      <p className="text-xs font-bold text-text-muted truncate">
                        {tx.lands ? `Ada ${tx.lands.block_no}/P. ${tx.lands.parcel_no}` : 'Genel İşlem'} • {formatDateShort(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={cn(
                      "font-black text-base",
                      tx.type === 'expense' ? "text-danger" : "text-success"
                    )}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </span>
                    {tx.receipt_url && <span className="text-[10px] font-bold text-text-muted">📁 Fiş Eklendi</span>}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* BÖLÜM 5 — ARAZİ ÖZETİ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black font-heading text-text-primary uppercase tracking-tight">Aktif Araziler</h3>
            <Link href="/dashboard/lands" className="text-xs font-black text-primary hover:underline">YÖNET →</Link>
          </div>
          <div className="space-y-3">
             {lands.slice(0, 3).map(land => (
               <Card key={land.id} padding="sm" hoverable className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <LandPlot size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-text-primary text-sm leading-tight">{land.district || land.city}</h4>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{land.crop_type}</p>
                     </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted" />
               </Card>
             ))}
             {lands.length === 0 && (
               <div className="bg-surface-2 p-6 rounded-2xl border-2 border-dashed border-border text-center">
                  <p className="text-xs font-bold text-text-muted">Kayıtlı araziniz bulunmuyor.</p>
               </div>
             )}
          </div>
          
          {/* Quick Stats Widget */}
          <Card padding="md" className="bg-surface-2 border-border shadow-inner mt-6">
             <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-text-primary" />
                <h4 className="text-xs font-black font-heading uppercase tracking-widest text-text-primary">Gider Özeti</h4>
             </div>
             <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat} className="space-y-1">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-text-muted">{cat}</span>
                        <span className="text-text-primary">%24</span>
                     </div>
                     <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '24%' }} />
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
