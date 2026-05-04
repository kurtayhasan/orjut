'use client';

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import BottomBar from '@/components/BottomBar';
import { Sparkles, TrendingDown, TrendingUp, Plus, Map as MapIcon, Wallet, PieChart, Cloud, Activity, AlertTriangle, Settings2, CheckCircle2, ChevronDown, Droplets, ClipboardCheck } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeleton';
import CategoryPieChart from '@/components/budget/CategoryPieChart';
import CategorySummaryBar from '@/components/budget/CategorySummaryBar';
import { useCategoryTotals } from '@/hooks/useCategoryTotals';
import BudgetProgressBar from '@/components/budget/BudgetProgressBar';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { totalExpenses, totalArea, dailyInsight, criticalAlert, totalSavings, requestWeatherAndInsight, weather, transactions, isLoadingTransactions, isLoadingLands, lands, activeSeason, weatherData, inventory, scoutingLogs, fieldOperations, userProfile } = useAppContext();
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  
  const [widgetPrefs, setWidgetPrefs] = React.useState({
    weather: true,
    finance: true,
    stock: true,
    recent: true
  });
  const [showCustomize, setShowCustomize] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<any>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('dashboard_widget_prefs');
    if (saved) setWidgetPrefs(JSON.parse(saved));
  }, []);

  const toggleWidget = (key: keyof typeof widgetPrefs) => {
    const newPrefs = { ...widgetPrefs, [key]: !widgetPrefs[key] };
    setWidgetPrefs(newPrefs);
    localStorage.setItem('dashboard_widget_prefs', JSON.stringify(newPrefs));
  };

  const categoryTotals = useCategoryTotals(transactions);

  const filteredTransactions = React.useMemo(() => {
    return activeFilter 
      ? transactions.filter(t => t.description === activeFilter)
      : transactions;
  }, [activeFilter, transactions]);
  
  // Cost Metric Logic (Memoized)
  const costPerDonum = React.useMemo(() => totalArea > 0 ? totalExpenses / totalArea : 0, [totalArea, totalExpenses]);

  // Projected Profit Logic (Memoized)
  const projectedRevenue = React.useMemo(() => lands.reduce((sum, land) => {
    const yieldAmt = Number(land.expected_yield_per_decare) || 0;
    const price = Number(land.expected_sell_price_unit) || 0;
    return sum + (yieldAmt * price);
  }, 0), [lands]);
  
  const projectedProfit = React.useMemo(() => projectedRevenue > 0 ? projectedRevenue - totalExpenses : 0, [projectedRevenue, totalExpenses]);

  // Category & Budget Data (Memoized)
  const categoryData = React.useMemo(() => {
    return [
      { name: 'Mazot', value: transactions.filter(t => t.description === 'Mazot').reduce((s, t) => s + t.amount, 0), color: '#F97316', budget: 0 },
      { name: 'Gübre', value: transactions.filter(t => t.description === 'Gübre').reduce((s, t) => s + t.amount, 0), color: '#22C55E', budget: 0 },
      { name: 'İlaç', value: transactions.filter(t => t.description === 'İlaç').reduce((s, t) => s + t.amount, 0), color: '#14B8A6', budget: 0 },
      { name: 'Tohum', value: transactions.filter(t => t.description === 'Tohum').reduce((s, t) => s + t.amount, 0), color: '#EF4444', budget: 0 },
      { name: 'İşçilik', value: transactions.filter(t => t.description === 'İşçilik').reduce((s, t) => s + t.amount, 0), color: '#3B82F6', budget: 0 },
      { name: 'Diğer', value: transactions.filter(t => !['Mazot', 'Gübre', 'İlaç', 'Tohum', 'İşçilik'].includes(t.description)).reduce((s, t) => s + t.amount, 0), color: '#94A3B8', budget: 0 }
    ];
  }, [transactions]);

  return (
    <div className="space-y-6 pb-48">
      {/* AI Daily Insight Widget */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white rounded-[2rem] p-6 shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden relative group transition-all duration-500 hover:shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
          <Sparkles size={140} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="font-black text-lg tracking-tight uppercase">Günün Zirai Özeti</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4 text-xs font-black text-indigo-100/80 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                  📍 {lands[0]?.city || 'Kızıltepe'}, {lands[0]?.district || 'Mardin'}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                  🌡️ {weatherData?.temperature || 35}°C, {weatherData?.condition || 'Açık'}
                </span>
              </div>
              <p className="text-white text-xl md:text-2xl font-bold leading-tight">
                {dailyInsight || "Sıcaklıklar mevsim normallerinin üzerinde seyrediyor. Mısır arazilerinizde sulama periyodunu sıklaştırmanız, buharlaşma kaybını önlemek için gece sulamasını tercih etmeniz önerilir."}
              </p>
            </div>
            
            {!dailyInsight && (
              <button 
                onClick={async () => {
                  if (!userProfile?.is_premium) {
                    toast.error("Yapay Zeka Analizi sadece Premium üyeler içindir.", {
                      description: "Verilerinizi profesyonel bir ziraat mühendisi gibi analiz ettirmek için yükseltin.",
                      action: { label: "Yükselt", onClick: () => window.location.href = '/settings/billing' }
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
                    } else {
                      throw new Error(data.error);
                    }
                  } catch (err: any) {
                    toast.error("Hata: " + err.message);
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                disabled={isAnalyzing}
                className="bg-white text-indigo-600 font-black px-6 py-3 rounded-2xl text-sm hover:bg-indigo-50 transition-all shadow-lg active:scale-95 shrink-0 whitespace-nowrap flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Derin Analizi Başlat
                  </>
                )}
              </button>
            )}
          </div>
          
          {aiResult && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Risk Durumu</p>
                <p className="font-bold text-sm">{aiResult.risk}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Önerilen Aksiyon</p>
                <p className="font-bold text-sm">{aiResult.action}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Aciliyet</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${aiResult.urgency === 'yüksek' ? 'bg-rose-500 text-white' : aiResult.urgency === 'orta' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {aiResult.urgency}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgetPrefs.weather && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
              <Cloud size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Hava Durumu</p>
              <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
                {lands[0]?.city || 'Kızıltepe'} - {weatherData?.condition || 'Açık'}
                <span className="block text-sky-600 dark:text-sky-400">{weatherData?.temperature || weather.temp || '--'}°C</span>
              </h3>
            </div>
          </div>
        )}

        {widgetPrefs.finance && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Finansal Özet</p>
              <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
                Toplam Harcama
                <span className="block text-indigo-600 dark:text-indigo-400">₺{totalExpenses.toLocaleString()}</span>
              </h3>
            </div>
          </div>
        )}

        {widgetPrefs.stock && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${inventory.filter(i => i.quantity < 10).length > 0 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Kritik Stok</p>
              <h3 className="font-black text-zinc-800 dark:text-zinc-100 leading-tight">
                {inventory.filter(i => i.quantity < 10).length} Ürün Azaldı
                <span className={`block ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {inventory.filter(i => i.quantity < 10).length > 0 ? 'Hemen Sipariş Ver' : 'Stoklar Yeterli'}
                </span>
              </h3>
            </div>
          </div>
        )}

        {widgetPrefs.recent && (
          <div className="bg-white border border-zinc-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Son Aktivite</p>
              <h3 className="font-black text-zinc-800 leading-tight truncate max-w-[120px]">
                {fieldOperations[0]?.method || scoutingLogs[0]?.notes || 'Kayıt yok'}
                <span className="block text-amber-600">
                  {fieldOperations[0] ? new Date(fieldOperations[0].date).toLocaleDateString('tr-TR') : 'Bugün'}
                </span>
              </h3>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30 ${isLoadingLands ? 'animate-pulse' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapIcon size={16} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kayıtlı Arazi</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                {totalArea.toFixed(0)}
              </h1>
              <span className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Dönüm</span>
            </div>
          </div>
          
          <Link href="/dashboard/lands" className="mt-6 w-full py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
            <Plus size={18} />
            <span>Yeni Arazi Ekle</span>
          </Link>
        </div>

        {/* 3. Cost Shock Metric */}
        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30 ${isLoadingTransactions ? 'animate-pulse' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Maliyet Takibi</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className={`text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400`}>
                ₺{costPerDonum.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </h1>
              <span className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">/ Dn</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            {costPerDonum > 5000 ? <AlertTriangle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
            {costPerDonum > 5000 ? 'Maliyetler hedefin üzerinde' : 'Maliyetler kontrol altında'}
          </p>
        </div>

        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30 ${isLoadingLands ? 'animate-pulse' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Beklenen Kar</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">
                ₺{projectedProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hasat Tahmini</span>
            <span className="text-emerald-500 font-black text-xs">+{((projectedProfit / (totalExpenses || 1)) * 100).toFixed(0)}% ROI</span>
          </div>
        </div>

        <div className={`bg-emerald-600 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center relative overflow-hidden transition-all hover:border-emerald-500/40 ${isLoadingTransactions ? 'animate-pulse' : ''}`}>
          <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
            <Sparkles size={100} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-emerald-700 dark:text-emerald-400" />
            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Orjut Tasarrufu</p>
          </div>
          <div className="flex items-baseline gap-2 z-10">
            <h1 className="text-4xl font-black tracking-tighter text-emerald-700 dark:text-emerald-400">
              +₺{totalSavings.toLocaleString()}
            </h1>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2 z-10 font-bold uppercase tracking-wider">Verimlilik Kazancı</p>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-6">Hızlı Masraf Gir</h3>
        <BottomBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-zinc-200 dark:hover:border-zinc-700 lg:col-span-2">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Son İşlemler</h2>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
            {isLoadingTransactions ? (
              <ListSkeleton />
            ) : (!filteredTransactions || filteredTransactions.length === 0) ? (
              <div className="p-12">
                <EmptyState message={activeFilter ? `${activeFilter} kategorisinde işlem bulunamadı.` : "Henüz bir işlem yapılmadı."} icon={Wallet} />
              </div>
            ) : (
              filteredTransactions.map((tx: any) => (
                <div key={tx.id} className={`p-4 flex items-center justify-between text-sm transition-colors hover:bg-zinc-50 group ${tx.isPending ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-50 flex items-center justify-center text-xl group-hover:bg-white transition-colors">
                      {tx.description === 'Mazot' ? '⛽' : tx.description === 'Gübre' ? '🌱' : tx.description === 'İlaç' ? '🧪' : tx.description === 'Tohum' ? '🌾' : tx.description === 'İşçilik' ? '🧑‍🌾' : '📦'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 flex items-center gap-1">
                        {tx.description} - ₺{tx.amount.toLocaleString()}
                        {tx.isPending && <span title="Eşitlenmeyi bekliyor" className="text-xs">⏳</span>}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tx.lands ? `(Ada ${tx.lands.block_no}/Parsel ${tx.lands.parcel_no})` : 'Arazi belirtilmedi'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    {(tx.receipt_url && tx.receipt_url !== 'offline-pending') || tx.receipt_thumbnail_url ? (
                      <div className="hidden sm:block w-8 h-8 rounded-md overflow-hidden border border-zinc-200 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={tx.receipt_thumbnail_url || tx.receipt_url} 
                          alt="Makbuz" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : null}
                    <div className="text-right text-xs text-zinc-400 font-medium w-20">
                      {new Date(tx.date).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget Status */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-zinc-200 lg:col-span-1 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-indigo-600" />
            <h2 className="text-base font-bold text-zinc-900">Harcama Dağılımı</h2>
          </div>
          <CategoryPieChart data={categoryData} />
          <CategorySummaryBar 
            totals={categoryTotals}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <div className="mt-6 space-y-4">
            {categoryData.map(cat => (
              <BudgetProgressBar 
                key={cat.name} 
                categoryName={cat.name} 
                spent={cat.value} 
                budget={cat.budget} 
                color={cat.color} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
