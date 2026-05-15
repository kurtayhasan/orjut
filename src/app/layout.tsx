import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
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
    <html lang="tr" className={`${jakarta.variable} ${inter.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased font-body bg-[#050505]">
        <ServiceWorkerRegister />
        <AppProvider>
          <Toaster position="top-center" richColors theme="dark" closeButton style={{ zIndex: 10000 }} />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
