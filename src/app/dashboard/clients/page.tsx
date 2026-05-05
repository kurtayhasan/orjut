'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/db';
import { Users, UserPlus, Search, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

export default function ClientManagement() {
  const { userRole, selectedClientId, setSelectedClientId } = useAppContext();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [addingClient, setAddingClient] = useState(false);

  const fetchClients = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const { data } = await db.getClients(userId);
      if (data) setClients(data);
    } catch (err) {
      console.error("Fetch clients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'engineer') fetchClients();
  }, [userRole]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (!userId || !searchPhone) return;

    setAddingClient(true);
    try {
      await db.addClientRequest(userId, searchPhone);
      toast.success("Erişim talebi gönderildi.");
      setSearchPhone('');
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Talep gönderilemedi.");
    } finally {
      setAddingClient(false);
    }
  };

  if (userRole !== 'engineer') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Müşteri Yönetimi</h1>
            <p className="text-zinc-500 font-medium text-sm">Danışmanlık verdiğiniz çiftçileri yönetin</p>
          </div>
        </div>
        
        <form onSubmit={handleAddClient} className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Telefon No (Örn: +905...)"
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            className="!rounded-xl min-w-[200px]"
          />
          <Button type="submit" isLoading={addingClient} leftIcon={<UserPlus size={18} />}>
            Ekle
          </Button>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest ml-1">Müşteri Listesi</h2>
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Yükleniyor...</div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map(c => (
                <Card 
                  key={c.id} 
                  className={`p-6 cursor-pointer transition-all border-2 ${
                    selectedClientId === c.farmer_id 
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                    : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
                  }`}
                  onClick={() => {
                    setSelectedClientId(selectedClientId === c.farmer_id ? null : c.farmer_id);
                    toast.info(selectedClientId === c.farmer_id ? "Kendi hesabınıza dönüldü." : `${c.farmer.first_name} hesabına geçiş yapıldı.`);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-lg">
                      {c.farmer.first_name[0]}{c.farmer.last_name[0]}
                    </div>
                    {c.status === 'approved' ? (
                      <span className="text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                        <CheckCircle2 size={12} /> Onaylı
                      </span>
                    ) : (
                      <span className="text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                        <Clock size={12} /> Bekliyor
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black">{c.farmer.first_name} {c.farmer.last_name}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{c.farmer.phone}</p>
                  
                  {c.status === 'approved' && (
                    <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Panele Git</span>
                      <ArrowRight size={14} className={selectedClientId === c.farmer_id ? 'text-emerald-500' : ''} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 font-medium">Henüz bir müşteri bulunmuyor. Sağ üstten telefon numarasıyla davet gönderebilirsiniz.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-indigo-600 text-white">
            <h3 className="text-lg font-black mb-2">Nasıl Çalışır?</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              Müşterinizin telefon numarasını girerek erişim talebi gönderin. Çiftçi onayladıktan sonra, kartına tıklayarak onun hesabını yönetmeye başlayabilirsiniz.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                <CheckCircle2 size={14} /> Tüm arazileri görüntüle
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                <CheckCircle2 size={14} /> İşlem ve masraf kaydet
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                <CheckCircle2 size={14} /> AI analizleri talep et
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
