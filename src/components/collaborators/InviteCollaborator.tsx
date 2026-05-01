import React, { useState } from 'react';
import { Copy, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteCollaborator({ landId }: { landId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate API call to generate token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/invite/${token}`;
    
    setInviteLink(link);
    toast.success(`${email} adresine davet oluşturuldu.`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Bağlantı kopyalandı.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-4 mt-4 space-y-4 shadow-sm">
      <h4 className="font-bold text-zinc-800 flex items-center gap-2">
        <UserPlus size={18} /> Yeni Ortak Davet Et
      </h4>
      
      <form onSubmit={handleInvite} className="space-y-3">
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="E-posta adresi" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="viewer">Sadece İzleyici</option>
            <option value="editor">Düzenleyici</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full bg-zinc-900 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-zinc-800 transition-colors"
        >
          Davet Bağlantısı Oluştur
        </button>
      </form>

      {inviteLink && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <p className="text-xs font-mono text-emerald-800 truncate">{inviteLink}</p>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 bg-emerald-200 text-emerald-800 hover:bg-emerald-300 rounded-md transition-colors shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
