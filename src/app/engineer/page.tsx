'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import {
  Users, ArrowLeft, Search, Plus, MapPin,
  Sprout, Coins, ClipboardCheck, Activity,
  CheckCircle2, Info, Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/EmptyState';
import BaseModal from '@/components/ui/BaseModal';
import InviteCollaborator from '@/components/collaborators/InviteCollaborator';
import { toast } from 'sonner';

export default function EngineerDashboard() {
  const { userRole, isLoadingProfile, setSelectedClientId, userProfile } = useAppContext();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Invitation Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Scouting/Prescription Modal State
  const [activePrescriptionLandId, setActivePrescriptionLandId] = useState<string | null>(null);
  const [activePrescriptionLandDetails, setActivePrescriptionLandDetails] = useState<any>(null);
  const [scoutingNotes, setScoutingNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState<'saglikli' | 'hastalik' | 'zararli'>('saglikli');
  const [growthStage, setGrowthStage] = useState<'cimlenme' | 'ciceklenme' | 'meyve_tutumu' | 'hasat'>('cimlenme');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      const { data, error } = await db.getClients(userProfile.id);
      if (error) throw error;
      setClients((data || []).filter((link: any) => link.status === 'approved'));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Çiftçi listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (isLoadingProfile) return;

    if (userRole !== 'engineer') {
      router.push('/dashboard');
      return;
    }

    fetchClients();
  }, [userRole, isLoadingProfile, router, userProfile?.id, fetchClients]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userRole !== 'engineer') return null;

  const handleSelectClient = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    toast.success(`${clientName} seçildi. Panele yönlendiriliyorsunuz...`);
    router.push('/dashboard/lands');
  };

  const handleOpenPrescriptionModal = (land: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop card click navigation
    setActivePrescriptionLandId(land.id);
    setActivePrescriptionLandDetails(land);
    setScoutingNotes('');
    setHealthStatus('saglikli');
    setGrowthStage('cimlenme');
    setPrescriptionText('');
  };

  const handleAddScoutingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrescriptionLandId || !scoutingNotes.trim()) {
      toast.error("Lütfen gözlem notlarını doldurunuz.");
      return;
    }

    setIsSubmittingLog(true);
    try {
      const payload = {
        land_id: activePrescriptionLandId,
        org_id: activePrescriptionLandDetails?.org_id,
        date: new Date().toISOString().split('T')[0],
        notes: scoutingNotes,
        health_status: healthStatus,
        growth_stage: growthStage,
        prescription_action: prescriptionText.trim() ? 'Tavsiye Eklendi' : 'Sadece Gözlem',
        prescription_notes: prescriptionText.trim() || undefined,
        is_prescription_applied: false
      };

      const { error } = await db.insertScoutingLog(payload);
      if (error) throw error;

      toast.success("Zirai gözlem raporu ve reçete başarıyla eklendi.");
      setActivePrescriptionLandId(null);
      fetchClients(); // Refresh list to hydrate stats if needed
    } catch (err: any) {
      toast.error("Reçete eklenirken hata oluştu: " + (err?.message || ''));
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const filteredClients = clients.filter(link => {
    const c = link.farmer;
    if (!c) return false;
    return (
      c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    );
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem('user_role_override', 'farmer');
              window.location.href = '/dashboard';
            }}
            leftIcon={<ArrowLeft size={18} />}
          >
            Kendi Panelime Dön
          </Button>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" /> Danışan Çiftçilerim
          </h1>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Yeni Çiftçi Davet Et
        </Button>
      </header>

      <Card className="p-6 border-none shadow-xl">
        <div className="mb-6">
          <Input
            placeholder="İsim veya telefon numarası ile çiftçi ara..."
            leftIcon={<Search size={18} />}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={searchQuery ? "Sonuç Bulunamadı" : "Henüz Danışan Çiftçiniz Bulunmuyor"}
              description={searchQuery
                ? "Arama kriterlerinizi değiştirin."
                : "Sisteme henüz atanmış bir çiftçiniz bulunmuyor. Yeni çiftçi davet etmek için yukarıdaki butonu kullanabilirsiniz."}
              emoji={searchQuery ? "🔍" : "👨‍🌾"}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredClients.map(link => {
              const client = link.farmer;
              if (!client) return null;

              // Hydrated statistics
              const farmerLands = client.lands || [];
              const farmerTransactions = client.transactions || [];
              const totalSpent = farmerTransactions
                .filter((tx: any) => tx.type === 'expense')
                .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

              return (
                <div
                  key={client.id}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-5 group"
                  onClick={() => handleSelectClient(client.id, `${client.first_name} ${client.last_name}`)}
                >
                  {/* Farmer profile summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                        {client.first_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                          {client.first_name} {client.last_name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-bold">
                          <MapPin size={12} /> {client.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-lg">
                        {farmerLands.length} Tarla
                      </span>
                      <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/20 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-1">
                        <Coins size={12} /> ₺{totalSpent.toLocaleString()} Harcama
                      </span>
                      <span className="px-3 py-1.5 bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white rounded-lg group-hover:bg-indigo-700 transition-all">
                        Paneli Yönet
                      </span>
                    </div>
                  </div>

                  {/* Nested Lands Grid */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Sprout size={12} /> Tarım Alanları ve Reçeteler
                    </h4>

                    {farmerLands.length === 0 ? (
                      <p className="text-xs text-amber-500 font-bold italic py-2 flex items-center gap-1">
                        ⚠️ Henüz tarla eklenmedi
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {farmerLands.map((land: any) => {
                          // Filter transactions for this specific land
                          const landExpenses = farmerTransactions
                            .filter((tx: any) => tx.land_id === land.id && tx.type === 'expense')
                            .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

                          return (
                            <div
                              key={land.id}
                              className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between gap-4 transition-all"
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid triggering client panel navigation
                                handleSelectClient(client.id, `${client.first_name} ${client.last_name}`);
                              }}
                            >
                              <div>
                                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                  {land.district || land.city} ({land.crop_type})
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-0.5">
                                  Ada {land.block_no} / Parsel {land.parcel_no} • {land.size_decare} Dekar
                                </p>
                                <p className="text-[9px] text-rose-500 font-black uppercase mt-1">
                                  Maliyet: ₺{landExpenses.toLocaleString()}
                                </p>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="min-h-[32px] px-2.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-white hover:bg-indigo-600"
                                onClick={(e) => handleOpenPrescriptionModal(land, e)}
                              >
                                <ClipboardCheck size={12} className="mr-1" /> Reçete Ekle
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. INVITATION LINK MODAL */}
      {/* ──────────────────────────────────────────────────────────── */}
      <BaseModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Çiftçi Davet Arayüzü"
      >
        <div className="py-4 space-y-4">
          <InviteCollaborator engineerId={userProfile?.id || ''} />
          <Button
            fullWidth
            variant="ghost"
            className="min-h-[48px]"
            onClick={() => setIsInviteModalOpen(false)}
          >
            Kapat
          </Button>
        </div>
      </BaseModal>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. PRESCRIPTION / SCOUTING LOG MODAL */}
      {/* ──────────────────────────────────────────────────────────── */}
      <BaseModal
        isOpen={!!activePrescriptionLandId}
        onClose={() => setActivePrescriptionLandId(null)}
        title="Zirai Reçete ve Gözlem Girişi"
      >
        <form onSubmit={handleAddScoutingLog} className="space-y-4 py-2">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span className="text-zinc-400">Arazi Konumu: </span>
            <span className="text-zinc-900 dark:text-white font-black">{activePrescriptionLandDetails?.district || activePrescriptionLandDetails?.city} </span>
            <span className="mx-1 text-zinc-300">|</span>
            <span className="text-zinc-400">Ürün Tipi: </span>
            <span className="text-zinc-900 dark:text-white font-black">{activePrescriptionLandDetails?.crop_type}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              as="select"
              label="Bitki Sağlık Durumu"
              value={healthStatus}
              onChange={(e: any) => setHealthStatus(e.target.value)}
              required
            >
              <option value="saglikli">🟢 Sağlıklı</option>
              <option value="hastalik">🟡 Hastalık Şüphesi</option>
              <option value="zararli">🔴 Zararlı / Hasarlı</option>
            </Input>

            <Input
              as="select"
              label="Gelişim Evresi"
              value={growthStage}
              onChange={(e: any) => setGrowthStage(e.target.value)}
              required
            >
              <option value="cimlenme">Filizlenme / Çimlenme</option>
              <option value="ciceklenme">Çiçeklenme Dönemi</option>
              <option value="meyve_tutumu">Meyve Tutumu</option>
              <option value="hasat">Hasat Evresi</option>
            </Input>
          </div>

          <Input
            as="textarea"
            label="Gözlem Notları"
            placeholder="Bitki sağlığı, toprak durumu ve arazi genel gözlemlerinizi buraya yazın..."
            value={scoutingNotes}
            onChange={(e: any) => setScoutingNotes(e.target.value)}
            required
            rows={3}
          />

          <Input
            as="textarea"
            label="Zirai Reçete & Öneri (Opsiyonel)"
            placeholder="Çiftçinin uygulayacağı gübreleme, ilaçlama veya sulama reçetesini buraya yazın..."
            value={prescriptionText}
            onChange={(e: any) => setPrescriptionText(e.target.value)}
            rows={4}
          />

          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 p-2.5 rounded-lg border border-indigo-100/20">
            <Info size={12} className="shrink-0" />
            <span>Oluşturduğunuz gözlem raporu ve reçete çiftçinin kendi panelinde anında görünecektir.</span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setActivePrescriptionLandId(null)}
              type="button"
              disabled={isSubmittingLog}
              className="min-h-[48px]"
            >
              Vazgeç
            </Button>
            <Button
              fullWidth
              type="submit"
              isLoading={isSubmittingLog}
              disabled={isSubmittingLog}
              className="min-h-[48px]"
            >
              Kaydet ve Reçeteyi Gönder
            </Button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
