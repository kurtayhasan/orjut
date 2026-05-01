'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchWeather, WeatherData } from '@/lib/weatherService';
import { buildAIPrompt, LandContext } from '@/lib/aiActionEngine';
import { Transaction, Land, Season, Profile, CategoryTotals } from '@/types';

const IS_DEMO = false;

const MOCK_LANDS = [
  { id: '1', name: 'Pamuk Tarlası', city: 'Aydın', district: 'Söke', block_no: '101', parcel_no: '5', size_decare: 45, crop_type: 'Pamuk', org_id: 'demo', lat: 37.7478, lng: 27.3971, planting_date: '2026-03-15', expected_yield: 18000, expected_price: 35 },
  { id: '2', name: 'Buğday Tarlası', city: 'Konya', district: 'Ereğli', block_no: '205', parcel_no: '12', size_decare: 30, crop_type: 'Buğday', org_id: 'demo', lat: 37.5133, lng: 34.0467, planting_date: '2025-10-15', expected_yield: 15000, expected_price: 11 },
  { id: '3', name: 'Mısır Tarlası', city: 'Adana', district: 'Seyhan', block_no: '110', parcel_no: '8', size_decare: 75, crop_type: 'Mısır', org_id: 'demo', lat: 36.9914, lng: 35.3308, planting_date: '2026-04-10', expected_yield: 75000, expected_price: 9 }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 1200, description: 'Gübre Alımı', date: new Date().toISOString(), type: 'expense', category: 'Gübre', land_id: '1', org_id: 'demo', lands: { block_no: '101', parcel_no: '5' } },
  { id: 't2', amount: 850, description: 'Mazot', date: new Date().toISOString(), type: 'expense', category: 'Mazot', land_id: '2', org_id: 'demo', lands: { block_no: '205', parcel_no: '12' } },
  { id: 't3', amount: 3000, description: 'Tohum', date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', category: 'Diğer', land_id: '3', org_id: 'demo', lands: { block_no: '110', parcel_no: '8' } }
];

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

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    const userId = localStorage.getItem('user_id');
    if (IS_DEMO || !userId) {
      setTransactions(MOCK_TRANSACTIONS);
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
  };

  const fetchLands = async () => {
    setIsLoadingLands(true);
    const userId = localStorage.getItem('user_id');
    if (IS_DEMO || !userId) {
      setLands(MOCK_LANDS as any);
      setTotalArea(MOCK_LANDS.reduce((sum, l) => sum + l.size_decare, 0));
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
  };

  const fetchSeasons = async () => {
    const userId = localStorage.getItem('user_id');
    if (IS_DEMO || !userId) return;
    try {
      const { data } = await supabase.from('seasons').select('*').eq('org_id', userId).order('created_at', { ascending: false });
      if (data) {
        setSeasons(data as any);
        setActiveSeason(data.find((s: any) => s.is_active) || data[0] || null);
      }
    } catch (e) { console.error(e); }
  };

  const syncOfflineData = async () => {
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
  };

  useEffect(() => {
    fetchSeasons(); fetchLands(); fetchTransactions();
    window.addEventListener('online', syncOfflineData);
    return () => window.removeEventListener('online', syncOfflineData);
  }, []);

  const addLand = async (land: any) => {
    const userId = localStorage.getItem('user_id');
    const newLand = { ...land, id: land.id || Math.random().toString(), org_id: userId };
    setLands(prev => [...prev, newLand]);
    setTotalArea(prev => prev + Number(land.size_decare || 0));

    if (!IS_DEMO && userId) {
      try {
        await supabase.from('lands').insert([{ ...land, org_id: userId }]);
        toast.success("Arazi eklendi");
      } catch (err) {
        const pending = JSON.parse(localStorage.getItem('pending_lands') || '[]');
        localStorage.setItem('pending_lands', JSON.stringify([...pending, { ...land, org_id: userId }]));
        toast.warning("Çevrimdışı kaydedildi");
      }
    }
  };

  const updateLand = async (land: any) => {
    setLands(prev => prev.map(l => l.id === land.id ? land : l));
    if (!IS_DEMO) await supabase.from('lands').update(land).eq('id', land.id);
    toast.success("Arazi güncellendi");
  };

  const deleteLand = async (id: string) => {
    const land = lands.find(l => l.id === id);
    if (land) setTotalArea(prev => prev - Number(land.size_decare || 0));
    setLands(prev => prev.filter(l => l.id !== id));
    if (!IS_DEMO) await supabase.from('lands').delete().eq('id', id);
    toast.success("Arazi silindi");
  };

  const addExpense = async (amount: number, category: string, date: string, land_id: string, receipt_url?: string, receipt_thumbnail_url?: string) => {
    const userId = localStorage.getItem('user_id');
    setTotalExpenses(prev => prev + amount);
    const newTx: Transaction = { 
      id: Math.random().toString(), 
      amount, 
      description: category, 
      date, 
      type: 'expense', 
      category: category, 
      land_id, 
      org_id: userId || 'pending' 
    };
    setTransactions(prev => [newTx, ...prev].slice(0, 5));

    if (!IS_DEMO && userId) {
      try {
        await supabase.from('transactions').insert([{ org_id: userId, amount, description: category, date, land_id, receipt_url, receipt_thumbnail_url }]);
        toast.success("Masraf eklendi");
      } catch (err) {
        const pending = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
        localStorage.setItem('pending_transactions', JSON.stringify([...pending, { org_id: userId, amount, description: category, date, land_id }]));
      }
    }
  };

  const logSaving = async (amount: number, reason: string) => {
    setTotalSavings(prev => prev + amount);
    const userId = localStorage.getItem('user_id');
    if (!IS_DEMO && userId) await supabase.from('savings_logs').insert([{ user_id: userId, amount, reason, date: new Date().toISOString() }]);
  };

  const startNewSeason = async (name: string, startDate: string, endDate: string) => {
    const userId = localStorage.getItem('user_id');
    if (!IS_DEMO && userId) {
      if (activeSeason) await supabase.from('seasons').update({ is_active: false }).eq('id', activeSeason.id);
      const { data } = await supabase.from('seasons').insert([{ name, year: new Date(startDate).getFullYear(), is_active: true, org_id: userId }]).select();
      if (data) {
        setSeasons(prev => [data[0] as any, ...prev.map(s => ({ ...s, is_active: false }))]);
        setActiveSeason(data[0] as any);
      }
    }
    toast.success("Yeni sezon başlatıldı");
  };

  const requestWeatherAndInsight = async () => {
    let lat = 37.7478, lon = 27.3971;
    if (lands.length > 0 && lands[0].lat && lands[0].lng) { lat = lands[0].lat; lon = lands[0].lng; }
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
      if (data.success) setDailyInsight(data.insight);
    } catch (e) { console.error(e); }
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, totalExpenses, totalArea, addExpense, weather: { temp: weatherData?.temperature || null, windspeed: weatherData?.windSpeed || null, loading: false, error: null }, dailyInsight, criticalAlert, totalSavings, dailySpent, dailyActions, lands, transactions, isLoadingLands, isLoadingTransactions, addLand, updateLand, deleteLand, logSaving, requestWeatherAndInsight, startNewSeason, isDemo: IS_DEMO, isSidebarOpen, setIsSidebarOpen, seasons, activeSeason, setActiveSeason: (s) => setActiveSeason(s), weatherData, currentUserRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
