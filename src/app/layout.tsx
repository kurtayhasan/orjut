import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { AppProvider } from "@/context/AppContext";
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: "ZiraiAsistan by Orjut (Beta v.1) | Akıllı Tarım Uygulaması",
  description: "Arazi takip, hasat, verim, gübreleme ve ilaçlama süreçlerinizi gerçek verilerle yönetin. Sıfır kayıp, maksimum hasat için hemen başlayın.",
  keywords: ["arazi takip", "hasat", "verim", "gübreleme", "ilaçlama", "akıllı tarım", "ZiraiAsistan", "Orjut"],
  openGraph: {
    title: "ZiraiAsistan by Orjut | Akıllı Tarım Uygulaması",
    description: "Yapay zeka destekli arazi, gübreleme, ilaçlama ve hasat takip uygulaması.",
    type: "website",
    locale: "tr_TR",
    siteName: "ZiraiAsistan by Orjut",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProvider>
          <Toaster position="top-center" richColors />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
