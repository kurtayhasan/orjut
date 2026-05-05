'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import BottomBar from '@/components/BottomBar';
import { Sparkles, Plus, Map as MapIcon, Wallet, PieChart, Cloud, Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import CategoryPieChart from '@/components/budget/CategoryPieChart';
import CategorySummaryBar from '@/components/budget/CategorySummaryBar';
import { useCategoryTotals } from '@/hooks/useCategoryTotals';
import BudgetProgressBar from '@/components/budget/BudgetProgressBar';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { 
    totalExpenses, totalArea, dailyInsight, totalSavings, 
    weatherData, transactions, isLoadingTransactions, isLoadingLands, 
    lands, inventory, fieldOperations, scoutingLogs, userProfile 
  } = useAppContext();
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const categoryTotals = useCategoryTotals(transactions);

  const filteredTransactions = useMemo(() => {
    return activeFilter 
      ? transactions.filter(t => t.description === activeFilter)
      : transactions;
  }, [activeFilter, transactions]);
  
  const costPerDonum = useMemo(() => totalArea > 0 ? totalExpenses / totalArea : 0, [totalArea, totalExpenses]);

  const projectedRevenue = useMemo(() => lands.reduce((sum, land) => {
    const yieldAmt = Number(land.expected_yield_per_decare) || 0;
    const price = Number(land.expected_sell_price_unit) || 0;
    return sum + (yieldAmt * price);
  }, 0), [lands]);
  
  const projectedProfit = useMemo(() => projectedRevenue > 0 ? projectedRevenue - totalExpenses : 0, [projectedRevenue, totalExpenses]);

  const categoryData = useMemo(() => {
    const cats = ['Mazot', 'Gübre', 'İlaç', 'Tohum', 'İşçilik'];
    const colors = ['#F97316', '#22C55E', '#14B8A6', '#EF4444', '#3B82F6', '#94A3B8'];
    
    return [
      ...cats.map((cat, i) => ({
        name: cat,
        value: transactions.filter(t => t.description === cat).reduce((s, t) => s + t.amount, 0),
        color: colors[i],
        budget: 0
      })),
      {
        name: 'Diğer',
        value: transactions.filter(t => !cats.includes(t.description)).reduce((s, t) => s + t.amount, 0),
        color: colors[5],
        budget: 0
      }
    ];
  }, [transactions]);

  const handleStartAnalysis = async () => {
    if (!userProfile?.is_premium) {
      toast.error("Yapay Zeka Analizi sadece Premium üyeler içindir.", {
        description: "Verilerinizi profesyonel bir ziraat mühendisi gibi analiz ettirmek için yükseltin."
      });
      return;
    }
    
    if (!lands[0]?.id) {
      toast.error("Analiz için en az bir arazi kaydınız olmalıdır.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ landId: lands[0].id, userId: localStorage.getItem('user_id') })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
        toast.success("Analiz tamamlandı!");
      }
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-48">
      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
          <Sparkles size={140} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <Sparkles size={20} />
            </div>
            <h2 className="font-black text-lg uppercase tracking-tight">Günün Zirai Özeti</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4 text-xs font-black text-indigo-100/80 uppercase tracking-widest">
                <span>📍 {lands[0]?.city || 'Kızıltepe'}, {lands[0]?.district || 'Mardin'}</span>
                <span>🌡️ {weatherData?.temperature || 35}°C, {weatherData?.condition || 'Açık'}</span>
              </div>
              <p className="text-white text-xl md:text-2xl font-bold leading-tight">
                {dailyInsight || "Verileriniz analiz ediliyor, lütfen bekleyin..."}
              </p>
            </div>
            
            {!dailyInsight && (
              <Button 
                onClick={handleStartAnalysis} 
                isLoading={isAnalyzing}
                variant="outline"
                className="!bg-white !text-indigo-600 !border-none"
              >
                Derin Analizi Başlat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="flex items-center gap-4" hoverable>
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
            <Cloud size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hava Durumu</p>
            <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
              {weatherData?.condition || 'Açık'} <span className="text-sky-600">{weatherData?.temperature || '--'}°C</span>
            </h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4" hoverable>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harcama</p>
            <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
              ₺{totalExpenses.toLocaleString()}
            </h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4" hoverable>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${inventory.some(i => i.quantity < 10) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kritik Stok</p>
            <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
              {inventory.filter(i => i.quantity < 10).length} Ürün Azaldı
            </h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4" hoverable>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Son Aktivite</p>
            <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight truncate">
              {fieldOperations[0]?.method || 'Kayıt yok'}
            </h3>
          </div>
        </Card>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className={`flex flex-col justify-between ${isLoadingLands ? 'animate-pulse' : ''}`} hoverable>
          <div>
            <div className="flex items-center gap-2 mb-1 text-zinc-400">
              <MapIcon size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">Kayıtlı Arazi</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">{totalArea.toFixed(0)}</h1>
              <span className="text-zinc-500 font-bold text-lg">Dönüm</span>
            </div>
          </div>
          <Link href="/dashboard/lands">
            <Button variant="ghost" className="w-full mt-6" size="sm" leftIcon={<Plus size={18} />}>Yeni Arazi Ekle</Button>
          </Link>
        </Card>

        <Card className={`flex flex-col justify-between ${isLoadingTransactions ? 'animate-pulse' : ''}`} hoverable>
          <div>
            <div className="flex items-center gap-2 mb-1 text-zinc-400">
              <Activity size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">Maliyet Takibi</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-emerald-600">₺{costPerDonum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h1>
              <span className="text-zinc-500 font-bold text-lg">/ Dn</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
            {costPerDonum > 5000 ? <AlertTriangle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
            {costPerDonum > 5000 ? 'Maliyetler yüksek' : 'Maliyetler normal'}
          </p>
        </Card>

        <Card className={`flex flex-col justify-between ${isLoadingLands ? 'animate-pulse' : ''}`} hoverable>
          <div>
            <div className="flex items-center gap-2 mb-1 text-zinc-400">
              <TrendingUp size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">Beklenen Kar</p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-indigo-600">₺{projectedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h1>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Hasat Tahmini</span>
            <span className="text-emerald-500">+{((projectedProfit / (totalExpenses || 1)) * 100).toFixed(0)}% ROI</span>
          </div>
        </Card>

        <Card className="bg-emerald-600 text-white border-none flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
            <Sparkles size={100} />
          </div>
          <div className="flex items-center gap-2 mb-1 text-emerald-100">
            <Wallet size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">Orjut Tasarrufu</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">+₺{totalSavings.toLocaleString()}</h1>
          <p className="text-[11px] text-emerald-100 mt-2 font-bold uppercase tracking-wider">Verimlilik Kazancı</p>
        </Card>
      </div>

      <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">Hızlı Masraf Gir</h3>
        <BottomBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="none">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Son İşlemler</h2>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800 max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoadingTransactions ? (
              <ListSkeleton />
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12">
                <EmptyState message="İşlem bulunamadı." icon={Wallet} />
              </div>
            ) : (
              filteredTransactions.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between text-sm hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-xl">
                      {tx.description === 'Mazot' ? '⛽' : tx.description === 'Gübre' ? '🌱' : tx.description === 'İlaç' ? '🧪' : tx.description === 'Tohum' ? '🌾' : tx.description === 'İşçilik' ? '🧑‍🌾' : '📦'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{tx.description} - ₺{tx.amount.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">{tx.lands ? `Ada ${tx.lands.block_no}/Parsel ${tx.lands.parcel_no}` : 'Genel'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">{new Date(tx.date).toLocaleDateString('tr-TR')}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-indigo-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Dağılım</h2>
          </div>
          <CategoryPieChart data={categoryData} />
          <CategorySummaryBar totals={categoryTotals} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <div className="mt-6 space-y-4">
            {categoryData.map(cat => (
              <BudgetProgressBar key={cat.name} categoryName={cat.name} spent={cat.value} budget={cat.budget} color={cat.color} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
