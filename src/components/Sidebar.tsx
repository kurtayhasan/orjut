'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { 
  Leaf, LayoutDashboard, Map as MapIcon, Box, Wallet, Settings, CalendarDays, LogOut, Droplet, ClipboardCheck, Sun, Moon 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isSidebarOpen, setIsSidebarOpen, isDarkMode, toggleDarkMode } = useAppContext();

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    toast.success("Başarıyla çıkış yapıldı.");
    router.push('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1999] md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-[2000] w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 h-full transform transition-all duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tighter text-lg leading-none block">ORJUT</span>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">ZiraiAsistan</span>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-4 px-3">Ana Menü</p>
        <nav className="flex flex-col gap-1 w-full">
          <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label={t('dashboard')} active={pathname === '/dashboard'} />
          <SidebarItem href="/dashboard/seasons" icon={<CalendarDays size={18} />} label="Sezonlar" active={pathname.includes('/seasons')} />
          <SidebarItem href="/dashboard/lands" icon={<MapIcon size={18} />} label={t('lands')} active={pathname.includes('/lands')} />
          <SidebarItem href="/dashboard/operations" icon={<Droplet size={18} />} label="Zirai İşlemler" active={pathname.includes('/operations')} />
          <SidebarItem href="/dashboard/scouting" icon={<ClipboardCheck size={18} />} label="Arazi Kontrolü" active={pathname.includes('/scouting')} />
          <SidebarItem href="/dashboard/inventory" icon={<Box size={18} />} label={t('inventory')} active={pathname.includes('/inventory')} />
          <SidebarItem href="/dashboard/finance" icon={<Wallet size={18} />} label={t('finance')} active={pathname.includes('/finance')} />
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
        <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex">
          <button
            onClick={() => !isDarkMode && toggleDarkMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${isDarkMode ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Moon size={14} />
            Karanlık
          </button>
          <button
            onClick={() => isDarkMode && toggleDarkMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isDarkMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Sun size={14} />
            Aydınlık
          </button>
        </div>
        
        <SidebarItem href="/dashboard/settings" icon={<Settings size={18} />} label={t('settings')} active={pathname.includes('/settings')} />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          Çıkış Yap
        </button>
      </div>
    </aside>
    </>
  );
}

function SidebarItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      active 
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
    }`}>
      <span className={active ? 'text-zinc-900 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-500'}>{icon}</span>
      {label}
    </Link>
  );
}
