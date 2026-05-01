'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Settings as SettingsIcon, Bell, Shield, User, Smartphone } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/notifications';

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleNotificationToggle = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white/50 p-8">
      <h1 className="text-3xl font-bold text-zinc-800 mb-6">Settings</h1>
      
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <Bell className="text-zinc-600" />
        <div className="flex-1 text-left">
          <p className="font-medium text-zinc-800">Push Notifications</p>
          <p className="text-sm text-zinc-500">Stay updated with latest alerts</p>
        </div>
        <button
          onClick={handleNotificationToggle}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          {notificationsEnabled ? 'Enabled' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
