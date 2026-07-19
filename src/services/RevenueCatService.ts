import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { isNative, getPlatform } from '@/lib/capacitor';

export const RevenueCatService = {
  async init(appUserId?: string) {
    if (!isNative()) {
      console.log('RevenueCat init skipped (Web/SSR environment).');
      return;
    }

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

      const platform = getPlatform();
      let apiKey = '';

      if (platform === 'ios') {
        apiKey = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || ''; // TODO: Set this in .env
      } else if (platform === 'android') {
        apiKey = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || ''; // TODO: Set this in .env
      }

      if (!apiKey) {
        console.warn(`RevenueCat API Key not found for platform: ${platform}`);
        return;
      }

      if (appUserId) {
        await Purchases.configure({ apiKey, appUserID: appUserId });
      } else {
        await Purchases.configure({ apiKey });
      }

      console.log('RevenueCat initialized successfully for', platform);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  },

  async getOfferings() {
    if (!isNative()) return null;
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      return null;
    }
  },

  async purchasePackage(packageToBuy: any) {
    if (!isNative()) return null;
    try {
      const purchaseResult = await Purchases.purchasePackage({ aPackage: packageToBuy });
      return purchaseResult;
    } catch (error) {
      console.error('Failed to purchase package:', error);
      throw error;
    }
  },

  async getCustomerInfo() {
    if (!isNative()) return null;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to fetch customer info:', error);
      return null;
    }
  },
  
  async logIn(appUserId: string) {
      if (!isNative()) return null;
      try {
          const result = await Purchases.logIn({ appUserID: appUserId });
          return result;
      } catch (error) {
          console.error('Failed to log in RevenueCat:', error);
          return null;
      }
  },
  
  async logOut() {
      if (!isNative()) return null;
      try {
          const customerInfo = await Purchases.logOut();
          return customerInfo;
      } catch (error) {
          console.error('Failed to log out RevenueCat:', error);
          return null;
      }
  },

  async presentPaywall() {
      if (!isNative()) return null;
      try {
          const result = await RevenueCatUI.presentPaywall();
          return result;
      } catch (error) {
          console.error('Failed to present paywall:', error);
          throw error;
      }
  },

  async presentCustomerCenter() {
      if (!isNative()) return null;
      try {
          const result = await RevenueCatUI.presentCustomerCenter();
          return result;
      } catch (error) {
          console.error('Failed to present customer center:', error);
          throw error;
      }
  }
};
