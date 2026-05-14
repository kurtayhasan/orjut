import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"], 
  variable: '--font-heading',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

const nunitoSans = Nunito_Sans({ 
  subsets: ["latin"], 
  variable: '--font-body',
  weight: ['400', '600', '700'],
  display: 'swap',
});

import { AppProvider } from "@/context/AppContext";
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2D7A3A',
};

export const metadata: Metadata = {
  title: "Orjut ZiraiAsistan | Profesyonel Tarım Yönetim Sistemi",
  description: "Türk çiftçisi için geliştirilmiş en gelişmiş tarım takip platformu. Arazi yönetimi, masraf takibi ve yapay zeka destekli zirai danışmanlık.",
  keywords: ["Tarım yazılımı", "Zirai Takip", "Çiftçi Uygulaması", "Tarım ERP", "Akıllı Tarım", "Arazi Yönetimi", "Masraf Takibi"],
  metadataBase: new URL('https://orjut.com'),
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Orjut ZiraiAsistan',
  },
  openGraph: {
    title: "Orjut ZiraiAsistan | Profesyonel Tarım Yönetim Sistemi",
    description: "Tarlanızdan kazancınıza kadar her şey kontrolünüzde. Türk çiftçisinin dijital iş ortağı.",
    type: "website",
    locale: "tr_TR",
    siteName: "Orjut ZiraiAsistan",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Orjut ZiraiAsistan Dashboard'
      }
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased font-body">
        <ServiceWorkerRegister />
        <AppProvider>
          <Toaster position="top-center" richColors theme="light" closeButton />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
