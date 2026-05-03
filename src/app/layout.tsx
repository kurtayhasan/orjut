import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { AppProvider } from "@/context/AppContext";
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: "ZiraiAsistan by Orjut | Akıllı Tarım İşletim Sistemi",
  description: "Çiftçiler ve ziraat mühendisleri için sıfır veri kaybı, maksimum hasat. Uydu destekli sulama, masraf ve arazi takip sistemi.",
  keywords: ["Tarım yazılımı", "Zirai Takip", "Çiftçi Uygulaması", "Tarım ERP", "Akıllı Tarım", "Arazi Yönetimi"],
  metadataBase: new URL('https://orjut.com'),
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZiraiAsistan',
  },
  openGraph: {
    title: "ZiraiAsistan by Orjut | Akıllı Tarım İşletim Sistemi",
    description: "Çiftçiler ve ziraat mühendisleri için sıfır veri kaybı, maksimum hasat. Uydu destekli sulama, masraf ve arazi takip sistemi.",
    type: "website",
    locale: "tr_TR",
    siteName: "ZiraiAsistan by Orjut",
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ZiraiAsistan by Orjut",
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
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        <AppProvider>
          <Toaster position="top-center" richColors />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
