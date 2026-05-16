'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Users, ArrowLeft, Search, Plus, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';

export default function EngineerDashboard() {
  const { userRole, isLoadingProfile, setSelectedClientId, userProfile } = useAppContext();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = async () => {
    if (!userProfile?.id) return;
    try {
      const { data, error } = await db.getClients(userProfile.id);
      if (error) throw error;
      // Filter only approved clients for the relationship audit (Stage 2)
      setClients((data || []).filter((link: any) => link.status === 'approved'));
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Çiftçi listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoadingProfile) return; // Wait for profile fetch to complete

    if (userRole !== 'engineer') {
      router.push('/dashboard');
      return;
    }

    fetchClients();
  }, [userRole, isLoadingProfile, router, userProfile?.id]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userRole !== 'engineer') return null;

  const handleSelectClient = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    toast.success(`${clientName} seçildi. Panele yönlendiriliyorsunuz...`);
    router.push('/dashboard/lands'); // Redirect to lands to see their plots
  };

  const filteredClients = clients.filter(link => {
    const c = link.farmer;
    if (!c) return false;
    return (
      c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    );
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} leftIcon={<ArrowLeft size={18} />}>
            Kendi Panelime Dön
          </Button>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" /> Danışan Çiftçilerim
          </h1>
        </div>
        <Button 
          leftIcon={<Plus size={18} />}
          onClick={() => router.push('/dashboard/settings')} // Settings usually handles invitations
        >
          Yeni Çiftçi Ekle
        </Button>
      </header>

      <Card className="p-6 border-none shadow-xl">
        <div className="mb-6">
          <Input 
            placeholder="İsim veya telefon numarası ile çiftçi ara..." 
            leftIcon={<Search size={18} />}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              title={searchQuery ? "Sonuç Bulunamadı" : "Henüz Danışan Çiftçiniz Bulunmuyor"} 
              description={searchQuery 
                ? "Arama kriterlerinizi değiştirin." 
                : "Sisteme henüz atanmış bir çiftçiniz bulunmuyor. Ayarlar kısmından çiftçilerinizi davet edebilirsiniz."} 
              emoji={searchQuery ? "🔍" : "👨‍🌾"}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map(link => {
              const client = link.farmer;
              if (!client) return null;
              return (
                <div 
                  key={client.id} 
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex justify-between items-center group"
                  onClick={() => handleSelectClient(client.id, `${client.first_name} ${client.last_name}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                      {client.first_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <MapPin size={12} /> {client.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white rounded-lg transition-all">
                      Yönet
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
