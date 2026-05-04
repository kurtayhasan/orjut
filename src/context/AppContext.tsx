'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { buildAIPrompt, LandContext } from '@/lib/aiActionEngine';
import { Transaction, Land, Season, Profile, CategoryTotals, IrrigationLog, FieldOperation, ScoutingLog, InventoryItem } from '@/types';


const translations = {
  en: { dashboard: "Action Tracker", lands: "Plots", inventory: "Inventory", finance: "Finance", settings: "Settings" },
  tr: { dashboard: "Aksiyon Takibi", lands: "Araziler", inventory: "Envanter", finance: "Finans", settings: "Ayarlar" }
};

type Language = 'en' | 'tr';

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

  const fetchTransactions = React.useCallback(async () => {
    setIsLoadingTransactions(true);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }
    try {
      const { data: recent } = await supabase.from('transactions').select('*, lands(block_no, parcel_no)').eq('org_id', userId).order('date', { ascending: false }).limit(5);
      const { data: all } = await supabase.from('transactions').select('amount').eq('org_id', userId);
      if (recent) setTransactions(recent as any);
      if (all) setTotalExpenses(all.reduce((sum, tx) => sum + Number(tx.amount || 0), 0));
    } catch (e) { console.error(e); }
    setIsLoadingTransactions(false);
  }, []);

  const fetchLands = React.useCallback(async () => {
    setIsLoadingLands(true);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setLands([]);
      setTotalArea(0);
      setIsLoadingLands(false);
      return;
    }
    try {
      const { data } = await supabase.from('lands').select('*').eq('org_id', userId);
      if (data) {
        setLands(data as any);
        setTotalArea(data.reduce((sum, land) => sum + Number(land.size_decare || 0), 0));
      }
    } catch (e) { console.error(e); }
    setIsLoadingLands(false);
  }, []);

  const fetchSeasons = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await supabase.from('seasons').select('*').eq('org_id', userId).order('created_at', { ascending: false });
      if (data) {
        setSeasons(data as any);
        setActiveSeason(data.find((s: any) => s.is_active) || data[0] || null);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchIrrigationLogs = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await supabase.from('irrigation_logs').select('*').eq('org_id', userId).order('date', { ascending: false });
      if (data) setIrrigationLogs(data as any);
    } catch (e) { console.error(e); }
  }, []);

  const fetchFieldOperations = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await supabase.from('field_operations').select('*').eq('org_id', userId).order('date', { ascending: false });
      if (data) setFieldOperations(data as any);
    } catch (e) { console.error(e); }
  }, []);

  const fetchScoutingLogs = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await supabase.from('scouting_logs').select('*').eq('org_id', userId).order('date', { ascending: false });
      if (data) setScoutingLogs(data as any);
    } catch (e) { console.error(e); }
  }, []);

  const fetchInventory = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await supabase.from('inventory').select('*').eq('org_id', userId);
      if (data) setInventory(data as any);
    } catch (e) { console.error(e); }
  }, []);

  const syncOfflineData = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    const pendingTxs = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
    const pendingLands = JSON.parse(localStorage.getItem('pending_lands') || '[]');
    const pendingIrrigations = JSON.parse(localStorage.getItem('pending_irrigations') || '[]');
    
    if (pendingTxs.length > 0) {
      const { error } = await supabase.from('transactions').insert(pendingTxs);
      if (!error) localStorage.removeItem('pending_transactions');
    }
    if (pendingLands.length > 0) {
      const { error } = await supabase.from('lands').insert(pendingLands);
      if (!error) localStorage.removeItem('pending_lands');
    }
    if (pendingIrrigations.length > 0) {
      const { error } = await supabase.from('irrigation_logs').insert(pendingIrrigations);
      if (!error) localStorage.removeItem('pending_irrigations');
    }
    if (pendingTxs.length > 0 || pendingLands.length > 0 || pendingIrrigations.length > 0) {
      toast.success("Çevrimdışı veriler eşitlendi!");
      fetchLands(); fetchTransactions(); fetchIrrigationLogs();
    }
  }, [fetchLands, fetchTransactions, fetchIrrigationLogs]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) document.documentElement.classList.add('dark');
    
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const hydrateProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) setUserProfile(data);
      };
      hydrateProfile();
      fetchSeasons(); fetchLands(); fetchTransactions(); fetchIrrigationLogs(); fetchFieldOperations(); fetchScoutingLogs(); fetchInventory();
    }
    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, [syncOfflineData, fetchSeasons, fetchLands, fetchTransactions, fetchIrrigationLogs, fetchFieldOperations, fetchScoutingLogs, fetchInventory]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addLand = async (land: any) => {
    const userId = localStorage.getItem('user_id') || '';
    const tempId = 'temp_' + Date.now();
    
    // DB'ye gönderilecek veri (id YOK — Supabase UUID üretecek)
    const dbPayload = {
      org_id: userId,
      city: land.city,
      district: land.district,
      block_no: land.block_no,
      parcel_no: land.parcel_no,
      size_decare: Number(land.size_decare),
      crop_type: land.crop_type,
      lat: land.lat,
      lng: land.lng,
      boundaries: land.boundaries,
      planting_date: land.planting_date
    };

    // Optimistic Update (geçici ID ile ekrana yansıt)
    setLands(prev => [...prev, { ...dbPayload, id: tempId } as any]);
    setTotalArea(prev => prev + Number(dbPayload.size_decare));

    if (userId) {
      try {
        const { data, error } = await supabase.from('lands').insert([dbPayload]).select().single();
        
        if (error) {
          console.error("Supabase Land Insert Error:", error);
          throw error;
        }

        // Geçici ID'yi gerçek ID ile güncelle
        if (data) {
          setLands(prev => prev.map(l => l.id === tempId ? data : l));
          toast.success("Arazi başarıyla kaydedildi");
        }
      } catch (err: any) {
        if (!navigator.onLine || err.message === 'Failed to fetch') {
          const pendingLands = JSON.parse(localStorage.getItem('pending_lands') || '[]');
          localStorage.setItem('pending_lands', JSON.stringify([...pendingLands, dbPayload]));
          toast.success("Çevrimdışısınız. Arazi cihaza kaydedildi.");
        } else {
          toast.error("Veritabanına kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
          // Hata durumunda rollback
          setLands(prev => prev.filter(l => l.id !== tempId));
          setTotalArea(prev => prev - Number(dbPayload.size_decare));
        }
      }
    }
  };

  const updateLand = async (land: any) => {
    const { id, ...updateData } = land;
    setLands(prev => prev.map(l => l.id === id ? land : l));
    const { error } = await supabase.from('lands').update(updateData).eq('id', id);
    if (error) toast.error("Güncelleme hatası: " + error.message);
    else toast.success("Arazi güncellendi");
  };

  const deleteLand = async (id: string) => {
    const land = lands.find(l => l.id === id);
    if (land) setTotalArea(prev => prev - Number(land.size_decare || 0));
    setLands(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('lands').delete().eq('id', id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("Arazi silindi");
  };

  const addIrrigationLog = async (log: any) => {
    const userId = localStorage.getItem('user_id') || '';
    const tempId = 'temp_' + Date.now();
    const dbPayload = { ...log, org_id: userId, id: tempId };
    
    setIrrigationLogs(prev => [dbPayload, ...prev]);
    
    if (userId) {
      try {
        const { data, error } = await supabase.from('irrigation_logs').insert([{ ...log, org_id: userId }]).select().single();
        if (error) throw error;
        if (data) setIrrigationLogs(prev => prev.map(l => l.id === tempId ? data : l));
        toast.success("Sulama kaydı eklendi");
      } catch (err: any) {
        if (!navigator.onLine || err.message === 'Failed to fetch') {
          const pending = JSON.parse(localStorage.getItem('pending_irrigations') || '[]');
          localStorage.setItem('pending_irrigations', JSON.stringify([...pending, { ...log, org_id: userId }]));
          toast.success("Çevrimdışısınız. Kayıt cihaza eklendi.");
        } else {
          toast.error("Kaydedilemedi: " + err.message);
          setIrrigationLogs(prev => prev.filter(l => l.id !== tempId));
        }
      }
    }
  };

  const addFieldOperation = async (op: any) => {
    const userId = localStorage.getItem('user_id') || '';
    const tempId = 'temp_' + Date.now();
    const dbPayload = { ...op, org_id: userId, id: tempId };
    setFieldOperations(prev => [dbPayload, ...prev]);
    
    // Auto-deduct stock logic
    if (op.inventory_id) {
      const item = inventory.find(i => i.id === op.inventory_id);
      if (item) {
        const newQty = Math.max(0, item.quantity - op.amount);
        updateInventoryItem(item.id, { quantity: newQty });
      }
    }

    if (userId) {
      try {
        const { data, error } = await supabase.from('field_operations').insert([{ ...op, org_id: userId }]).select().single();
        if (error) throw error;
        if (data) setFieldOperations(prev => prev.map(o => o.id === tempId ? data : o));
        toast.success("İşlem kaydedildi");
      } catch (err: any) {
        toast.error("Kaydedilemedi: " + err.message);
        setFieldOperations(prev => prev.filter(o => o.id !== tempId));
      }
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const { error } = await supabase.from('inventory').update(updates).eq('id', id);
    if (error) {
      console.error("Inventory update error:", error);
    }
  };

  const addInventoryItem = async (item: any) => {
    const userId = localStorage.getItem('user_id') || '';
    const tempId = 'temp_' + Date.now();
    const dbPayload = { ...item, org_id: userId, id: tempId };
    setInventory(prev => [...prev, dbPayload]);
    if (userId) {
      try {
        const { data, error } = await supabase.from('inventory').insert([{ ...item, org_id: userId }]).select().single();
        if (error) throw error;
        if (data) setInventory(prev => prev.map(i => i.id === tempId ? data : i));
        toast.success("Ürün envantere eklendi");
      } catch (err: any) {
        toast.error("Kaydedilemedi: " + err.message);
        setInventory(prev => prev.filter(i => i.id !== tempId));
      }
    }
  };

  const deleteInventoryItem = async (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("Ürün silindi");
  };

  const deleteFieldOperation = async (id: string) => {
    setFieldOperations(prev => prev.filter(o => o.id !== id));
    const { error } = await supabase.from('field_operations').delete().eq('id', id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("İşlem silindi");
  };

  const addScoutingLog = async (log: any) => {
    const userId = localStorage.getItem('user_id') || '';
    const tempId = 'temp_' + Date.now();
    const dbPayload = { ...log, org_id: userId, id: tempId };
    setScoutingLogs(prev => [dbPayload, ...prev]);
    if (userId) {
      try {
        const { data, error } = await supabase.from('scouting_logs').insert([{ ...log, org_id: userId }]).select().single();
        if (error) throw error;
        if (data) setScoutingLogs(prev => prev.map(s => s.id === tempId ? data : s));
        toast.success("Gözlem kaydı eklendi");
      } catch (err: any) {
        toast.error("Kaydedilemedi: " + err.message);
        setScoutingLogs(prev => prev.filter(s => s.id !== tempId));
      }
    }
  };

  const deleteScoutingLog = async (id: string) => {
    setScoutingLogs(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('scouting_logs').delete().eq('id', id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("Gözlem kaydı silindi");
  };

  const deleteIrrigationLog = async (id: string) => {
    setIrrigationLogs(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('irrigation_logs').delete().eq('id', id);
    if (error) toast.error("Silme hatası: " + error.message);
    else toast.success("Sulama kaydı silindi");
  };

  const addExpense = async (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string }) => {
    const userId = localStorage.getItem('user_id') || '';
    setTotalExpenses(prev => prev + amount);
    const tempId = 'temp_' + Date.now();

    const newTx: Transaction = { 
      id: tempId, 
      amount, 
      description: category, 
      date, 
      type: 'expense', 
      category: category, 
      land_id, 
      org_id: userId,
      quantity: inventoryData?.quantity,
      unit: inventoryData?.unit
    };
    setTransactions(prev => [newTx, ...prev]);

    if (userId) {
      try {
        const { data, error } = await supabase.from('transactions').insert([{ 
          org_id: userId, 
          amount, 
          description: category, 
          date, 
          land_id, 
          receipt_url, 
          receipt_thumbnail_url,
          category: category,
          type: 'expense',
          quantity: inventoryData?.quantity,
          unit: inventoryData?.unit
        }]).select().single();

        if (error) throw error;
        if (data) setTransactions(prev => prev.map(tx => tx.id === tempId ? data : tx));
        
        // If inventory link is requested, add to inventory
        if (inventoryData) {
          await addInventoryItem(inventoryData);
        }
        
        toast.success("Masraf kaydedildi");
      } catch (err: any) {
        if (!navigator.onLine || err.message === 'Failed to fetch') {
          const txPayload = { 
            org_id: userId, amount, description: category, date, land_id, receipt_url, receipt_thumbnail_url, category: category, type: 'expense',
            quantity: inventoryData?.quantity,
            unit: inventoryData?.unit
          };
          const pendingTxs = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
          localStorage.setItem('pending_transactions', JSON.stringify([...pendingTxs, txPayload]));
          toast.success("Çevrimdışısınız. Masraf cihaza kaydedildi.");
        } else {
          toast.error("Masraf kaydedilemedi: " + err.message);
          setTransactions(prev => prev.filter(tx => tx.id !== tempId));
          setTotalExpenses(prev => prev - amount);
        }
      }
    }
  };

  const updateExpense = async (id: string, updates: any) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    if (updates.amount !== undefined) {
       setTotalExpenses(prev => {
          const oldAmount = transactions.find(t => t.id === id)?.amount || 0;
          return prev - oldAmount + Number(updates.amount);
       });
    }
    const { error } = await supabase.from('transactions').update(updates).eq('id', id);
    if (error) toast.error("İşlem güncellenemedi: " + error.message);
    else toast.success("İşlem başarıyla güncellendi");
  };

  const deleteExpense = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) setTotalExpenses(prev => prev - Number(tx.amount || 0));
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) toast.error("İşlem silinemedi: " + error.message);
    else toast.success("İşlem başarıyla silindi");
  };

  const logSaving = async (amount: number, reason: string) => {
    setTotalSavings(prev => prev + amount);
    const userId = localStorage.getItem('user_id');
    if (userId) await supabase.from('savings_logs').insert([{ user_id: userId, amount, reason, date: new Date().toISOString() }]);
  };

  const startNewSeason = async (name: string, startDate: string, endDate: string) => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      if (activeSeason) await supabase.from('seasons').update({ is_active: false }).eq('id', activeSeason.id);
      const { data, error } = await supabase.from('seasons').insert([{ 
        name, 
        year: new Date(startDate).getFullYear(), 
        start_date: startDate,
        end_date: endDate,
        is_active: true, 
        org_id: userId 
      }]).select();
      if (error) {
        toast.error("Sezon başlatılamadı: " + error.message);
        return;
      }
      if (data) {
        setSeasons(prev => [data[0] as any, ...prev.map(s => ({ ...s, is_active: false }))]);
        setActiveSeason(data[0] as any);
        toast.success("Yeni sezon başlatıldı");
      }
    }
  };

  const toggleSeasonStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('seasons').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast.error("Sezon durumu güncellenemedi: " + error.message);
    } else {
      setSeasons(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success(currentStatus ? "Sezon kapatıldı" : "Sezon açıldı");
      if (activeSeason?.id === id) {
        setActiveSeason({ ...activeSeason, is_active: !currentStatus });
      }
    }
  };

  const requestWeatherAndInsight = async () => {
    let lat = 37.7478, lon = 27.3971;
    if (lands.length > 0 && lands[0].lat && lands[0].lng) { lat = lands[0].lat; lon = lands[0].lng; }
    
    toast.loading("Veriler analiz ediliyor...", { id: 'ai-loading' });
    
    try {
      const weather = await fetchWeather(lat, lon);
      setWeatherData(weather);
      
      const landContexts: LandContext[] = lands.map(land => ({
        cropName: land.crop_type,
        sowingDate: land.planting_date || new Date().toISOString(),
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
        throw new Error(data.error || "AI yanıt vermedi");
      }
    } catch (e: any) { 
      console.error(e); 
      toast.error("Analiz hatası: " + e.message, { id: 'ai-loading' });
    }
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, totalExpenses, totalArea, addExpense, updateExpense, deleteExpense, weather: { temp: weatherData?.temperature || null, windspeed: weatherData?.windSpeed || null, loading: false, error: null }, dailyInsight, criticalAlert, totalSavings, dailySpent, dailyActions, lands, transactions, irrigationLogs, isLoadingLands, isLoadingTransactions, addLand, updateLand, deleteLand, addIrrigationLog, deleteIrrigationLog, logSaving, requestWeatherAndInsight, startNewSeason, toggleSeasonStatus, isDemo: false, isSidebarOpen, setIsSidebarOpen, seasons, activeSeason, setActiveSeason: (s) => setActiveSeason(s), weatherData, currentUserRole, userProfile, fieldOperations, scoutingLogs, addFieldOperation, deleteFieldOperation, addScoutingLog, deleteScoutingLog, inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, isDarkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
