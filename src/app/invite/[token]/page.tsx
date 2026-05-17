'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { UserCheck, ShieldAlert, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string; // Represents engineerId

  const [engineer, setEngineer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadEngineer() {
      if (!token) return;
      try {
        const { data, error } = await db.getProfile(token);
        if (error || !data) {
          toast.error("Geçersiz davet bağlantısı.");
          router.push('/');
          return;
        }
        if (data.role !== 'engineer') {
          toast.error("Bu kullanıcı bir mühendis değil.");
          router.push('/');
          return;
        }
        setEngineer(data);
      } catch (err) {
        toast.error("Davet bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }
    loadEngineer();
  }, [token, router]);

  const handleAcceptInvite = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      // Save for post-login auto-binding
      localStorage.setItem('pending_invite_engineer_id', token);
      toast.info("Lütfen bağlantıyı tamamlamak için önce giriş yapın.");
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Guard against duplicate association (Phase 3 Rule 2)
      const { data: existing, error: checkError } = await db.getClients(token);
      
      // Let's verify if the farmer already has an active engineer
      const { data: farmerRelations } = await db.getPendingRequests(userId); // wait, or query engineer_clients directly
      const { data: allRelations } = await (db as any).from('engineer_clients')
        .select('*')
        .eq('farmer_id', userId)
        .eq('status', 'approved');

      if (allRelations && allRelations.length > 0) {
        toast.error("Zaten aktif bir mühendis danışmanınız bulunuyor. Bir çiftçi sadece bir mühendise bağlı olabilir.");
        router.push('/dashboard');
        return;
      }

      // 2. Insert approved relation
      const { error: insertError } = await (db as any).from('engineer_clients').insert([{
        engineer_id: token,
        farmer_id: userId,
        status: 'approved'
      }]);

      if (insertError) throw insertError;

      toast.success('Mühendisiniz başarıyla atandı.');
      localStorage.removeItem('pending_invite_engineer_id');
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Invite binding failed:", err);
      toast.error("Bağlantı kurulurken bir hata oluştu: " + (err?.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#050505]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm text-text-muted font-bold">Davet bilgileri doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#050505] p-6">
      <Card padding="lg" className="max-w-md w-full border-none shadow-2xl space-y-6 text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg rotate-3 relative">
          <Sparkles className="absolute -top-1 -right-1 text-amber-500 animate-pulse" size={20} />
          <UserCheck size={40} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Danışmanlık Daveti</h2>
          <p className="text-sm font-bold text-text-secondary leading-relaxed">
            Ziraat Mühendisi <span className="font-black text-indigo-600 dark:text-indigo-400">{engineer?.first_name} {engineer?.last_name}</span> sizi danışan portföyüne eklemek istiyor.
          </p>
        </div>

        <div className="p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest">
            <ShieldAlert size={14} className="text-amber-500" /> Bağlantı Ayrıcalıkları
          </div>
          <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 list-disc list-inside font-bold">
            <li>Mühendisiniz arazilerinizi ve işlemlerinizi gözlemleyebilir.</li>
            <li>Size özel zirai reçeteler ve ilaçlama/gübreleme tavsiyeleri hazırlayabilir.</li>
            <li>Verilerinizi dilediğiniz zaman koruma altında tutabilirsiniz.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            fullWidth 
            size="lg" 
            isLoading={isProcessing} 
            disabled={isProcessing}
            onClick={handleAcceptInvite}
            rightIcon={<ArrowRight size={18} />}
          >
            Daveti Kabul Et & Başla
          </Button>
          <Button 
            fullWidth 
            variant="ghost" 
            onClick={() => router.push('/')}
            disabled={isProcessing}
          >
            Reddet / Ana Sayfaya Dön
          </Button>
        </div>
      </Card>
    </div>
  );
}
