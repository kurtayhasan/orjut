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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
