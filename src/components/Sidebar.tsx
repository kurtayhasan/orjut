'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { 
  LayoutDashboard, Map, Wallet, Package, 
  Droplets, Bot, BarChart3, Settings, 
  LogOut, ClipboardCheck, CalendarDays, 
  Users, Shield, Crown, Tractor, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, userRole, isPremium, userProfile, clearAllData } = useAppContext();

  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    localStorage.clear();
    clearAllData();
    window.location.href = '/'; 
    toast.success("Başarıyla çıkış yapıldı.");
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Sayfa' },
    { href: '/dashboard/lands', icon: Map, label: 'Arazilerim' },
    { href: '/dashboard/finance', icon: Wallet, label: 'Finans' },
    { href: '/dashboard/inventory', icon: Package, label: 'Stok' },
    { href: '/dashboard/operations', icon: Tractor, label: 'İşlemler' },
    { href: '/dashboard/scouting', icon: ClipboardCheck, label: 'Arazi Gözlemi' },
    { href: '/dashboard/irrigation', icon: Droplets, label: 'Sulama' },
    { href: '/dashboard/seasons', icon: CalendarDays, label: 'Sezonlar' },
    { href: '/dashboard/ai', icon: Bot, label: 'AI Asistan', badge: !isPremium ? 'PRO' : undefined },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={closeSidebar}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-[#1B2E1C] flex flex-col shrink-0 h-full transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:z-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        className
      )}>
        {/* LOGO AREA */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#1B2E1C]">
              <span className="font-black text-xl">O</span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-black text-white tracking-tight">ORJUT</span>
              <span className="text-[9px] font-bold text-primary-light uppercase tracking-widest">ZiraiAsistan</span>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                href={item.href} 
                icon={item.icon} 
                label={item.label} 
                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                badge={item.badge}
                onClick={closeSidebar}
              />
            ))}
            
            {userRole === 'engineer' && (
              <SidebarItem 
                href="/dashboard/clients" 
                icon={Users} 
                label="Müşterilerim" 
                active={pathname.includes('/clients')} 
                onClick={closeSidebar}
              />
            )}
            {userRole === 'admin' && (
              <SidebarItem 
                href="/admin" 
                icon={Shield} 
                label="Sistem Yönetimi" 
                active={pathname === '/admin'} 
                onClick={closeSidebar}
              />
            )}
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
              {userProfile?.first_name?.[0] || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'Kullanıcı'}
              </span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider",
                isPremium ? "text-amber-400" : "text-white/40"
              )}>
                {isPremium ? 'Premium Üye' : 'Ücretsiz Üye'}
              </span>
            </div>
          </div>

          <SidebarItem href="/dashboard/settings" icon={Settings} label="Ayarlar" active={pathname.includes('/settings')} onClick={closeSidebar} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-bold text-rose-400 hover:bg-rose-500/10 group"
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon: Icon, label, href, active, badge, onClick }: { icon: any, label: string, href: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-bold",
        active 
          ? 'bg-primary text-white shadow-lg shadow-black/20' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon size={20} className={active ? 'text-white' : 'text-white/40'} />
      <span className="truncate">{label}</span>
      {badge && (
        <span className="ml-auto px-1.5 py-0.5 bg-amber-400 text-[#1B2E1C] text-[8px] font-black rounded uppercase tracking-wider flex items-center gap-0.5">
          <Crown size={8} />
          {badge}
        </span>
      )}
    </Link>
  );
}
