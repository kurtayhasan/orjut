import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZiraiAsistan by Orjut (Beta v.1)',
    short_name: 'ZiraiAsistan',
    description: 'Gerçek verilerle sıfır kayıp, maksimum hasat. Arazi takip, hasat, verim, gübreleme ve ilaçlama süreçlerinizi yönetin.',
    start_url: '/?source=pwa',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    categories: ['agriculture', 'business', 'productivity'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '720x1280',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ] as any,
  };
}
