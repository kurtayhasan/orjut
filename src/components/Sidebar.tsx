'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { 
  Leaf, LayoutDashboard, Map as MapIcon, Box, Wallet, Settings, CalendarDays, LogOut, Droplet, ClipboardCheck 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isSidebarOpen, setIsSidebarOpen } = useAppContext();

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
      
      <aside className={`fixed inset-y-0 left-0 z-[2000] w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg border border-emerald-200 flex items-center justify-center">
          <Leaf size={18} className="text-emerald-700" />
        </div>
        <span className="font-semibold text-zinc-800 tracking-tight">ZiraiAsistan by Orjut</span>
      </div>
      
      <div className="p-4">
        <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3 px-3">Menü</p>
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

      <div className="mt-auto p-4 border-t border-zinc-100 space-y-1">
        <SidebarItem href="/dashboard/settings" icon={<Settings size={18} />} label={t('settings')} active={pathname.includes('/settings')} />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={18} />
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
        ? 'bg-zinc-100 text-zinc-900' 
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
    }`}>
      <span className={active ? 'text-zinc-900' : 'text-zinc-500'}>{icon}</span>
      {label}
    </Link>
  );
}
