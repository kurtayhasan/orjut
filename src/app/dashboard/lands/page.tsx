'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/context/AppContext';
import { Map, MapPin, Trash2, Sprout, ChevronLeft, Save, Activity, Users, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

import EmptyState from '@/components/EmptyState';
import { CardSkeleton } from '@/components/Skeleton';
import InviteCollaborator from '@/components/collaborators/InviteCollaborator';
import { useMarketPrice } from '@/lib/useMarketPrice';
import MarketTrendMini from '@/components/market/MarketTrendMini';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import LandMovementsModal from '@/components/lands/LandMovementsModal';

const CROP_LIFECYCLES: Record<string, number> = {
  'Buğday': 240, 'Mısır': 120, 'Pirinç': 150, 'Soya Fasulyesi': 120, 'Pamuk': 160,
  'Arpa': 210, 'Patates': 100, 'Şeker Pancarı': 180, 'Şeker Kamışı': 365, 'Domates': 90,
  'Soğan': 120, 'Elma': 180, 'Üzüm': 170, 'Portakal': 270, 'Kahve': 270,
};

const DynamicLeafletMap = dynamic(() => import('@/components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 font-bold">Harita Yükleniyor...</div>
});

export default function LandsPage() {
  const { lands, totalArea, deleteLand, updateLand, isLoadingLands, transactions, currentUserRole } = useAppContext();
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [mapFocusLand, setMapFocusLand] = useState<any>(null);
  const [landToEdit, setLandToEdit] = useState<any>(null);
  const [deletingLand, setDeletingLand] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'collaborators'>('details');
  
  const [cropFilter, setCropFilter] = useState('all');
  const [envFilter, setEnvFilter] = useState('all');
  const [irrigationFilter, setIrrigationFilter] = useState('all');
  
  const [editYield, setEditYield] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [movementLand, setMovementLand] = useState<any>(null);

  const { currentPrice: marketPrice, history: marketHistory } = useMarketPrice(selectedLand?.crop_type);

  useEffect(() => {
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
      const parts = plantingDate.split('-');
      const planted = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      planted.setHours(0, 0, 0, 0);
      return Math.floor((today.getTime() - planted.getTime()) / 86400000);
    } catch { return null; }
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
      
      <Card padding="md" className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Map size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Arazi Yönetimi</h1>
            <p className="text-zinc-500 font-bold text-sm">Toplam {totalArea.toFixed(0)} Dönüm Aktif Alan</p>
          </div>
        </div>
      </Card>

      <BaseModal 
        isOpen={!!deletingLand} 
        onClose={() => setDeletingLand(null)}
        title="Araziyi Sil"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} />
          </div>
          <p className="text-zinc-500 font-bold text-sm mb-8">
            Bu araziyi (Ada {deletingLand?.block_no} / Parsel {deletingLand?.parcel_no}) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setDeletingLand(null)} className="flex-1">İptal</Button>
            <Button variant="danger" onClick={() => { deleteLand(deletingLand.id); setDeletingLand(null); }} className="flex-1">Evet, Sil</Button>
          </div>
        </div>
      </BaseModal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[calc(100vh-250px)]">
        
        <Card padding="none" className="flex flex-col h-[400px] lg:h-full overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Arazi İşaretleme</h2>
            <p className="text-sm text-zinc-500 font-medium">Tarlalarınızı eklemek için haritaya bir nokta bırakın.</p>
          </div>
          <div className="flex-1 w-full relative bg-zinc-100 z-0">
            <DynamicLeafletMap focusLand={mapFocusLand} editLand={landToEdit} />
          </div>
        </Card>

        <Card padding="none" className="flex flex-col h-[500px] lg:h-full overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Kayıtlı Parseller</h2>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{filteredLands.length} Sonuç</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Input as="select" value={cropFilter} onChange={(e: any) => setCropFilter(e.target.value)} className="!py-1.5 !text-[11px] !px-3 w-auto">
                <option value="all">Tüm Ürünler</option>
                {uniqueCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
              </Input>
              <Input as="select" value={envFilter} onChange={(e: any) => setEnvFilter(e.target.value)} className="!py-1.5 !text-[11px] !px-3 w-auto">
                <option value="all">Tüm Alanlar</option>
                <option value="acik_tarla">Açık Tarla</option>
                <option value="sera">Sera</option>
              </Input>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedLand ? (
              <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                <Button variant="ghost" onClick={() => setSelectedLand(null)} size="sm" leftIcon={<ChevronLeft size={16} />}>Listeye Dön</Button>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{selectedLand.district || selectedLand.city}</h3>
                    <p className="text-zinc-500 font-bold">Ada {selectedLand.block_no} / Parsel {selectedLand.parcel_no}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl text-emerald-600">{selectedLand.size_decare}</div>
                    <div className="text-[10px] text-emerald-600/70 font-black uppercase tracking-widest">Dönüm</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="!bg-indigo-50 dark:!bg-indigo-900/10 !border-indigo-100 dark:!border-indigo-900/30" padding="md">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-4">
                      <Activity size={18} /> Beklenen Verim & Fiyat
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Input label="Beklenen Verim (KG)" type="number" value={editYield} onChange={(e: any) => setEditYield(e.target.value)} disabled={currentUserRole === 'viewer'} />
                      <Input label="Birim Fiyat (₺)" type="number" value={editPrice} onChange={(e: any) => setEditPrice(e.target.value)} disabled={currentUserRole === 'viewer'} />
                    </div>
                    {currentUserRole !== 'viewer' && <Button onClick={handleSaveMetrics} className="w-full" size="sm">Kaydet</Button>}
                  </Card>

                  <div>
                    <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest mb-3">Son İşlemler</h4>
                    <div className="space-y-2">
                      {transactions.filter(t => t.land_id === selectedLand.id).map(tx => (
                        <div key={tx.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-between text-sm">
                          <span className="font-bold">{tx.description}</span>
                          <span className="font-black text-rose-600">-₺{tx.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : isLoadingLands ? (
              <div className="p-4 space-y-4"><CardSkeleton /><CardSkeleton /></div>
            ) : lands.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <EmptyState message="Henüz arazi eklemediniz." icon={MapPin} />
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredLands.map((land) => (
                  <div key={land.id} onClick={() => setMapFocusLand(land)} className={`p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between cursor-pointer ${mapFocusLand?.id === land.id ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl"><Sprout size={20} /></div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{land.district || land.city}</h4>
                        <p className="text-xs text-zinc-500 font-bold">Ada {land.block_no} / Parsel {land.parcel_no} • {land.crop_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tighter">{land.size_decare}</div>
                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Dönüm</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="!p-2 text-indigo-500" onClick={(e) => { e.stopPropagation(); setMovementLand(land); }}>
                          <Activity size={18} />
                        </Button>
                        {currentUserRole !== 'viewer' && (
                          <>
                            <Button variant="ghost" size="sm" className="!p-2" onClick={(e) => { e.stopPropagation(); setSelectedLand(land); setLandToEdit(land); }}><Edit2 size={16} /></Button>
                            <Button variant="ghost" size="sm" className="!p-2 !text-rose-500" onClick={(e) => { e.stopPropagation(); setDeletingLand(land); }}><Trash2 size={16} /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <LandMovementsModal 
        isOpen={!!movementLand} 
        onClose={() => setMovementLand(null)} 
        land={movementLand} 
        transactions={transactions} 
      />
    </div>
  );
}
