'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/context/AppContext';
import { Map, MapPin, Trash2, Sprout, ChevronLeft, Save, Activity, Users, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

import EmptyState from '@/components/EmptyState';
import { CardSkeleton } from '@/components/Skeleton';
import InviteCollaborator from '@/components/collaborators/InviteCollaborator';
import { useMarketPrice } from '@/lib/useMarketPrice';
import MarketTrendMini from '@/components/market/MarketTrendMini';

const CROP_LIFECYCLES: Record<string, number> = {
  'Buğday': 240, 'Mısır': 120, 'Pirinç': 150, 'Soya Fasulyesi': 120, 'Pamuk': 160,
  'Arpa': 210, 'Patates': 100, 'Şeker Pancarı': 180, 'Şeker Kamışı': 365, 'Domates': 90,
  'Soğan': 120, 'Elma': 180, 'Üzüm': 170, 'Portakal': 270, 'Kahve': 270,
};

const DynamicLeafletMap = dynamic(() => import('@/components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Harita Yükleniyor...</div>
});

export default function LandsPage() {
  const { lands, totalArea, deleteLand, updateLand, isLoadingLands, transactions, currentUserRole } = useAppContext();
  const [selectedLand, setSelectedLand] = React.useState<any>(null);
  const [mapFocusLand, setMapFocusLand] = React.useState<any>(null);
  const [landToEdit, setLandToEdit] = React.useState<any>(null);
  const [deletingLand, setDeletingLand] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'details' | 'collaborators'>('details');
  
  // Filter States
  const [cropFilter, setCropFilter] = React.useState('all');
  const [envFilter, setEnvFilter] = React.useState('all');
  const [irrigationFilter, setIrrigationFilter] = React.useState('all');
  
  // States for edit
  const [editYield, setEditYield] = React.useState('');
  const [editPrice, setEditPrice] = React.useState('');

  const { currentPrice: marketPrice, history: marketHistory } = useMarketPrice(selectedLand?.crop_type);

  React.useEffect(() => {
    if (selectedLand) {
      setEditYield(selectedLand.expected_yield_per_decare || '');
      setEditPrice(selectedLand.expected_sell_price_unit || '');
    }
  }, [selectedLand]);

  const handleSaveMetrics = () => {
    if (!selectedLand) return;
    const updated = {
      ...selectedLand,
      expected_yield_per_decare: Number(editYield),
      expected_sell_price_unit: Number(editPrice)
    };
    updateLand(updated);
    setSelectedLand(updated);
  };

  const calculateDays = (plantingDate?: string): number | null => {
    if (!plantingDate) return null;
    try {
      // Parse as local date (YYYY-MM-DD) to avoid timezone issues
      const parts = plantingDate.split('-');
      if (parts.length !== 3) return null;
      const planted = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(planted.getTime())) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      planted.setHours(0, 0, 0, 0);
      
      const diffMs = today.getTime() - planted.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const filteredLands = lands.filter(land => {
    const matchesCrop = cropFilter === 'all' || land.crop_type === cropFilter;
    const matchesEnv = envFilter === 'all' || land.environment_type === envFilter;
    const matchesIrrigation = irrigationFilter === 'all' || (irrigationFilter === 'irrigated' ? land.is_irrigated : !land.is_irrigated);
    return matchesCrop && matchesEnv && matchesIrrigation;
  });

  const uniqueCrops = Array.from(new Set(lands.map(l => l.crop_type)));

  return (
    <div className="space-y-6 pb-48">
      
      {/* Header */}
      <header className="flex justify-between items-center bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Map size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Arazi Yönetimi</h1>
            <p className="text-zinc-500 font-medium text-sm">Toplam {totalArea.toFixed(0)} Dönüm Aktif Alan</p>
          </div>
        </div>
      </header>

      {/* Delete Land Modal */}
      {deletingLand && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="font-black text-xl mb-2 text-zinc-900">Araziyi Sil</h3>
            <p className="text-zinc-500 font-medium text-sm mb-6">
              Bu araziyi (Ada {deletingLand.block_no} / Parsel {deletingLand.parcel_no}) silmek istediğinize emin misiniz? Tüm bağlı işlemler ve metrikler de etkilenebilir. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingLand(null)} className="flex-1 py-3 font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">İptal</button>
              <button onClick={() => { deleteLand(deletingLand.id); setDeletingLand(null); }} className="flex-1 py-3 font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[calc(100vh-250px)]">
        
        {/* Left Side: Map */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px] lg:h-full">
          <div className="p-4 border-b border-zinc-100 bg-white">
            <h2 className="text-base font-bold text-zinc-900">Arazi İşaretleme</h2>
            <p className="text-sm text-zinc-500 font-medium">Tarlalarınızı eklemek için haritaya bir nokta bırakın.</p>
          </div>
          <div className="flex-1 w-full relative bg-zinc-100 z-0">
            <DynamicLeafletMap focusLand={mapFocusLand} editLand={landToEdit} />
          </div>
        </div>

        {/* Right Side: Data Table / List */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px] lg:h-full">
          <div className="p-4 border-b border-zinc-100 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Kayıtlı Parseller</h2>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{filteredLands.length} Sonuç</span>
            </div>
            
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
              <select 
                className="bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1.5 text-[11px] font-bold text-zinc-600 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                value={cropFilter}
                onChange={e => setCropFilter(e.target.value)}
              >
                <option value="all">Tüm Ürünler</option>
                {uniqueCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>

              <select 
                className="bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1.5 text-[11px] font-bold text-zinc-600 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                value={envFilter}
                onChange={e => setEnvFilter(e.target.value)}
              >
                <option value="all">Tüm Alanlar</option>
                <option value="acik_tarla">Açık Tarla</option>
                <option value="sera">Sera</option>
              </select>

              <select 
                className="bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1.5 text-[11px] font-bold text-zinc-600 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                value={irrigationFilter}
                onChange={e => setIrrigationFilter(e.target.value)}
              >
                <option value="all">Sulu/Kuru</option>
                <option value="irrigated">Sulu Tarım</option>
                <option value="dry">Kuru Tarım</option>
              </select>

              {(cropFilter !== 'all' || envFilter !== 'all' || irrigationFilter !== 'all') && (
                <button 
                  onClick={() => { setCropFilter('all'); setEnvFilter('all'); setIrrigationFilter('all'); }}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors px-2"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {selectedLand ? (
              <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setSelectedLand(null)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-bold"
                >
                  <ChevronLeft size={16} /> Listeye Dön
                </button>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">{selectedLand.district || selectedLand.city}</h3>
                    <p className="text-zinc-500 font-medium">Ada {selectedLand.block_no} / Parsel {selectedLand.parcel_no} • {selectedLand.crop_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl text-emerald-600">{selectedLand.size_decare}</div>
                    <div className="text-[10px] text-emerald-600/70 font-black uppercase tracking-widest">Dönüm</div>
                  </div>
                </div>

                <div className="flex border-b border-zinc-100 mb-4">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500'}`}
                  >
                    Detaylar
                  </button>
                  <button 
                    onClick={() => setActiveTab('collaborators')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'collaborators' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500'}`}
                  >
                    Kişiler
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                        <Activity size={18} /> Sezon Kârı Metrikleri
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Beklenen Verim (KG)</label>
                          <input 
                            type="number" 
                            value={editYield}
                            onChange={e => setEditYield(e.target.value)}
                            disabled={currentUserRole === 'viewer'}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-zinc-100 disabled:text-zinc-500"
                            placeholder="Örn: 18000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Birim Fiyat (₺)</span>
                            {marketPrice && (
                              <span 
                                onClick={() => { if (currentUserRole !== 'viewer') setEditPrice(marketPrice.toFixed(2)) }}
                                className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-100"
                                title="Piyasa Fiyatını Uygula"
                              >
                                📈 Piyasa: ₺{marketPrice.toFixed(2)}
                              </span>
                            )}
                          </label>
                          <input 
                            type="number" 
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            disabled={currentUserRole === 'viewer'}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-zinc-100 disabled:text-zinc-500"
                            placeholder="Örn: 35"
                          />
                          {marketHistory && marketHistory.length > 0 && (
                            <MarketTrendMini data={marketHistory} />
                          )}
                        </div>
                      </div>
                      {currentUserRole !== 'viewer' && (
                        <button 
                          onClick={handleSaveMetrics}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Save size={16} /> Metrikleri Kaydet
                        </button>
                      )}
                      
                      {/* Scroll Spacer */}
                      <div className="h-20"></div>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">Bu Araziye Yapılan İşlemler (Döküm)</h4>
                      <div className="space-y-2">
                        {transactions.filter(t => t.land_id === selectedLand.id).length > 0 ? (
                          transactions.filter(t => t.land_id === selectedLand.id).map(tx => (
                            <div key={tx.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">
                                  {tx.description === 'Mazot' ? '⛽' : tx.description === 'Gübre' ? '🌱' : tx.description === 'İlaç' ? '🧪' : tx.description === 'Tohum' ? '🌾' : tx.description === 'İşçilik' ? '🧑‍🌾' : '📦'}
                                </div>
                                <span className="font-bold text-zinc-800">{tx.description}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-rose-600">-₺{tx.amount.toLocaleString()}</div>
                                <div className="text-[10px] text-zinc-400 font-medium">{new Date(tx.date).toLocaleDateString('tr-TR')}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-6 bg-zinc-50 rounded-xl border border-zinc-100 border-dashed text-zinc-500 text-sm font-medium">
                            Bu arazi için henüz bir işlem kaydı bulunmuyor.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                      <Users size={18} /> Arazi Ortakları
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-zinc-100 rounded-xl bg-zinc-50">
                        <div className="font-medium text-zinc-900 text-sm">Siz</div>
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md uppercase">Sahip</div>
                      </div>
                    </div>
                    {currentUserRole === 'owner' && (
                      <InviteCollaborator landId={selectedLand.id} />
                    )}
                  </div>
                )}

              </div>
            ) : isLoadingLands ? (
              <div className="p-4 space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (!lands || lands.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <EmptyState 
                  message="Henüz arazi eklemediniz." 
                  icon={MapPin} 
                  buttonText="İlk Arazinizi Ekleyin"
                  onAction={() => {
                    toast.info("Arazinizi kaydetmek için lütfen harita üzerinde bir noktaya tıklayın.");
                  }}
                />
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredLands.map((land) => (
                  <div 
                    key={land.id} 
                    onClick={() => {
                      setMapFocusLand(land);
                    }}
                    className={`p-5 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer ${mapFocusLand?.id === land.id ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <Sprout size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{land.district || land.city}</h4>
                        <p className="text-xs text-zinc-500 font-medium mb-2">
                          Ada {land.block_no} / Parsel {land.parcel_no} • {land.crop_type}
                        </p>
                        {(() => {
                          const days = calculateDays(land.planting_date);
                          const totalDays = CROP_LIFECYCLES[land.crop_type] || 150;
                          
                          if (days === null) {
                            return (
                              <p className="text-[10px] text-zinc-400 font-medium mt-1">Ekim tarihi girilmedi</p>
                            );
                          }
                          
                          if (days < 0) {
                            return (
                              <div className="mt-1">
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  ⏳ Ekim bekleniyor ({Math.abs(days)} gün sonra)
                                </span>
                              </div>
                            );
                          }
                          
                          const percentage = Math.min(100, (days / totalDays) * 100);
                          const isHarvested = days >= totalDays;
                          
                          return (
                            <div className="w-48 mt-1">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                                <span className={isHarvested ? 'text-amber-700' : 'text-emerald-700'}>
                                  {isHarvested ? `🌾 Hasat zamanı!` : `${days}. Gün / ${totalDays}`}
                                </span>
                              </div>
                              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${isHarvested ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="font-black text-xl text-zinc-900 tracking-tighter">{land.size_decare}</div>
                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Dönüm</div>
                      </div>
                      
                      {currentUserRole !== 'viewer' && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLand(land);
                              setLandToEdit(land);
                            }}
                            className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Düzenle"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLand(land);
                            }}
                            className="p-2.5 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
