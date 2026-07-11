import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { buildAIPrompt, LandContext } from '@/lib/aiActionEngine';
import { Land, Season, IrrigationLog, FieldOperation, ScoutingLog, InventoryItem, Profile } from '@/types';
import {
  enqueue,
  newClientId,
  isLikelyOfflineError,
  type PendingType,
} from '@/lib/offlineQueue';

export function useFarmLogic(
  activeOrgId: string | null, 
  userProfile: Profile | null, 
  inventory: InventoryItem[],
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
) {
  const [lands, setLands] = useState<Land[]>([]);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [irrigationLogs, setIrrigationLogs] = useState<IrrigationLog[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [isLoadingLands, setIsLoadingLands] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [fieldOperations, setFieldOperations] = useState<FieldOperation[]>([]);
  const [scoutingLogs, setScoutingLogs] = useState<ScoutingLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);

  // Default Weather fetching based on lands
  useEffect(() => {
    if (!userProfile || !activeOrgId) return;
    let active = true;
    async function loadCurrentWeather() {
      let lat: number | null = null;
      let lon: number | null = null;

      if (lands.length > 0) {
        const parsedLat = parseFloat(lands[0].lat as any);
        const parsedLon = parseFloat(lands[0].lng as any);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
        }
      }

      if ((lat === null || lon === null) && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!active) return;
            try {
              const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
              if (active) setWeatherData(data);
            } catch (err) {}
          },
          () => {},
          { timeout: 5000 }
        );
        return;
      }

      if (lat === null || lon === null) {
        lat = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || 37.7478);
        lon = Number(process.env.NEXT_PUBLIC_DEFAULT_LON || 27.3971);
      }

      try {
        const data = await fetchWeather(lat, lon);
        if (active) setWeatherData(data);
      } catch (err) {}
    }

    if (activeOrgId) {
      loadCurrentWeather();
    }

    return () => {
      active = false;
    };
  }, [lands, activeOrgId, userProfile]);

  /** Enqueue create + optimistic row when offline / network failure. */
  const saveOfflineCreate = useCallback(
    (
      type: PendingType,
      payload: Record<string, unknown>,
      applyOptimistic: (clientId: string) => void
    ): boolean => {
      if (!activeOrgId) return false;
      const clientId = newClientId();
      const enq = enqueue({
        clientId,
        orgId: activeOrgId,
        type,
        payload: { ...payload, org_id: activeOrgId },
      });
      if (!enq.ok) {
        toast.error(enq.reason);
        return false;
      }
      applyOptimistic(clientId);
      toast.success('Çevrimdışı kaydedildi. Bağlantı gelince senkronize edilecek.');
      return true;
    },
    [activeOrgId]
  );

  const addLand = useCallback(async (land: any) => {
    if (!activeOrgId) return;
    // Avoid queueing multi-MB polygons offline
    const { geometry, boundaries, ...landSlim } = land || {};
    const payload = { ...landSlim, org_id: activeOrgId };

    const tryOnline = async () => {
      const full = { ...land, org_id: activeOrgId };
      const { data, error } = await db.insertLand(full);
      if (error) throw error;
      if (data) {
        setLands(prev => [...prev, data]);
        setTotalArea(prev => prev + Number(land.size_decare || 0));
        toast.success('Arazi başarıyla kaydedildi');
      }
    };

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch');
      }
      await tryOnline();
    } catch (err: any) {
      if (!isLikelyOfflineError(err)) {
        toast.error(err?.message ? `Arazi kaydedilemedi: ${err.message}` : 'Arazi kaydedilemedi.');
        return;
      }
      // Offline: store slim payload (no geometry/boundaries) to respect storage limits
      saveOfflineCreate('insert_land', payload, (clientId) => {
        setLands(prev => [
          ...prev,
          { ...payload, id: clientId, isPending: true } as Land,
        ]);
        setTotalArea(prev => prev + Number(land.size_decare || 0));
      });
    }
  }, [activeOrgId, saveOfflineCreate]);

  const updateLand = useCallback(async (land: any) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Arazi güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    const { id, ...updateData } = land;
    try {
      const { error } = await db.updateLand(id, updateData);
      if (error) throw error;
      setLands(prev => prev.map(l => l.id === id ? { ...l, ...updateData } : l));
      toast.success("Arazi güncellendi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Arazi güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message
        ? `Güncelleme başarısız: ${err.message}`
        : 'Güncelleme başarısız oldu. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.');
    }
  }, []);

  const deleteLand = useCallback(async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Arazi silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const land = lands.find(l => l.id === id);
      if (!land) return;

      await Promise.all([
        db.deleteTransactionsByLand(id),
        db.deleteIrrigationLogsByLand(id),
        db.deleteScoutingLogsByLand(id),
        db.deleteFieldOperationsByLand(id)
      ]);

      const { error } = await db.deleteLand(id);
      if (error) throw error;
      
      setTotalArea(prev => prev - Number(land.size_decare || 0));
      setLands(prev => prev.filter(l => l.id !== id));
      
      setIrrigationLogs(prev => prev.filter(l => l.land_id !== id));
      setScoutingLogs(prev => prev.filter(s => s.land_id !== id));
      setFieldOperations(prev => prev.filter(o => o.land_id !== id));
      
      toast.success("Arazi ve bağlı tüm veriler silindi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Arazi silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message
        ? `Silme başarısız: ${err.message}`
        : 'Silme işlemi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.');
    }
  }, [lands]);

  const addFieldOperation = useCallback(async (op: any) => {
    if (!activeOrgId) return;
    const payload = { ...op, org_id: activeOrgId };

    const tryOnline = async () => {
      const { data, error } = await db.insertFieldOperation(payload);
      if (error) throw error;
      if (data) {
        setFieldOperations(prev => [data, ...prev]);
        if (op.inventory_id) {
          const item = inventory.find(i => i.id === op.inventory_id);
          if (item) {
            await updateInventoryItem(item.id, {
              quantity: Math.max(0, item.quantity - op.amount),
            });
          }
        }
        toast.success('İşlem kaydedildi');
      }
    };

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch');
      }
      await tryOnline();
    } catch (err: any) {
      if (!isLikelyOfflineError(err)) {
        toast.error(
          err?.message
            ? `Tarla işlemi kaydedilemedi: ${err.message}`
            : 'Tarla işlemi kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyiniz.'
        );
        return;
      }
      // Offline: no inventory deduction (avoid double-deduct on flush)
      saveOfflineCreate('insert_field_operation', payload, (clientId) => {
        setFieldOperations(prev => [
          { ...payload, id: clientId, isPending: true } as FieldOperation,
          ...prev,
        ]);
      });
      if (op.inventory_id) {
        toast.info('Stok düşümü online senkron sonrası uygulanır.');
      }
    }
  }, [activeOrgId, inventory, updateInventoryItem, saveOfflineCreate]);

  const deleteFieldOperation = useCallback(async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Tarla işlemi silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const { error } = await db.deleteFieldOperation(id);
      if (error) throw error;
      setFieldOperations(prev => prev.filter(o => o.id !== id));
      toast.success("Silindi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Tarla işlemi silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message || 'Tarla işlemi silinemedi. Lütfen tekrar deneyiniz.');
    }
  }, []);

  const addScoutingLog = useCallback(async (log: any) => {
    if (!activeOrgId) return;
    const payload = { ...log, org_id: activeOrgId };

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch');
      }
      const { data, error } = await db.insertScoutingLog(payload);
      if (error) throw error;
      if (data) {
        setScoutingLogs(prev => [data, ...prev]);
        toast.success('Gözlem eklendi');
      }
    } catch (err: any) {
      if (!isLikelyOfflineError(err)) {
        toast.error(err?.message || 'Gözlem kaydı eklenemedi.');
        return;
      }
      saveOfflineCreate('insert_scouting', payload, (clientId) => {
        setScoutingLogs(prev => [
          { ...payload, id: clientId, isPending: true } as ScoutingLog,
          ...prev,
        ]);
      });
    }
  }, [activeOrgId, saveOfflineCreate]);

  const updateScoutingLog = useCallback(async (id: string, updates: Partial<ScoutingLog>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Gözlem güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const { error } = await db.updateScoutingLog(id, updates);
      if (error) throw error;
      setScoutingLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success("Gözlem güncellendi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Gözlem güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message || 'Gözlem güncellenemedi.');
    }
  }, []);

  const updateScoutingPrescription = useCallback(async (id: string, isApplied: boolean, text?: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Reçete güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const updates: any = { prescription_applied: isApplied };
      if (text !== undefined) updates.prescription = text;
      const { error } = await db.updateScoutingLog(id, updates);
      if (error) throw error;
      setScoutingLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success("Reçete durumu güncellendi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Reçete güncelleme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message || 'Reçete güncellenemedi.');
    }
  }, []);

  const deleteScoutingLog = useCallback(async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Gözlem silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const { error } = await db.deleteScoutingLog(id);
      if (error) throw error;
      setScoutingLogs(prev => prev.filter(s => s.id !== id));
      toast.success("Gözlem silindi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Gözlem silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message || 'Gözlem silinemedi.');
    }
  }, []);

  const addIrrigationLog = useCallback(async (log: any) => {
    if (!activeOrgId) return;
    const payload = { ...log, org_id: activeOrgId };

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch');
      }
      const { data, error } = await db.insertIrrigationLog(payload);
      if (error) throw error;
      if (data) {
        setIrrigationLogs(prev => [data, ...prev]);
        toast.success('Sulama eklendi');
      }
    } catch (err: any) {
      if (!isLikelyOfflineError(err)) {
        toast.error(
          err?.message || 'Sulama kaydı eklenemedi. Lütfen tekrar deneyiniz.'
        );
        return;
      }
      saveOfflineCreate('insert_irrigation', payload, (clientId) => {
        setIrrigationLogs(prev => [
          { ...payload, id: clientId, isPending: true } as IrrigationLog,
          ...prev,
        ]);
      });
    }
  }, [activeOrgId, saveOfflineCreate]);

  const deleteIrrigationLog = useCallback(async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Sulama silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
      return;
    }
    try {
      const { error } = await db.deleteIrrigationLog(id);
      if (error) throw error;
      setIrrigationLogs(prev => prev.filter(l => l.id !== id));
      toast.success("Silindi");
    } catch (err: any) {
      if (isLikelyOfflineError(err)) {
        toast.error('Sulama silme çevrimdışı desteklenmiyor. Bağlantı gelince tekrar deneyin.');
        return;
      }
      toast.error(err?.message || 'Sulama kaydı silinemedi. Lütfen tekrar deneyiniz.');
    }
  }, []);

  const startNewSeason = useCallback(async (name: string, startDate: string, endDate: string) => {
    if (!activeOrgId) return;
    const year = new Date(startDate).getFullYear();
    try {
      if (activeSeason) await db.updateSeason(activeSeason.id, { is_active: false });
      const { data, error } = await db.insertSeason({ org_id: activeOrgId, name, start_date: startDate, end_date: endDate, year, is_active: true });
      if (error) throw error;
      if (data && data[0]) {
        setSeasons(prev => [data[0], ...prev.map(s => ({ ...s, is_active: false }))]);
        setActiveSeason(data[0]);
        toast.success("Yeni sezon başlatıldı");
      }
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  }, [activeOrgId, activeSeason]);

  const toggleSeasonStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await db.updateSeason(id, { is_active: !currentStatus });
      if (error) throw error;
      setSeasons(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success(`Sezon ${!currentStatus ? 'açıldı' : 'kapatıldı'}`);
    } catch (err) {
      toast.error("Sezon durumu güncellenemedi. Lütfen tekrar deneyiniz.");
    }
  }, []);

  const requestWeatherAndInsight = useCallback(async () => {
    if (isAnalyzing || !activeOrgId) return;
    setIsAnalyzing(true);
    let lat = 37.7478, lon = 27.3971;
      if (lands.length > 0) {
      const parsedLat = parseFloat(String(lands[0]?.lat ?? ''));
      const parsedLng = parseFloat(String(lands[0]?.lng ?? ''));
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        lat = parsedLat;
        lon = parsedLng;
      }
    } else {
      lat = Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || 37.7478);
      lon = Number(process.env.NEXT_PUBLIC_DEFAULT_LON || 27.3971);
    }
    toast.loading("Analiz ediliyor...", { id: 'ai-loading' });
    
    try {
      const { fetchOpenMeteoSoilData } = await import('@/services/agroService');
      const [weather, soil] = await Promise.all([
        fetchWeather(lat, lon),
        fetchOpenMeteoSoilData(lat, lon)
      ]);
      setWeatherData(weather);
      const landContexts: LandContext[] = lands.map(land => ({
        id: land.id,
        cropName: land.crop_type || 'Ekin', 
        sowingDate: land.planting_date || new Date().toISOString(),
        currentDay: land.planting_date ? Math.floor((Date.now() - new Date(land.planting_date).getTime()) / 86400000) : 0,
        totalArea: land.size_decare || 0,
        lat: land.lat || 37.0,
        lng: land.lng || 35.0,
        soilType: (land as any).soil_type || 'Killi/Tınlı',
        lastOperations: fieldOperations
          .filter(o => o.land_id === land.id)
          .slice(0, 3)
          .map(o => `${o.date || 'Tarih'}: ${o.type || 'İşlem'} (${o.amount || 0} ${o.unit || ''})`),
        scoutingNotes: scoutingLogs
          .filter(s => s.land_id === land.id)
          .slice(0, 3)
          .map(s => `${s.date || 'Tarih'}: ${s.health_status || 'Durum'} - ${s.notes || ''}`)
      }));

      const inventoryStatus = inventory
        .filter(i => i.quantity < 10)
        .map(i => `${i.item_name || 'Ürün'} (${i.quantity || 0} ${i.unit || ''} kaldı)`);

      const prompt = buildAIPrompt({ 
        weather,
        soil,
        lands: landContexts, 
        inventoryStatus,
        date: new Date().toLocaleDateString('tr-TR'),
        timestamp: new Date().toISOString()
      });

      const res = await fetch('/api/ai/daily-insight', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lang: 'tr' }) 
      });

      if (!res.ok) throw new Error("AI yanıt vermedi.");
      const data = await res.json();
      setDailyInsight(data.insight);
      setCriticalAlert(data.alert || null);
      toast.success("AI Analizi tamamlandı", { id: 'ai-loading' });
    } catch (err: any) {
      toast.error("AI Analizi başarısız oldu.", { id: 'ai-loading' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeOrgId, isAnalyzing, lands, fieldOperations, scoutingLogs, inventory]);

  const getAiHistory = useCallback(async (landId: string) => {
    return []; // Mocked for now, integrate db logic later if needed
  }, []);

  return {
    lands, setLands,
    totalArea, setTotalArea,
    seasons, setSeasons,
    activeSeason, setActiveSeason,
    isLoadingLands, setIsLoadingLands,
    weatherData, setWeatherData,
    dailyInsight, setDailyInsight,
    criticalAlert, setCriticalAlert,
    isAnalyzing, setIsAnalyzing,
    fieldOperations, setFieldOperations,
    scoutingLogs, setScoutingLogs,
    irrigationLogs, setIrrigationLogs,
    addLand, updateLand, deleteLand,
    addFieldOperation, deleteFieldOperation,
    addScoutingLog, updateScoutingLog, updateScoutingPrescription, deleteScoutingLog,
    addIrrigationLog, deleteIrrigationLog,
    startNewSeason, toggleSeasonStatus,
    requestWeatherAndInsight, getAiHistory
  };
}
