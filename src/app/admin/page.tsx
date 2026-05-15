'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Users, Map, Star, Shield, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { userRole, isLoadingLands } = useAppContext();
  const router = useRouter();
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalLands: 0, totalPremium: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingLands && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [m, p] = await Promise.all([
          db.getSystemMetrics(),
          db.getAllProfiles()
        ]);
        setMetrics(m);
        if (p.data) setUsers(p.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'admin') fetchAdminData();
  }, [userRole, isLoadingLands, router]);

  if (userRole !== 'admin') return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} leftIcon={<ArrowLeft size={18} />}>
            Panel&apos;e Dön
          </Button>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield className="text-emerald-500" /> Sistem Yönetimi
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Users size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Toplam Kullanıcı</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalUsers}</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Star size={18} className="text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest">Premium Abone</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalPremium}</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Map size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Toplam Arazi</span>
          </div>
          <p className="text-4xl font-black">{metrics.totalLands}</p>
        </Card>
      </div>

        <Card className="overflow-hidden border-none shadow-xl">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="text-amber-500" size={20} /> Bekleyen Hasat Pro Onayları
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">2 Bekleyen</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Kullanıcı</th>
                  <th className="px-6 py-4">Tutar / Plan</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    Bekleyen Hasat Pro onay talebi bulunmamaktadır.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold">Tüm Kullanıcılar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-6 py-4">İsim</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{u.first_name} {u.last_name}</td>
                    <td className="px-6 py-4 text-zinc-500">{u.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-600' : 
                        u.role === 'engineer' ? 'bg-indigo-100 text-indigo-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_premium ? (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                          <Star size={12} /> PRO
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs font-bold">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  );
}
