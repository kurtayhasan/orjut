'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
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
  addExpense: (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string }) => Promise<void>;
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
  deleteScoutingLog: (id: string) => Promise<void>;
  inventory: InventoryItem[];
  addInventoryItem: (item: any) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  calculateUnitCost: (amount: number, quantity: number) => number;
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
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [fieldOperations, setFieldOperations] = useState<FieldOperation[]>([]);
  const [scoutingLogs, setScoutingLogs] = useState<ScoutingLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  const getUserId = useCallback(() => localStorage.getItem('user_id'), []);

  // Centralized Data Fetching
  const refreshAllData = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoadingLands(true);
    setIsLoadingTransactions(true);

    try {
      const [p, l, t, s, i, fo, sl, inv] = await Promise.all([
        db.getProfile(userId),
        db.getLands(userId),
        db.getTransactions(userId, 5),
        db.getSeasons(userId),
        db.getIrrigationLogs(userId),
        db.getFieldOperations(userId),
        db.getScoutingLogs(userId),
        db.getInventory(userId)
      ]);

      if (p.data) setUserProfile(p.data);
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

      // Fetch all expense amounts for totals
      const { data: allTx } = await db.getAllTransactionAmounts(userId);
      if (allTx) setTotalExpenses(allTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0));

    } catch (e) {
      console.error("Critical Data Fetch Error:", e);
    } finally {
      setIsLoadingLands(false);
      setIsLoadingTransactions(false);
    }
  }, [getUserId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
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

  // --- ACTIONS ---

  const addLand = async (land: any) => {
    const userId = getUserId();
    if (!userId) return;

    const tempId = 'temp_' + Date.now();
    const dbPayload = { ...land, org_id: userId };
    
    setLands(prev => [...prev, { ...dbPayload, id: tempId } as any]);
    setTotalArea(prev => prev + Number(land.size_decare));

    try {
      const { data, error } = await db.insertLand(dbPayload);
      if (error) throw error;
      if (data) setLands(prev => prev.map(l => l.id === tempId ? data : l));
      toast.success("Arazi başarıyla kaydedildi");
    } catch (err: any) {
      setLands(prev => prev.filter(l => l.id !== tempId));
      setTotalArea(prev => prev - Number(land.size_decare));
      toast.error("Hata: " + err.message);
    }
  };

  const updateLand = async (land: any) => {
    const { id, ...updateData } = land;
    setLands(prev => prev.map(l => l.id === id ? land : l));
    const { error } = await db.updateLand(id, updateData);
    if (error) toast.error("Güncelleme hatası");
    else toast.success("Arazi güncellendi");
  };

  const deleteLand = async (id: string) => {
    const land = lands.find(l => l.id === id);
    if (land) setTotalArea(prev => prev - Number(land.size_decare || 0));
    setLands(prev => prev.filter(l => l.id !== id));
    const { error } = await db.deleteLand(id);
    if (error) toast.error("Silme hatası");
  };

  const addExpense = async (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string }) => {
    const userId = getUserId();
    if (!userId) return;

    const tempId = 'temp_' + Date.now();
    const newTx: any = { 
      id: tempId, amount, description: category, date, type: 'expense', category, land_id, org_id: userId,
      quantity: inventoryData?.quantity, unit: inventoryData?.unit, receipt_url, receipt_thumbnail_url
    };

    setTransactions(prev => [newTx, ...prev]);
    setTotalExpenses(prev => prev + amount);

    try {
      const { data, error } = await db.insertTransaction(newTx);
      if (error) throw error;
      if (data) setTransactions(prev => prev.map(tx => tx.id === tempId ? data : tx));
      
      if (inventoryData) {
        const unitCost = calculateUnitCost(amount, inventoryData.quantity);
        await addInventoryItem({ ...inventoryData, last_unit_cost: unitCost });
      }
      toast.success("Masraf kaydedildi");
    } catch (err: any) {
      setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      setTotalExpenses(prev => prev - amount);
      toast.error("Hata: " + err.message);
    }
  };

  const deleteExpense = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) setTotalExpenses(prev => prev - Number(tx.amount || 0));
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await db.deleteTransaction(id);
    if (error) toast.error("Silme hatası");
  };

  // --- Inventory & Operations ---
  
  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    await db.updateInventoryItem(id, updates);
  };

  const addInventoryItem = async (item: any) => {
    const userId = getUserId();
    if (!userId) return;
    const { data } = await db.insertInventoryItem({ ...item, org_id: userId });
    if (data) setInventory(prev => [...prev, data]);
  };

  const deleteInventoryItem = async (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    await db.deleteInventoryItem(id);
  };

  const addFieldOperation = async (op: any) => {
    const userId = getUserId();
    if (!userId) return;
    
    const { data } = await db.insertFieldOperation({ ...op, org_id: userId });
    if (data) {
      setFieldOperations(prev => [data, ...prev]);
      if (op.inventory_id) {
        const item = inventory.find(i => i.id === op.inventory_id);
        if (item) updateInventoryItem(item.id, { quantity: Math.max(0, item.quantity - op.amount) });
      }
      toast.success("İşlem kaydedildi");
    }
  };

  // --- AI & Weather ---

  const requestWeatherAndInsight = async () => {
    let lat = 37.7478, lon = 27.3971;
    if (lands.length > 0 && lands[0].lat && lands[0].lng) { lat = lands[0].lat; lon = lands[0].lng; }
    
    toast.loading("Veriler analiz ediliyor...", { id: 'ai-loading' });
    
    try {
      const weather = await fetchWeather(lat, lon);
      setWeatherData(weather);
      
      const landContexts: LandContext[] = lands.map(land => ({
        cropName: land.crop_type, sowingDate: land.planting_date || new Date().toISOString(),
        currentDay: land.planting_date ? Math.floor((Date.now() - new Date(land.planting_date).getTime()) / 86400000) : 0,
        totalArea: land.size_decare || 0
      }));
      
      const prompt = buildAIPrompt({ weather, lands: landContexts, date: new Date().toLocaleDateString('tr-TR') });
      const res = await fetch('/api/ai/daily-insight', { method: 'POST', body: JSON.stringify({ prompt }) });
      const data = await res.json();
      
      if (data.success) {
        setDailyInsight(data.insight);
        toast.success("Analiz tamamlandı", { id: 'ai-loading' });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) { 
      toast.error("Hata: " + e.message, { id: 'ai-loading' });
    }
  };

  const value = {
    lang, setLang, t, totalExpenses, totalArea, addExpense, updateExpense: async () => {}, deleteExpense,
    weather: { temp: weatherData?.temperature || null, windspeed: weatherData?.windSpeed || null, loading: false, error: null },
    dailyInsight, criticalAlert, totalSavings, dailySpent, dailyActions, lands, transactions, irrigationLogs,
    isLoadingLands, isLoadingTransactions, addLand, updateLand, deleteLand,
    addIrrigationLog: async () => {}, deleteIrrigationLog: async () => {}, logSaving: async () => {},
    requestWeatherAndInsight, startNewSeason: async () => {}, toggleSeasonStatus: async () => {},
    isDemo: false, isSidebarOpen, setIsSidebarOpen, seasons, activeSeason, setActiveSeason: (s: Season) => setActiveSeason(s),
    weatherData, currentUserRole, userProfile, fieldOperations, scoutingLogs,
    addFieldOperation, deleteFieldOperation: async (id: string) => { setFieldOperations(prev => prev.filter(o => o.id !== id)); db.deleteFieldOperation(id); },
    addScoutingLog: async (log: Omit<ScoutingLog, 'id'>) => { const { data } = await db.insertScoutingLog({ ...log, org_id: getUserId() || '' }); if (data) setScoutingLogs(prev => [data, ...prev]); },
    deleteScoutingLog: async (id: string) => { setScoutingLogs(prev => prev.filter(s => s.id !== id)); db.deleteScoutingLog(id); },
    inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
    isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode), calculateUnitCost
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
