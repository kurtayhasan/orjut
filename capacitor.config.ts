import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orjut.app',
  appName: 'Orjut',
  webDir: 'out',
  server: {
    url: 'https://orjut.com',
    cleartext: true
  }
};

export default config;
