'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';

interface InviteCollaboratorProps {
  engineerId: string;
}

export default function InviteCollaborator({ engineerId }: InviteCollaboratorProps) {
  const [copied, setCopied] = useState(false);

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invite?engineerId=${engineerId}`;
  };

  const handleCopy = async () => {
    const url = getInviteUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Davet linki panoya kopyalandı!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Link kopyalanamadı, lütfen manuel kopyalayın.");
    }
  };

  return (
    <Card className="p-6 border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/10 dark:border-indigo-900/30">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Çiftçilerinizi Sisteme Davet Edin</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Aşağıdaki benzersiz davet linkini çiftçilerinizle paylaşarak onları doğrudan danışan portföyünüze ekleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <span className="text-xs font-semibold truncate flex-1 px-2 text-zinc-600 dark:text-zinc-400">
            {getInviteUrl()}
          </span>
          <Button 
            size="sm" 
            variant={copied ? "primary" : "outline"} 
            className="shrink-0 min-h-[36px] px-3 font-black text-xs" 
            onClick={handleCopy}
          >
            {copied ? (
              <span className="flex items-center gap-1"><Check size={14} /> Kopyalandı</span>
            ) : (
              <span className="flex items-center gap-1"><Copy size={14} /> Linki Kopyala</span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
          <Info size={12} />
          <span>Çiftçi bu linke tıkladığında oturum açarak sizinle otomatik olarak eşleşecektir.</span>
        </div>
      </div>
    </Card>
  );
}
