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

export default function DashboardPage() {
  const { totalExpenses, totalArea, dailyInsight, criticalAlert, totalSavings, requestWeatherAndInsight, weather, transactions, isLoadingTransactions, isLoadingLands, lands, activeSeason, weatherData, inventory, scoutingLogs, fieldOperations } = useAppContext();
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  
  const [widgetPrefs, setWidgetPrefs] = React.useState({
    weather: true,
    finance: true,
    stock: true,
    recent: true
  });
  const [showCustomize, setShowCustomize] = React.useState(false);

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
      {/* Welcome Section with Glass Effect */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex gap-2">
          {activeSeason && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              Aktif Sezon: {activeSeason.name}
            </span>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <Settings2 size={14} />
            Görünümü Özelleştir
            <ChevronDown size={14} className={`transition-transform ${showCustomize ? 'rotate-180' : ''}`} />
          </button>
          
          {showCustomize && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 px-2">Widget Görünümü</p>
              <div className="space-y-1">
                {[
                  { id: 'weather', label: 'Hava Durumu Özet', icon: <Cloud size={14} /> },
                  { id: 'finance', label: 'Finansal Genel Bakış', icon: <Wallet size={14} /> },
                  { id: 'stock', label: 'Kritik Stok Uyarıları', icon: <AlertTriangle size={14} /> },
                  { id: 'recent', label: 'Son Aktiviteler', icon: <Activity size={14} /> },
                ].map(w => (
                  <button 
                    key={w.id}
                    onClick={() => toggleWidget(w.id as any)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 group-hover:text-indigo-500 transition-colors">{w.icon}</span>
                      <span className="text-xs font-bold text-zinc-700">{w.label}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-all relative ${widgetPrefs[w.id as keyof typeof widgetPrefs] ? 'bg-indigo-600' : 'bg-zinc-200'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${widgetPrefs[w.id as keyof typeof widgetPrefs] ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgetPrefs.weather && (
          <div className="bg-white border border-zinc-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
              <Cloud size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hava Durumu</p>
              <h3 className="font-black text-zinc-800 leading-tight">
                {lands[0]?.city || 'Kızıltepe'} - {weatherData?.condition || 'Açık'}
                <span className="block text-sky-600">{weatherData?.temperature || weather.temp || '--'}°C</span>
              </h3>
            </div>
          </div>
        )}

        {widgetPrefs.finance && (
          <div className="bg-white border border-zinc-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Finansal Özet</p>
              <h3 className="font-black text-zinc-800 leading-tight">
                Toplam Harcama
                <span className="block text-indigo-600">₺{totalExpenses.toLocaleString()}</span>
              </h3>
            </div>
          </div>
        )}

        {widgetPrefs.stock && (
          <div className="bg-white border border-zinc-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${inventory.filter(i => i.quantity < 10).length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kritik Stok</p>
              <h3 className="font-black text-zinc-800 leading-tight">
                {inventory.filter(i => i.quantity < 10).length} Ürün Azaldı
                <span className={`block ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
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

      {/* 1. Today's Action Plan (Hero Section) */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-100 transition-all hover:shadow-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-indigo-200" />
          <h2 className="font-bold text-lg tracking-tight">Günün Aksiyon Planı</h2>
        </div>
        
        {dailyInsight ? (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-4 text-xs font-bold text-white/70 mb-3 uppercase tracking-widest">
              <span className="flex items-center gap-1">🌡️ {weatherData?.temperature || weather.temp || '--'}°C</span>
              <span className="flex items-center gap-1">💧 {weatherData?.humidity || '--'}%</span>
              <span className="flex items-center gap-1">🌧️ {weatherData?.rainfall || '--'}mm</span>
              <span className="flex items-center gap-1">💨 {weatherData?.windSpeed || weather.windspeed || '--'}km/h</span>
            </div>
            <p className="text-indigo-50 text-lg leading-relaxed font-medium">
              &quot;{dailyInsight}&quot;
            </p>
            {criticalAlert && (
              <div className="bg-rose-500/20 border border-rose-400 text-white px-4 py-3 rounded-xl flex items-start gap-3">
                <span className="text-2xl leading-none">⚠️</span>
                <p className="font-medium text-rose-50">{criticalAlert}</p>
              </div>
            )}
          </div>
        ) : weather.loading ? (
          <p className="text-indigo-200 animate-pulse">Hava durumu verileri analiz ediliyor...</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-indigo-200 text-sm">Yerel hava durumuna göre günlük operasyonel tavsiyenizi alın.</p>
            <button 
              onClick={requestWeatherAndInsight}
              className="px-5 py-2.5 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-all shadow-lg active:scale-95 shrink-0"
            >
              Bugünü Analiz Et
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 2. Total Active Lands Stat Card */}
        <div className={`bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:border-zinc-200 ${isLoadingLands ? 'animate-pulse' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapIcon size={16} className="text-zinc-400" />
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Kayıtlı Arazi</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900">
                {totalArea.toFixed(0)}
              </h1>
              <span className="text-zinc-500 font-medium text-lg">Dönüm</span>
            </div>
          </div>
          
          <Link href="/dashboard/lands" className="mt-6 w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>Yeni Arazi Ekle</span>
          </Link>
        </div>

        {/* 3. Cost Shock Metric */}
        <div className={`bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:border-zinc-200 ${isLoadingTransactions ? 'animate-pulse' : ''}`}>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Maliyet Takibi (₺ / Dönüm)</p>
            <div className="flex items-baseline gap-2">
              <h1 className={`text-4xl font-black tracking-tighter text-emerald-600`}>
                ₺{costPerDonum.toFixed(0)}
              </h1>
            </div>
          </div>
        </div>

        {/* 4. Projected Profit */}
        <div className={`bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:border-zinc-200 ${isLoadingLands ? 'animate-pulse' : ''}`}>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Tahmini Sezon Kârı</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tighter text-indigo-600">
                ₺{projectedProfit.toLocaleString()}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-xl border text-sm bg-indigo-50 border-indigo-100 text-indigo-700">
            <Sparkles size={16} />
            <span className="font-bold">Projelendirilen</span>
          </div>
        </div>

        {/* 5. Savings Counter */}
        <div className={`bg-emerald-600 text-white border-2 border-emerald-500 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-emerald-100 ${isLoadingTransactions ? 'animate-pulse' : ''}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={64} />
          </div>
          <p className="text-sm font-bold text-emerald-200 uppercase tracking-wider mb-1">Orjut Tasarrufu</p>
          <div className="flex items-baseline gap-2 z-10">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              +₺{totalSavings.toLocaleString()}
            </h1>
          </div>
          <p className="text-sm text-emerald-100 mt-2 z-10 font-medium">Önlenen tahmini zararlar.</p>
        </div>
      </div>

      {/* 5. Zero-Friction Entry */}
      <div className="pt-8 border-t border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">Hızlı Masraf Gir</h3>
        <BottomBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-zinc-200 lg:col-span-2">
          <div className="p-5 border-b border-zinc-100 bg-white">
            <h2 className="text-base font-bold text-zinc-900">Son İşlemler</h2>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[400px] overflow-y-auto">
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
