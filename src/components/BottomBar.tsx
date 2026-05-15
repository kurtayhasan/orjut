'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Plus, Wallet, Map, LayoutDashboard, 
  MoreHorizontal, Tractor, ClipboardCheck, 
  Droplets, X, Sprout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import BaseModal from './ui/BaseModal';
import Button from './ui/Button';

export default function BottomBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsExpenseModalOpen, setIsSidebarOpen } = useAppContext();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const tabs = [
    { label: 'Ana Sayfa', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Arazi', icon: Map, href: '/dashboard/lands' },
    { label: 'FAB', icon: Plus, isFab: true },
    { label: 'Finans', icon: Wallet, href: '/dashboard/finance' },
    { label: 'Daha', icon: MoreHorizontal, isMore: true },
  ];

  const handleFabClick = () => setIsActionSheetOpen(true);
  
  // PHASE 1: Open Sidebar instead of pushing to settings
  const handleMoreClick = () => {
    setIsSidebarOpen(true);
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg lg:hidden pb-safe",
        className
      )}>
        <div className="h-[64px] flex items-center justify-around px-2 relative">
          {tabs.map((tab, i) => {
            if (tab.isFab) {
              return (
                <div key={i} className="relative -top-5">
                  <button 
                    onClick={handleFabClick}
                    className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 active:scale-90 transition-transform border-4 border-surface"
                    aria-label="Hızlı İşlem Ekle"
                  >
                    <Plus size={32} />
                  </button>
                </div>
              );
            }

            const isActive = tab.href === pathname || (tab.href !== '/dashboard' && tab.href && pathname.startsWith(tab.href));
            const Icon = tab.icon;

            return (
              <button
                key={i}
                onClick={() => tab.isMore ? handleMoreClick() : tab.href && router.push(tab.href)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
                  isActive ? "text-primary" : "text-text-muted"
                )}
              >
                <div className="relative">
                  <Icon size={24} />
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAB ACTION SHEET */}
      <BaseModal 
        isOpen={isActionSheetOpen} 
        onClose={() => setIsActionSheetOpen(false)}
        title="Hızlı İşlem Ekle"
      >
        <div className="grid grid-cols-1 gap-3 py-2">
          <Button 
            variant="neutral" 
            fullWidth 
            size="lg"
            className="justify-start px-6 min-h-[56px]"
            leftIcon={<div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet size={20} /></div>}
            onClick={() => { setIsActionSheetOpen(false); setIsExpenseModalOpen(true); }}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold">Yeni Masraf Kaydet</span>
              <span className="text-xs text-text-muted font-medium">Gübre, ilaç, mazot vb.</span>
            </div>
          </Button>

          <Button 
            variant="neutral" 
            fullWidth 
            size="lg"
            className="justify-start px-6 min-h-[56px]"
            leftIcon={<div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Tractor size={20} /></div>}
            onClick={() => { setIsActionSheetOpen(false); router.push('/dashboard/operations?new=true'); }}
          >
             <div className="flex flex-col items-start">
              <span className="font-bold">Zirai İşlem Ekle</span>
              <span className="text-xs text-text-muted font-medium">Ekim, ilaçlama, hasat</span>
            </div>
          </Button>

          <Button 
            variant="neutral" 
            fullWidth 
            size="lg"
            className="justify-start px-6 min-h-[56px]"
            leftIcon={<div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ClipboardCheck size={20} /></div>}
            onClick={() => { setIsActionSheetOpen(false); router.push('/dashboard/scouting'); }}
          >
             <div className="flex flex-col items-start">
              <span className="font-bold">Arazi Gözlemi Yap</span>
              <span className="text-xs text-text-muted font-medium">Not al, fotoğraf çek</span>
            </div>
          </Button>

          <Button 
            variant="neutral" 
            fullWidth 
            size="lg"
            className="justify-start px-6 min-h-[56px]"
            leftIcon={<div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><Droplets size={20} /></div>}
            onClick={() => { setIsActionSheetOpen(false); router.push('/dashboard/irrigation'); }}
          >
             <div className="flex flex-col items-start">
              <span className="font-bold">Sulama Takibi</span>
              <span className="text-xs text-text-muted font-medium">Sulama verisi ekle</span>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            fullWidth 
            size="lg" 
            className="mt-4 text-danger font-black min-h-[48px]"
            onClick={() => setIsActionSheetOpen(false)}
          >
            İptal
          </Button>
        </div>
      </BaseModal>
    </>
  );
}
