import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

import { AppProvider } from "@/context/AppContext";
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: "Orjut AgTech OS | Akıllı Tarım İşletim Sistemi",
  description: "Çiftçiler ve ziraat mühendisleri için sıfır veri kaybı, maksimum hasat. Yapay zeka destekli uydu takibi, masraf ve arazi yönetim platformu.",
  keywords: ["Tarım yazılımı", "Zirai Takip", "Çiftçi Uygulaması", "Tarım ERP", "Akıllı Tarım", "Arazi Yönetimi", "NDVI Takibi"],
  metadataBase: new URL('https://orjut.com'),
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Orjut AgTech',
  },
  openGraph: {
    title: "Orjut AgTech OS | Akıllı Tarım İşletim Sistemi",
    description: "Sıfır veri kaybı, maksimum hasat. Tarımsal işletmenizi dijital güçle yönetin.",
    type: "website",
    locale: "tr_TR",
    siteName: "Orjut AgTech",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Orjut AgTech OS Dashboard'
      }
    ]
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Orjut AgTech OS",
  "applicationCategory": "AgTech, BusinessApplication",
  "operatingSystem": "Web, Android, iOS",
  "description": "Yapay zeka destekli arazi, gübreleme, ilaçlama ve hasat takip uygulaması.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TRY"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="theme-color" content="#050505" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased selection:bg-emerald-500/30">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        <AppProvider>
          <Toaster position="top-center" richColors theme="dark" />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
