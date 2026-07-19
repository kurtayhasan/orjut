'use client';

import { useState, useEffect } from 'react';
import { RevenueCatService } from '@/services/RevenueCatService';
import { CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { isNative } from '@/lib/capacitor';
import { supabase } from '@/lib/supabase/client';

export const useRevenueCat = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebPro, setIsWebPro] = useState(false); // Web'den gelen Pro durumu

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      // 1. ADIM: Her zaman Supabase'den web aboneliğini kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles') // Tablo ismin 'profiles' ise
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (mounted) setIsWebPro(profile?.is_premium || false);
      }

      // 2. ADIM: Sadece native ortamdaysak RevenueCat'i çek
      if (!isNative()) {
        setIsLoading(false);
        return;
      }

      try {
        const info = await RevenueCatService.getCustomerInfo();
        const offs = await RevenueCatService.getOfferings();

        if (mounted) {
          setCustomerInfo(info?.customerInfo || null);
          if (offs?.current) setOfferings([offs.current]);
        }
      } catch (error) {
        console.error("RevenueCat veri çekme hatası:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const purchasePackage = async (pack: any) => {
    try {
      setIsLoading(true);
      const result = await RevenueCatService.purchasePackage(pack);
      if (result && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
      }
      return result;
    } catch (error) {
      console.error("Purchase failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const presentPaywall = async () => {
    try {
      const result = await RevenueCatService.presentPaywall();
      const info = await RevenueCatService.getCustomerInfo();
      if (info?.customerInfo) setCustomerInfo(info.customerInfo);
      return result;
    } catch (error) {
      console.error("Paywall presentation failed", error);
    }
  };

  const presentCustomerCenter = async () => {
    try {
      await RevenueCatService.presentCustomerCenter();
      const info = await RevenueCatService.getCustomerInfo();
      if (info?.customerInfo) setCustomerInfo(info.customerInfo);
    } catch (error) {
      console.error("Customer center presentation failed", error);
    }
  };

  const currentOffering = offerings?.[0] || null;
  const yearlyPackage = currentOffering?.availablePackages.find(p => p.identifier === 'yearly' || p.packageType === 'ANNUAL');
  const monthlyPackage = currentOffering?.availablePackages.find(p => p.identifier === 'monthly' || p.packageType === 'MONTHLY');

  // KRİTİK DEĞİŞİKLİK: isPro mantığını birleştiriyoruz
  const revenueCatIsPro = customerInfo?.entitlements?.active?.['com.orjut.ziraiasistan Pro'] ? true : false;

  return {
    customerInfo,
    offerings,
    currentOffering,
    yearlyPackage,
    monthlyPackage,
    isLoading,
    purchasePackage,
    presentPaywall,
    presentCustomerCenter,
    isPro: isWebPro || revenueCatIsPro,
  };
};