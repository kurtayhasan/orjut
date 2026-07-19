import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  if (typeof window === 'undefined') return false; // Ensure we are not on SSR
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  if (typeof window === 'undefined') return 'web';
  return Capacitor.getPlatform();
};
