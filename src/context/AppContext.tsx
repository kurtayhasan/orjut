'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { useUILogic } from './hooks/useUILogic';
import { useAuthLogic } from './hooks/useAuthLogic';
import { useFarmLogic } from './hooks/useFarmLogic';
import { useFinanceLogic } from './hooks/useFinanceLogic';
import { useAppSync } from './hooks/useAppSync';
import { useRevenueCat } from '@/hooks/useRevenueCat';

import { translations, Language } from '@/lib/translations';
import { Transaction, Land, Season, Profile, IrrigationLog, FieldOperation, ScoutingLog, InventoryItem } from '@/types';
import { WeatherData } from '@/lib/weatherService';

export type AppContextType = {
  lang: Language; setLang: (lang: Language) => void; t: (key: keyof typeof translations['en']) => string;
  isSidebarOpen: boolean; setIsSidebarOpen: (isOpen: boolean) => void;
  isDarkMode: boolean; toggleDarkMode: () => void;
  showUpsell: boolean; triggerUpsell: () => void; closeUpsell: () => void;
  isExpenseModalOpen: boolean; setIsExpenseModalOpen: (isOpen: boolean) => void;

  currentUserRole: 'owner' | 'editor' | 'viewer';
  isLoadingProfile: boolean;
  userProfile: Profile | null;
  userRole: 'farmer' | 'engineer' | 'admin';
  selectedClientId: string | null; setSelectedClientId: (id: string | null) => void;
  activeOrgId: string | null;
  isPremium: boolean;
  isDemo: boolean;
  presentPaywall?: () => Promise<any>;
  refreshProfile: (force?: boolean) => Promise<void>;
  syncNow: () => Promise<void>;

  lands: Land[]; addLand: (land: any) => Promise<void>; updateLand: (land: any) => Promise<void>; deleteLand: (id: string) => Promise<void>;
  totalArea: number;
  seasons: Season[]; activeSeason: Season | null; setActiveSeason: (season: Season) => void;
  isLoadingLands: boolean;
  weatherData: WeatherData | null;
  weather: { temp: number | null, windspeed: number | null, humidity: number | null, condition: string, loading: boolean, error: string | null };
  dailyInsight: string | null; criticalAlert: string | null;
  isAnalyzing: boolean;
  fieldOperations: FieldOperation[]; addFieldOperation: (op: any) => Promise<void>; deleteFieldOperation: (id: string) => Promise<void>;
  scoutingLogs: ScoutingLog[]; addScoutingLog: (log: any) => Promise<void>; updateScoutingLog: (id: string, updates: Partial<ScoutingLog>) => Promise<void>; updateScoutingPrescription: (id: string, isApplied: boolean, text?: string) => Promise<void>; deleteScoutingLog: (id: string) => Promise<void>;
  irrigationLogs: IrrigationLog[]; addIrrigationLog: (log: any) => Promise<void>; deleteIrrigationLog: (id: string) => Promise<void>;
  startNewSeason: (name: string, startDate: string, endDate: string) => Promise<void>; toggleSeasonStatus: (id: string, currentStatus: boolean) => Promise<void>;
  requestWeatherAndInsight: () => Promise<void>; getAiHistory: (landId: string) => Promise<any[]>;

  transactions: Transaction[]; addExpense: (amount: number, category: string, date: string, land_id: string, description: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: { name: string, type: string, quantity: number, unit: string, id?: string }, season_id?: string, hybridData?: { appliedAmount: number, landId: string, type: string }) => Promise<void>; updateExpense: (id: string, updates: any) => Promise<void>; deleteExpense: (id: string) => Promise<void>;
  totalExpenses: number; totalSavings: number; dailySpent: number;
  inventory: InventoryItem[]; addInventoryItem: (item: any) => Promise<void>; updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>; deleteInventoryItem: (id: string) => Promise<void>;
  isLoadingTransactions: boolean; isLoadingInventory: boolean;
  calculateUnitCost: (amount: number, quantity: number) => number;
  logSaving: (amount: number, reason: string) => Promise<void>;
  clearAllData: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const ui = useUILogic();
  const auth = useAuthLogic();
  const revenueCat = useRevenueCat();
  
  // Finance needs Farm's addFieldOperation for hybrid transactions
  // Farm needs Finance's inventory update for stock reduction
  // We wire them up here to resolve circular dependencies:
  
  const finance = useFinanceLogic(auth.activeOrgId, null);
  const farm = useFarmLogic(auth.activeOrgId, auth.userProfile, finance.inventory, finance.updateInventoryItem);
  
  const addExpenseWithHybrid = useCallback((amount: number, category: string, date: string, land_id: string, description: string, receipt_url?: string, receipt_thumbnail_url?: string, inventoryData?: any, season_id?: string, hybridData?: any) => {
    return finance.addExpense(amount, category, date, land_id, description, receipt_url, receipt_thumbnail_url, inventoryData, season_id || farm.activeSeason?.id, hybridData, farm.addFieldOperation);
  }, [finance, farm.activeSeason, farm.addFieldOperation]);

  // Sync Logic
  useAppSync(
    auth.activeOrgId, auth.authSession, 
    auth.setUserProfile, auth.setUserRole,
    farm.setLands, farm.setTotalArea, finance.setTransactions, farm.setSeasons, farm.setActiveSeason,
    farm.setIrrigationLogs, farm.setFieldOperations, farm.setScoutingLogs, finance.setInventory,
    finance.setTotalExpenses, finance.setDailySpent,
    farm.setIsLoadingLands, finance.setIsLoadingTransactions, finance.setIsLoadingInventory
  );

  const clearAllData = useCallback(() => {
    farm.setLands([]);
    finance.setTransactions([]);
    finance.setInventory([]);
    farm.setFieldOperations([]);
    farm.setScoutingLogs([]);
    farm.setIrrigationLogs([]);
    farm.setSeasons([]);
    farm.setActiveSeason(null);
    finance.setTotalExpenses(0);
    farm.setTotalArea(0);
    finance.setTotalSavings(0);
    finance.setDailySpent(0);
    farm.setDailyInsight(null);
    farm.setCriticalAlert(null);
    auth.setUserProfile(null);
  }, [farm, finance, auth]);

  const syncNow = useCallback(async () => {
    toast.loading("Veriler senkronize ediliyor...", { id: 'sync-now' });
    try {
      await auth.refreshProfile();
      if (typeof window !== 'undefined') window.location.reload(); 
      toast.success("Senkronizasyon tamamlandı", { id: 'sync-now' });
    } catch (err) {
      toast.error("Senkronizasyon başarısız", { id: 'sync-now' });
    }
  }, [auth]);

  const presentPaywallWrapper = useCallback(async () => {
    const { isNative } = await import('@/lib/capacitor');
    if (isNative()) {
      return revenueCat.presentPaywall();
    } else {
      ui.triggerUpsell();
    }
  }, [revenueCat.presentPaywall, ui]);

  const value = useMemo(() => {
    return {
      ...ui,
      ...auth,
      ...farm,
      ...finance,
      isPremium: revenueCat.isPro,
      presentPaywall: presentPaywallWrapper,
      addExpense: addExpenseWithHybrid,
      syncNow,
      clearAllData,
      weather: { temp: farm.weatherData?.temperature ?? null, windspeed: farm.weatherData?.windSpeed ?? null, humidity: farm.weatherData?.humidity ?? null, condition: farm.weatherData?.condition ?? 'Bilinmiyor', loading: false, error: null }
    };
  }, [ui, auth, farm, finance, revenueCat.isPro, presentPaywallWrapper, addExpenseWithHybrid, syncNow, clearAllData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
