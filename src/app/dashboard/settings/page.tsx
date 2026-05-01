'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Settings as SettingsIcon, Bell, Shield, User, Smartphone, LogOut, ChevronRight, Check, Globe, Moon } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/notifications';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { lang, setLang } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{name: string, phone: string} | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name') || 'Kullanıcı';
    const phone = localStorage.getItem('user_phone') || '05XX XXX XX XX';
    setUserProfile({ name, phone });
  }, []);

  const handleNotificationToggle = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success("Bildirimler başarıyla aktif edildi.");
      }
    } catch (err) {
      toast.error("Bildirim izni alınamadı.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    toast.success("Başarıyla çıkış yapıldı.");
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-48">
      {/* Header */}
      <header className="flex items-center gap-4 bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="bg-zinc-100 p-3 rounded-2xl text-zinc-600">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Ayarlar & Profil</h1>
          <p className="text-zinc-500 font-medium text-sm">Hesabınızı ve uygulama tercihlerini yönetin</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
            <h3 className="text-lg font-black text-zinc-900">{userProfile?.name}</h3>
            <p className="text-sm text-zinc-500 font-medium mb-6">{userProfile?.phone}</p>
            <div className="pt-6 border-t border-zinc-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Pro Üyelik</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-3xl font-bold text-sm hover:bg-rose-100 transition-all border-2 border-rose-100"
          >
            <LogOut size={18} /> Oturumu Kapat
          </button>
        </div>

        {/* Settings Sections */}
        <div className="md:col-span-2 space-y-4">
          {/* Notifications */}
          <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Bell size={20} />
                </div>
                <h4 className="font-bold text-zinc-900">Bildirim Ayarları</h4>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="font-bold text-sm text-zinc-900">Anlık Bildirimler</p>
                <p className="text-xs text-zinc-500 font-medium">Hava durumu ve kritik uyarılar</p>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  notificationsEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                }`}
              >
                {notificationsEnabled ? <><Check size={14} /> Aktif</> : 'Etkinleştir'}
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Globe size={20} />
              </div>
              <h4 className="font-bold text-zinc-900">Uygulama Tercihleri</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="font-bold text-sm text-zinc-900">Uygulama Dili</p>
                  <p className="text-xs text-zinc-500 font-medium">Platform dilini değiştirin</p>
                </div>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as 'tr' | 'en')}
                  className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-sm font-bold outline-none"
                >
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 opacity-50 cursor-not-allowed">
                <div>
                  <p className="font-bold text-sm text-zinc-900 text-zinc-400">Koyu Tema (Yakında)</p>
                  <p className="text-xs text-zinc-400 font-medium">Gece modu deneyimi</p>
                </div>
                <Moon size={20} className="text-zinc-300" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Shield size={20} />
              </div>
              <h4 className="font-bold text-zinc-900">Güvenlik & Veri</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-700">Bağlı Cihazlar</span>
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500" />
              </div>
              <div className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-700">Şifre Değiştir</span>
                </div>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
