'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Simulate verifying token and adding user to land_collaborators
    const verifyToken = async () => {
      try {
        // mock delay
        await new Promise(r => setTimeout(r, 1500));
        setStatus('success');
        toast.success("Davet başarıyla kabul edildi!");
        setTimeout(() => {
          router.push('/dashboard/lands');
        }, 2000);
      } catch (err) {
        setStatus('error');
      }
    };
    verifyToken();
  }, [params.token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-xl font-bold text-zinc-900">Davetiniz Kontrol Ediliyor...</h1>
            <p className="text-zinc-500">Lütfen bekleyin.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-black text-zinc-900">Araziye Katıldınız!</h1>
            <p className="text-zinc-500 font-medium">Ortak arazi paneline yönlendiriliyorsunuz...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <XCircle size={64} className="text-rose-500 mx-auto" />
            <h1 className="text-2xl font-black text-zinc-900">Geçersiz Davet</h1>
            <p className="text-zinc-500 font-medium">Bu davet bağlantısı geçersiz veya süresi dolmuş olabilir.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
