import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZiraiAsistan by Orjut (Beta v.1)',
    short_name: 'ZiraiAsistan',
    description: 'Gerçek verilerle sıfır kayıp, maksimum hasat. Arazi takip, hasat, verim, gübreleme ve ilaçlama süreçlerinizi yönetin.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    categories: ['agriculture', 'business', 'productivity'],
    icons: [
      {
        src: 'https://www.orjut.com/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://www.orjut.com/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://www.orjut.com/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: 'https://www.orjut.com/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: 'https://www.orjut.com/screenshot-mobile.png',
        sizes: '720x1280',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}
