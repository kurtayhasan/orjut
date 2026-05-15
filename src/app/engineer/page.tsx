'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Users, ArrowLeft, Search, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';

export default function EngineerDashboard() {
  const { userRole, isLoadingLands, setSelectedClientId } = useAppContext();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoadingLands && userRole !== 'engineer') {
      router.push('/dashboard');
      return;
    }

    const fetchClients = async () => {
      try {
        // Mock fetch for engineer's clients. In a real scenario, this would filter by engineer_id.
        const { data } = await db.getAllProfiles();
        if (data) {
           // For mock purposes, an engineer sees farmers.
           setClients(data.filter((u: any) => u.role === 'farmer'));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'engineer') fetchClients();
  }, [userRole, isLoadingLands, router]);

  if (userRole !== 'engineer') return null;

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    toast.success("Çiftçi seçildi. Panele yönlendiriliyorsunuz...");
    router.push('/dashboard');
  };

  const filteredClients = clients.filter(c => 
    c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} leftIcon={<ArrowLeft size={18} />}>
            Kendi Panelime Dön
          </Button>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" /> Çiftçilerim
          </h1>
        </div>
        <Button leftIcon={<Plus size={18} />}>Yeni Çiftçi Ekle</Button>
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
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredClients.length === 0 ? (
          <EmptyState 
            title={searchQuery ? "Sonuç Bulunamadı" : "Henüz Çiftçiniz Yok"} 
            description={searchQuery ? "Arama kriterlerinizi değiştirin." : "Sisteme henüz atanmış bir çiftçiniz bulunmuyor. Yeni bir çiftçi davet edebilirsiniz."} 
            emoji={searchQuery ? "🔍" : "👨‍🌾"}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map(client => (
              <div 
                key={client.id} 
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex justify-between items-center"
                onClick={() => handleSelectClient(client.id)}
              >
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{client.first_name} {client.last_name}</h3>
                  <p className="text-xs text-zinc-500">{client.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded">Görüntüle</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
