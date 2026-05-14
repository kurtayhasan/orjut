'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  Box, Sprout, TrendingUp, Calendar, 
  MapPin, ChevronRight, Activity, ArrowUpRight, 
  BarChart3, Plus, Trash2, Package, Filter, 
  AlertTriangle, Grid, List, Warehouse,
  ShoppingBag, Droplet
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import { cn, formatDateShort } from '@/lib/utils';

const CROP_LIFECYCLES: Record<string, number> = {
  'Mısır': 120, 'Buğday': 240, 'Arpa': 210, 'Pamuk': 160, 'Şeker Pancarı': 180, 'Ayçiçeği': 130, 'Domates': 90
};

export default function InventoryPage() {
  const { lands, inventory, addInventoryItem, deleteInventoryItem, isLoadingInventory } = useAppContext();
  const [view, setView] = useState<'crops' | 'inputs'>('crops');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Item State
  const [name, setName] = useState('');
  const [type, setType] = useState<'fertilizer' | 'pesticide' | 'seed' | 'fuel' | 'other'>('fertilizer');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  const calculateDays = (plantingDate?: string) => {
    if (!plantingDate) return null;
    const diff = new Date().getTime() - new Date(plantingDate).getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days >= 0 ? days : 0;
  };

  const getProgress = (crop: string, plantingDate?: string) => {
    const days = calculateDays(plantingDate);
    if (days === null) return 0;
    const cycle = CROP_LIFECYCLES[crop] || 150;
    return Math.min(100, (days / cycle) * 100);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unit) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    await addInventoryItem({ item_name: name, type, quantity: Number(quantity), unit });
    setName(''); setQuantity(''); setUnit('kg'); setIsAddModalOpen(false);
    toast.success("Stok başarıyla eklendi.");
  };

  const totalExpectedYield = lands.reduce((sum, l) => sum + (l.expected_yield_per_decare || 0) * (l.size_decare || 0), 0);
  const lowStockItems = inventory.filter(i => i.quantity < 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary-100 p-3 rounded-xl text-primary">
            <Warehouse size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Depo & Envanter</h1>
            <p className="text-text-muted font-bold text-sm">Girdi stoklarınızı ve ürün gelişimini izleyin.</p>
          </div>
        </div>
        <div className="flex bg-surface-2 p-1 rounded-lg border border-border w-full md:w-auto">
          <button 
            onClick={() => setView('crops')}
            className={cn(
              "flex-1 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
              view === 'crops' ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Ürün Gelişimi
          </button>
          <button 
            onClick={() => setView('inputs')}
            className={cn(
              "flex-1 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
              view === 'inputs' ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            Girdi Stokları
          </button>
        </div>
      </div>

      {view === 'crops' ? (
        <>
          {/* STATS FOR CROPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md" className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Beklenen Toplam Hasat</span>
              <div className="text-2xl font-black font-heading text-text-primary">{(totalExpectedYield / 1000).toFixed(1)} <span className="text-sm font-bold text-text-muted">Ton</span></div>
            </Card>
            <Card padding="md" className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Ortalama Gelişim</span>
              <div className="text-2xl font-black font-heading text-primary">
                {lands.length > 0 ? (lands.reduce((sum, l) => sum + getProgress(l.crop_type, l.planting_date), 0) / lands.length).toFixed(0) : 0}%
              </div>
            </Card>
            <Card padding="md" className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Hasada Kalan</span>
              <div className="text-2xl font-black font-heading text-amber-600">
                {lands.length > 0 ? Math.max(0, Math.floor(lands.reduce((sum, l) => sum + (CROP_LIFECYCLES[l.crop_type] || 150) - (calculateDays(l.planting_date) || 0), 0) / lands.length)) : 0} <span className="text-sm font-bold text-text-muted">Gün</span>
              </div>
            </Card>
            <Card padding="md" className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Aktif Parsel</span>
              <div className="text-2xl font-black font-heading text-text-primary">{lands.length}</div>
            </Card>
          </div>

          {/* CROP PROGRESS LIST */}
          <Card padding="none" className="overflow-hidden">
             <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
                <h3 className="text-sm font-black font-heading text-text-primary uppercase tracking-tight">Parsel Bazlı Gelişim</h3>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sıralama: En Yakın Hasat</span>
             </div>
             <div className="divide-y divide-border">
                {lands.length > 0 ? (
                  lands.map((land) => (
                    <div key={land.id} className="p-6 hover:bg-surface-2 transition-all flex flex-col md:flex-row gap-6 md:items-center">
                       <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary shadow-sm">
                             <Sprout size={24} />
                          </div>
                          <div>
                             <h4 className="font-bold text-text-primary leading-none mb-1">{land.district || land.city}</h4>
                             <p className="text-xs font-bold text-text-muted">Ada {land.block_no} / P. {land.parcel_no}</p>
                             <span className="inline-block mt-2 px-2 py-0.5 bg-surface-3 rounded text-[9px] font-black text-text-primary uppercase">{land.crop_type}</span>
                          </div>
                       </div>

                       <div className="flex-1">
                          <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Yaşam Döngüsü</span>
                             <span className="text-sm font-black text-primary">{getProgress(land.crop_type, land.planting_date).toFixed(0)}%</span>
                          </div>
                          <div className="h-3 w-full bg-surface-2 rounded-full overflow-hidden border border-border shadow-inner">
                             <div 
                               className="h-full bg-primary rounded-full transition-all duration-1000" 
                               style={{ width: `${getProgress(land.crop_type, land.planting_date)}%` }}
                             />
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] font-bold text-text-muted uppercase">
                             <span>Ekim: {formatDateShort(land.planting_date || '')}</span>
                             <span>Hasat: {formatDateShort(new Date(new Date(land.planting_date || '').getTime() + (CROP_LIFECYCLES[land.crop_type] || 150) * 86400000).toISOString())}</span>
                          </div>
                       </div>

                       <div className="text-right min-w-[150px]">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Beklenen Verim</p>
                          <div className="text-xl font-black font-heading text-text-primary">
                             {((land.expected_yield_per_decare || 0) * (land.size_decare || 0) / 1000).toFixed(1)} <span className="text-sm">Ton</span>
                          </div>
                          <div className="text-[10px] text-success font-black flex items-center justify-end gap-1 mt-1 uppercase tracking-widest">
                             <Activity size={12} /> {land.expected_yield_per_decare} kg/dönüm
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="Veri Bulunamadı" description="Takip için önce arazi eklemelisiniz." emoji="🌾" />
                )}
             </div>
          </Card>
        </>
      ) : (
        <>
          {/* INPUT STOCK VIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* STOCKS LIST */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-base font-black font-heading text-text-primary uppercase tracking-tight">Mevcut Stoklar</h3>
                 <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsAddModalOpen(true)}>Yeni Stok Ekle</Button>
              </div>
              <Card padding="none" className="overflow-hidden">
                 <div className="divide-y divide-border">
                    {inventory.length > 0 ? (
                      inventory.map(item => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-border",
                                item.quantity < 10 ? "bg-danger-bg" : "bg-surface-2"
                              )}>
                                 {item.type === 'fertilizer' ? '🌱' : item.type === 'pesticide' ? '🧪' : item.type === 'seed' ? '🌾' : item.type === 'fuel' ? '⛽' : '📦'}
                              </div>
                              <div>
                                 <h4 className="font-bold text-text-primary leading-tight">{item.item_name}</h4>
                                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    {item.type === 'fertilizer' ? 'Gübre' : item.type === 'pesticide' ? 'İlaç' : item.type === 'seed' ? 'Tohum' : item.type === 'fuel' ? 'Yakıt' : 'Diğer'}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <div className={cn(
                                   "text-xl font-black font-heading tracking-tight",
                                   item.quantity < 10 ? "text-danger" : "text-text-primary"
                                 )}>
                                    {item.quantity}
                                 </div>
                                 <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.unit}</div>
                              </div>
                              <button onClick={() => deleteInventoryItem(item.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100">
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState title="Stok yok" description="Deponuzdaki ürünleri buraya ekleyerek takip edin." emoji="📦" />
                    )}
                 </div>
              </Card>
            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="lg:col-span-4 space-y-6">
               {/* Low Stock Alert */}
               {lowStockItems.length > 0 && (
                 <Card className="bg-danger-bg border-danger/20" padding="md">
                    <div className="flex items-center gap-2 text-danger mb-3">
                       <AlertTriangle size={20} />
                       <h4 className="text-sm font-black font-heading uppercase tracking-tight">Kritik Stok Uyarısı</h4>
                    </div>
                    <div className="space-y-2">
                       {lowStockItems.map(item => (
                         <div key={item.id} className="flex justify-between items-center text-xs font-bold text-text-primary">
                            <span>{item.item_name}</span>
                            <span className="text-danger">{item.quantity} {item.unit}</span>
                         </div>
                       ))}
                    </div>
                    <Button variant="danger" size="sm" fullWidth className="mt-4">Tedarik Listesi Oluştur</Button>
                 </Card>
               )}

               <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <ShoppingBag size={20} className="text-primary" />
                     <h4 className="text-sm font-black font-heading uppercase tracking-tight">Hızlı Bilgi</h4>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-muted">Toplam Kalem</span>
                        <span className="font-black text-text-primary">{inventory.length}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-muted">Son Hareket</span>
                        <span className="font-black text-text-primary">2 gün önce</span>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        </>
      )}

      {/* ADD ITEM MODAL */}
      <BaseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Stok Kaydı"
      >
        <form onSubmit={handleAddItem} className="space-y-5">
          <Input 
            label="Ürün Adı" 
            placeholder="Örn: DAP Gübresi" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
          <Input as="select" label="Kategori" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="fertilizer">🌱 Gübre</option>
            <option value="pesticide">🧪 İlaç</option>
            <option value="seed">🌾 Tohum</option>
            <option value="fuel">⛽ Yakıt</option>
            <option value="other">📦 Diğer</option>
          </Input>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Miktar" type="number" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            <Input as="select" label="Birim" value={unit} onChange={e => setUnit(e.target.value)} required>
              <option value="kg">kg</option>
              <option value="lt">lt</option>
              <option value="paket">paket</option>
              <option value="cuval">çuval</option>
              <option value="adet">adet</option>
            </Input>
          </div>
          <div className="flex gap-3 pt-4">
             <Button variant="ghost" fullWidth type="button" onClick={() => setIsAddModalOpen(false)}>Vazgeç</Button>
             <Button fullWidth type="submit">Stoka Ekle</Button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
