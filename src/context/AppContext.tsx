'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { buildAIPrompt, LandContext } from '@/lib/aiActionEngine';
import { Transaction, Land, Season, Profile, CategoryTotals } from '@/types';


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
  addExpense: (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string) => Promise<void>;
  weather: { temp: number | null, windspeed: number | null, loading: boolean, error: string | null };
  dailyInsight: string | null;
  criticalAlert: string | null;
  totalSavings: number;
  dailySpent: number;
  dailyActions: number;
  lands: Land[];
  transactions: Transaction[];
  isLoadingLands: boolean;
  isLoadingTransactions: boolean;
  addLand: (land: any) => Promise<void>;
  updateLand: (land: any) => Promise<void>;
  deleteLand: (id: string) => Promise<void>;
  logSaving: (amount: number, reason: string) => Promise<void>;
  requestWeatherAndInsight: () => Promise<void>;
  startNewSeason: (name: string, startDate: string, endDate: string) => Promise<void>;
  isDemo: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  seasons: Season[];
  activeSeason: Season | null;
  setActiveSeason: (season: Season) => void;
  weatherData: WeatherData | null;
  currentUserRole: 'owner' | 'editor' | 'viewer';
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'editor' | 'viewer'>('owner');
  const [isLoadingLands, setIsLoadingLands] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const syncOfflineData = React.useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    const pendingTxs = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
    const pendingLands = JSON.parse(localStorage.getItem('pending_lands') || '[]');
    if (pendingTxs.length > 0) {
      const { error } = await supabase.from('transactions').insert(pendingTxs);
      if (!error) localStorage.removeItem('pending_transactions');
    }
    if (pendingLands.length > 0) {
      const { error } = await supabase.from('lands').insert(pendingLands);
      if (!error) localStorage.removeItem('pending_lands');
    }
    if (pendingTxs.length > 0 || pendingLands.length > 0) {
      toast.success("Çevrimdışı veriler eşitlendi!");
      fetchLands(); fetchTransactions();
    }
  }, [fetchLands, fetchTransactions]);

  useEffect(() => {
    fetchSeasons(); fetchLands(); fetchTransactions();
    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, [syncOfflineData, fetchSeasons, fetchLands, fetchTransactions]);

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
        toast.error("Veritabanına kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
        // Hata durumunda rollback
        setLands(prev => prev.filter(l => l.id !== tempId));
        setTotalArea(prev => prev - Number(dbPayload.size_decare));
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

  const addExpense = async (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string) => {
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
      org_id: userId
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
          type: 'expense'
        }]).select().single();

        if (error) throw error;
        if (data) setTransactions(prev => prev.map(tx => tx.id === tempId ? data : tx));
        toast.success("Masraf kaydedildi");
      } catch (err: any) {
        toast.error("Masraf kaydedilemedi: " + err.message);
        setTransactions(prev => prev.filter(tx => tx.id !== tempId));
        setTotalExpenses(prev => prev - amount);
      }
    }
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
      const { data, error } = await supabase.from('seasons').insert([{ name, year: new Date(startDate).getFullYear(), is_active: true, org_id: userId }]).select();
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
    <AppContext.Provider value={{ lang, setLang, t, totalExpenses, totalArea, addExpense, weather: { temp: weatherData?.temperature || null, windspeed: weatherData?.windSpeed || null, loading: false, error: null }, dailyInsight, criticalAlert, totalSavings, dailySpent, dailyActions, lands, transactions, isLoadingLands, isLoadingTransactions, addLand, updateLand, deleteLand, logSaving, requestWeatherAndInsight, startNewSeason, isDemo: false, isSidebarOpen, setIsSidebarOpen, seasons, activeSeason, setActiveSeason: (s) => setActiveSeason(s), weatherData, currentUserRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
