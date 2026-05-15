'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import PremiumUpsellModal from '@/components/ui/PremiumUpsellModal';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { buildAIPrompt, LandContext } from '@/lib/aiActionEngine';
import { Transaction, Land, Season, Profile, IrrigationLog, FieldOperation, ScoutingLog, InventoryItem } from '@/types';
import { db } from '@/lib/db';
import { translations, Language } from '@/lib/translations';

type AppContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  totalExpenses: number;
  totalArea: number;
  addExpense: (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string, id?: string }, season_id?: string) => Promise<void>;
  updateExpense: (id: string, updates: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  weather: { temp: number | null, windspeed: number | null, loading: boolean, error: string | null };
  dailyInsight: string | null;
  criticalAlert: string | null;
  totalSavings: number;
  dailySpent: number;
  dailyActions: number;
  lands: Land[];
  transactions: Transaction[];
  irrigationLogs: IrrigationLog[];
  isLoadingLands: boolean;
  isLoadingTransactions: boolean;
  addLand: (land: any) => Promise<void>;
  updateLand: (land: any) => Promise<void>;
  deleteLand: (id: string) => Promise<void>;
  addIrrigationLog: (log: any) => Promise<void>;
  deleteIrrigationLog: (id: string) => Promise<void>;
  logSaving: (amount: number, reason: string) => Promise<void>;
  requestWeatherAndInsight: () => Promise<void>;
  startNewSeason: (name: string, startDate: string, endDate: string) => Promise<void>;
  isDemo: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  seasons: Season[];
  activeSeason: Season | null;
  setActiveSeason: (season: Season) => void;
  toggleSeasonStatus: (id: string, currentStatus: boolean) => Promise<void>;
  weatherData: WeatherData | null;
  currentUserRole: 'owner' | 'editor' | 'viewer';
  userProfile: Profile | null;
  fieldOperations: FieldOperation[];
  scoutingLogs: ScoutingLog[];
  addFieldOperation: (op: any) => Promise<void>;
  deleteFieldOperation: (id: string) => Promise<void>;
  addScoutingLog: (log: any) => Promise<void>;
  updateScoutingLog: (id: string, updates: Partial<ScoutingLog>) => Promise<void>;
  deleteScoutingLog: (id: string) => Promise<void>;
  inventory: InventoryItem[];
  isLoadingInventory: boolean;
  addInventoryItem: (item: any) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  calculateUnitCost: (amount: number, quantity: number) => number;
  userRole: 'farmer' | 'engineer' | 'admin';
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  activeOrgId: string | null;
  isPremium: boolean;
  showUpsell: boolean;
  triggerUpsell: () => void;
  closeUpsell: () => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (isOpen: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('tr');
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [dailySpent, setDailySpent] = useState<number>(0);
  const [dailyActions, setDailyActions] = useState<number>(0);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [lands, setLands] = useState<Land[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [irrigationLogs, setIrrigationLogs] = useState<IrrigationLog[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'editor' | 'viewer'>('owner');
  const [isLoadingLands, setIsLoadingLands] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [fieldOperations, setFieldOperations] = useState<FieldOperation[]>([]);
  const [scoutingLogs, setScoutingLogs] = useState<ScoutingLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<'farmer' | 'engineer' | 'admin'>('farmer');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const triggerUpsell = useCallback(() => setShowUpsell(true), []);
  const closeUpsell = useCallback(() => setShowUpsell(false), []);

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  const activeOrgId = useMemo(() => {
    const myId = userProfile?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
    
    // PHASE 3: Zero-UUID Protection & Auth Matching
    if (!myId || myId === '00000000-0000-0000-0000-000000000000') return null;
    
    if (userRole === 'engineer' && selectedClientId) return selectedClientId;
    return myId;
  }, [userRole, selectedClientId, userProfile?.id]);

  const refreshAllData = useCallback(async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId || !activeOrgId) return;

    setIsLoadingLands(true);
    setIsLoadingTransactions(true);
    setIsLoadingInventory(true);

    try {
      const [p, l, t, s, i, fo, sl, inv] = await Promise.all([
        db.getProfile(userId),
        db.getLands(activeOrgId),
        db.getTransactions(activeOrgId, 20),
        db.getSeasons(activeOrgId),
        db.getIrrigationLogs(activeOrgId),
        db.getFieldOperations(activeOrgId),
        db.getScoutingLogs(activeOrgId),
        db.getInventory(activeOrgId)
      ]);

      if (p.data) {
        setUserProfile(p.data);
        setUserRole((p.data.role as any) || 'farmer');
      }
      if (l.data) {
        setLands(l.data);
        setTotalArea(l.data.reduce((sum, land) => sum + Number(land.size_decare || 0), 0));
      }
      if (t.data) setTransactions(t.data);
      if (s.data) {
        setSeasons(s.data);
        setActiveSeason(s.data.find((ss: any) => ss.is_active) || s.data[0] || null);
      }
      if (i.data) setIrrigationLogs(i.data);
      if (fo.data) setFieldOperations(fo.data);
      if (sl.data) setScoutingLogs(sl.data);
      if (inv.data) setInventory(inv.data);

      const { data: allTx } = await db.getTransactions(activeOrgId);
      if (allTx) setTotalExpenses(allTx.reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0));

    } catch (e) {
      console.error("Critical Data Fetch Error:", e);
    } finally {
      setIsLoadingLands(false);
      setIsLoadingTransactions(false);
      setIsLoadingInventory(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    setIsDarkMode(savedTheme === 'dark');
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const calculateUnitCost = (amount: number, quantity: number) => {
    if (!quantity || quantity <= 0) return 0;
    return amount / quantity;
  };

  const addLand = async (land: any) => {
    if (!activeOrgId) return;
    try {
      const { data, error } = await db.insertLand({ ...land, org_id: activeOrgId });
      if (error) throw error;
      if (data) {
        setLands(prev => [...prev, data]);
        setTotalArea(prev => prev + Number(land.size_decare));
        toast.success("Arazi başarıyla kaydedildi");
      }
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const updateLand = async (land: any) => {
    const { id, ...updateData } = land;
    try {
      const { error } = await db.updateLand(id, updateData);
      if (error) throw error;
      setLands(prev => prev.map(l => l.id === id ? { ...l, ...updateData } : l));
      toast.success("Arazi güncellendi");
    } catch (err: any) {
      toast.error("Güncelleme hatası");
    }
  };

  const deleteLand = async (id: string) => {
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
      
      if (land) setTotalArea(prev => prev - Number(land.size_decare || 0));
      setLands(prev => prev.filter(l => l.id !== id));
      
      setTransactions(prev => prev.filter(t => t.land_id !== id));
      setIrrigationLogs(prev => prev.filter(l => l.land_id !== id));
      setScoutingLogs(prev => prev.filter(s => s.land_id !== id));
      setFieldOperations(prev => prev.filter(o => o.land_id !== id));
      
      toast.success("Arazi ve bağlı tüm veriler silindi");
    } catch (err: any) {
      toast.error("Silme hatası");
    }
  };

  const addExpense = async (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string, id?: string }, season_id?: string) => {
    if (!activeOrgId) return;
    const newTx: any = { 
      amount, description: category, date, type: 'expense', category, land_id, org_id: activeOrgId,
      quantity: inventoryData?.quantity, unit: inventoryData?.unit, receipt_url, receipt_thumbnail_url,
      season_id: season_id || activeSeason?.id
    };
    try {
      const { data, error } = await db.insertTransaction(newTx);
      if (error) throw error;
      if (data) {
        setTransactions(prev => [data, ...prev]);
        setTotalExpenses(prev => prev + amount);
        
        if (inventoryData) {
          const unitCost = calculateUnitCost(amount, inventoryData.quantity);
          
          if (inventoryData.id) {
            // Update existing stock (Phase 2 Smart Stock)
            const item = inventory.find(i => i.id === inventoryData.id);
            if (item) {
              await updateInventoryItem(item.id, { 
                quantity: item.quantity + inventoryData.quantity,
                unit_cost: unitCost,
                last_purchase_date: date
              });
              toast.success("Harcama kaydedildi ve mevcut stok güncellendi");
            }
          } else {
            // New stock entry
            await addInventoryItem({ 
              item_name: inventoryData.name, 
              type: inventoryData.type, 
              quantity: inventoryData.quantity, 
              unit: inventoryData.unit, 
              unit_cost: unitCost, 
              last_purchase_date: date 
            });
            toast.success("Harcama kaydedildi ve yeni stok oluşturuldu");
          }
        } else {
          toast.success("Masraf başarıyla kaydedildi");
        }
      }
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  const updateExpense = async (id: string, updates: any) => {
    try {
      const { error } = await db.updateTransaction(id, updates);
      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast.success("İşlem güncellendi");
    } catch (err: any) {
      toast.error("Güncelleme hatası");
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const tx = transactions.find(t => t.id === id);
      const { error } = await db.deleteTransaction(id);
      if (error) throw error;
      if (tx) setTotalExpenses(prev => prev - Number(tx.amount || 0));
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("İşlem silindi");
    } catch (err: any) {
      toast.error("Silme hatası");
    }
  };

  const startNewSeason = async (name: string, startDate: string, endDate: string) => {
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
  };

  const toggleSeasonStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await db.updateSeason(id, { is_active: !currentStatus });
      if (error) throw error;
      setSeasons(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success(`Sezon ${!currentStatus ? 'açıldı' : 'kapatıldı'}`);
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  const addInventoryItem = async (item: any) => {
    if (!activeOrgId) return;
    try {
      const { data, error } = await db.insertInventoryItem({ ...item, org_id: activeOrgId });
      if (error) throw error;
      if (data) setInventory(prev => [...prev, data]);
    } catch (err: any) {
      console.error("Inventory error:", err);
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await db.updateInventoryItem(id, updates);
      if (error) throw error;
      setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch (err) {
      toast.error("Güncelleme hatası");
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await db.deleteInventoryItem(id);
      if (error) throw error;
      setInventory(prev => prev.filter(i => i.id !== id));
      toast.success("Silindi");
    } catch (err) {
      toast.error("Silme hatası");
    }
  };

  const addFieldOperation = async (op: any) => {
    if (!activeOrgId) return;
    try {
      const { data, error } = await db.insertFieldOperation({ ...op, org_id: activeOrgId });
      if (error) throw error;
      if (data) {
        setFieldOperations(prev => [data, ...prev]);
        if (op.inventory_id) {
          const item = inventory.find(i => i.id === op.inventory_id);
          if (item) updateInventoryItem(item.id, { quantity: Math.max(0, item.quantity - op.amount) });
        }
        toast.success("İşlem kaydedildi");
      }
    } catch (err) {
      toast.error("İşlem hatası");
    }
  };

  const addIrrigationLog = async (log: any) => {
    if (!activeOrgId) return;
    try {
      const { data, error } = await db.insertIrrigationLog({ ...log, org_id: activeOrgId });
      if (error) throw error;
      if (data) {
        setIrrigationLogs(prev => [data, ...prev]);
        toast.success("Sulama eklendi");
      }
    } catch (err) {
      toast.error("Kayıt hatası");
    }
  };

  const deleteIrrigationLog = async (id: string) => {
    try {
      const { error } = await db.deleteIrrigationLog(id);
      if (error) throw error;
      setIrrigationLogs(prev => prev.filter(l => l.id !== id));
      toast.success("Silindi");
    } catch (err) {
      toast.error("Silme hatası");
    }
  };

  const logSaving = async (amount: number, reason: string) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId) return;
    try {
      await db.insertSavingLog({ user_id: userId, amount, reason });
      setTotalSavings(prev => prev + amount);
    } catch (err) {
      console.error("Saving log error:", err);
    }
  };

  const requestWeatherAndInsight = async () => {
    let lat = 37.7478, lon = 27.3971;
    if (lands.length > 0 && lands[0].lat && lands[0].lng) { lat = lands[0].lat; lon = lands[0].lng; }
    toast.loading("Analiz ediliyor...", { id: 'ai-loading' });
    try {
      const weather = await fetchWeather(lat, lon);
      setWeatherData(weather);
      const landContexts: LandContext[] = lands.map(land => ({
        id: land.id,
        cropName: land.crop_type, 
        sowingDate: land.planting_date || new Date().toISOString(),
        currentDay: land.planting_date ? Math.floor((Date.now() - new Date(land.planting_date).getTime()) / 86400000) : 0,
        totalArea: land.size_decare || 0,
        lastOperations: fieldOperations
          .filter(o => o.land_id === land.id)
          .slice(0, 3)
          .map(o => `${o.date}: ${o.type} (${o.amount} ${o.unit || ''})`),
        scoutingNotes: scoutingLogs
          .filter(s => s.land_id === land.id)
          .slice(0, 3)
          .map(s => `${s.date}: ${s.health_status} - ${s.notes}`)
      }));

      const inventoryStatus = inventory
        .filter(i => i.quantity < 10)
        .map(i => `${i.item_name} (${i.quantity} ${i.unit} kaldı)`);

      const prompt = buildAIPrompt({ 
        weather, 
        lands: landContexts, 
        inventoryStatus,
        date: new Date().toLocaleDateString('tr-TR') 
      });
      const res = await fetch('/api/ai/daily-insight', { method: 'POST', body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if (data.success) {
        setDailyInsight(data.insight);
        toast.success("Analiz tamamlandı", { id: 'ai-loading' });
      } else throw new Error(data.error);
    } catch (e: any) { 
      toast.error("Hata: " + e.message, { id: 'ai-loading' });
    }
  };

  const value = {
    lang, setLang, t, totalExpenses, totalArea, addExpense, updateExpense, deleteExpense,
    weather: { temp: weatherData?.temperature || null, windspeed: weatherData?.windSpeed || null, loading: false, error: null },
    dailyInsight, criticalAlert, totalSavings, dailySpent, dailyActions, lands, transactions, irrigationLogs,
    isLoadingLands, isLoadingTransactions, addLand, updateLand, deleteLand,
    addIrrigationLog, deleteIrrigationLog, logSaving,
    requestWeatherAndInsight, startNewSeason, toggleSeasonStatus,
    isSidebarOpen, setIsSidebarOpen, seasons, activeSeason, setActiveSeason: (s: Season) => setActiveSeason(s),
    weatherData, currentUserRole, userProfile, fieldOperations, scoutingLogs,
    addFieldOperation, deleteFieldOperation: async (id: string) => { setFieldOperations(prev => prev.filter(o => o.id !== id)); db.deleteFieldOperation(id); },
    addScoutingLog: async (log: Omit<ScoutingLog, 'id'>) => { if (!activeOrgId) return; const { data } = await db.insertScoutingLog({ ...log, org_id: activeOrgId }); if (data) setScoutingLogs(prev => [data, ...prev]); },
    updateScoutingLog: async (id: string, updates: Partial<ScoutingLog>) => { 
      try {
        const { error } = await db.updateScoutingLog(id, updates);
        if (error) throw error;
        setScoutingLogs(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        toast.success("Tavsiye kaydedildi");
      } catch (err) {
        toast.error("Kaydedilemedi");
      }
    },
    deleteScoutingLog: async (id: string) => { setScoutingLogs(prev => prev.filter(s => s.id !== id)); db.deleteScoutingLog(id); },
    inventory, isLoadingInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
    isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode), calculateUnitCost,
    userRole, selectedClientId, setSelectedClientId, activeOrgId,
    isPremium: !!userProfile?.is_premium,
    isDemo: false,
    showUpsell, triggerUpsell, closeUpsell,
    isExpenseModalOpen, setIsExpenseModalOpen
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <PremiumUpsellModal isOpen={showUpsell} onClose={closeUpsell} />
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
