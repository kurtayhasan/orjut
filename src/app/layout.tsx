import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { AppProvider } from "@/context/AppContext";
import { Toaster } from 'sonner';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: "Orjut AgTech OS | Command Center",
  description: "Command Center for modern agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Toaster position="top-center" richColors />
          {children}
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
