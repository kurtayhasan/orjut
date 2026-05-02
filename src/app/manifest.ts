import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZiraiAsistan by Orjut (Beta v.1)',
    short_name: 'ZiraiAsistan',
    description: 'Gerçek verilerle sıfır kayıp, maksimum hasat.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
