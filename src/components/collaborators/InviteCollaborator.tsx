import React, { useState } from 'react';
import { Copy, UserPlus, Check, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

export default function InviteCollaborator({ landId }: { landId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor'); // Default to full access consultant
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate API call to generate token
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/invite/${token}?land=${landId}&role=${role}`;
    
    setInviteLink(link);
    toast.success(`${email} adresine danışman daveti oluşturuldu.`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Bağlantı kopyalandı.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-emerald-100 rounded-2xl p-6 mt-6 space-y-6 shadow-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <GraduationCap size={120} className="text-emerald-900" />
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <GraduationCap size={24} />
        </div>
        <div>
          <h4 className="font-black text-text-primary text-lg flex items-center gap-2">
            Ziraat Mühendisi / Danışman Davet Et
          </h4>
          <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-wider">
            Uzman desteği alarak veriminizi artırın
          </p>
        </div>
      </div>
      
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">E-Posta Adresi</label>
            <input 
              type="email" 
              placeholder="danisman@orjut.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Yetki Seviyesi</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
            >
              <option value="editor">Tam Yetkili Danışman (İşlem Ekleyebilir)</option>
              <option value="viewer">Sadece İzleyici (Gözlem Yapabilir)</option>
            </select>
          </div>
        </div>

        <Button 
          type="submit" 
          fullWidth
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
          leftIcon={<UserPlus size={18} />}
        >
          Danışman Davet Bağlantısı Oluştur
        </Button>
      </form>

      {inviteLink && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
               <ShieldCheck size={12} /> Bağlantı Hazır
            </span>
            <span className="text-[9px] font-bold text-emerald-600/60 uppercase">Bu linki kopyalayıp mühendisinize gönderin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-[10px] font-mono text-emerald-800 truncate select-all">
              {inviteLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className={cn(
                "p-2.5 rounded-lg transition-all shrink-0",
                copied ? "bg-emerald-500 text-white" : "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
              )}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-emerald-600/5 border border-emerald-600/10 flex items-center gap-3">
         <div className="p-2 bg-emerald-600/10 text-emerald-600 rounded-lg">
            <ShieldCheck size={16} />
         </div>
         <p className="text-[11px] font-bold text-emerald-900 leading-tight">
            Mühendisiniz tarlanızı gerçek zamanlı takip edebilir, zirai tavsiyeler verebilir ve işlem kayıtlarınızı optimize edebilir.
         </p>
      </div>
    </div>
  );
}
