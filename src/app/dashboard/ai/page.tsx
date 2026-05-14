'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  Bot, Send, Sparkles, Lock, Crown, 
  Loader2, User, Leaf, MessageSquare, 
  ChevronRight, BrainCircuit, Lightbulb
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const { isPremium, triggerUpsell, lands, userProfile } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isPremium) {
      triggerUpsell();
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId: localStorage.getItem('user_id'),
          lands: lands.map(l => ({ crop_type: l.crop_type, city: l.city, size_decare: l.size_decare }))
        })
      });

      const data = await res.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response || 'Üzgünüm, şu an yanıt veremedim. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'Buğdayda yaprak sarılığı için ne yapmalıyım?',
    'Mısır tarlama ne zaman gübre atmalıyım?',
    'Bu haftaki hava durumuna göre ilaçlama uygun mu?',
    'Hasat zamanını nasıl belirlemeliyim?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-100 p-3 rounded-xl text-primary">
            <BrainCircuit size={28} />
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Akıllı Asistan</h1>
                {!isPremium && (
                  <span className="bg-amber-400 text-[#1B2E1C] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Crown size={12} /> PRO
                  </span>
                )}
             </div>
             <p className="text-text-muted font-bold text-sm">Zirai verilerinizle beslenen yapay zekâ danışmanınız.</p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 relative min-h-0">
        {!isPremium && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-surface/40 backdrop-blur-md rounded-2xl border border-border/50">
             <Card padding="lg" className="max-w-md w-full text-center space-y-6 shadow-2xl border-primary/20">
                <div className="w-16 h-16 bg-amber-400 text-[#1B2E1C] rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3">
                   <Lock size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black font-heading text-text-primary mb-2 tracking-tight">Yapay Zekâ Kilidini Aç</h3>
                   <p className="text-sm font-bold text-text-muted leading-relaxed">
                      Tarlalarınızın verilerini analiz eden ve size özel öneriler sunan akıllı asistana sadece Premium üyeler erişebilir.
                   </p>
                </div>
                <Button fullWidth size="lg" className="bg-amber-400 text-[#1B2E1C] hover:bg-amber-500 border-none" onClick={triggerUpsell}>
                   <Crown size={20} className="mr-2" /> Premium&apos;a Yükselt
                </Button>
             </Card>
          </div>
        )}

        <Card padding="none" className="h-full flex flex-col overflow-hidden border-border relative">
           {/* Messages Container */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10 opacity-80">
                   <div className="relative">
                      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
                      <Sparkles size={48} className="text-primary relative" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black font-heading text-text-primary">Nasıl Yardımcı Olabilirim?</h3>
                      <p className="text-sm font-bold text-text-muted max-w-sm mx-auto">
                         Aşağıdaki konularda veya aklınıza takılan herhangi bir zirai soruda bana danışabilirsiniz.
                      </p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                      {suggestions.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => { setInput(s); inputRef.current?.focus(); }}
                          className="p-4 bg-white border border-border rounded-xl text-xs font-bold text-text-primary text-left hover:border-primary hover:text-primary transition-all flex items-center justify-between group shadow-sm"
                        >
                           <span className="flex items-center gap-2">
                              <Lightbulb size={14} className="text-amber-500" /> {s}
                           </span>
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 items-start",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                     msg.role === 'assistant' ? "bg-primary text-white" : "bg-surface-3 text-text-primary border border-border"
                   )}>
                      {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                   </div>
                   <div className={cn(
                     "max-w-[85%] md:max-w-[70%] p-5 rounded-2xl text-sm font-bold leading-relaxed shadow-sm",
                     msg.role === 'user' 
                       ? "bg-primary text-white rounded-tr-none" 
                       : "bg-white text-text-primary border border-border rounded-tl-none"
                   )}>
                      {msg.content}
                   </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Bot size={20} />
                   </div>
                   <div className="bg-white text-text-primary border border-border rounded-2xl rounded-tl-none p-5 flex items-center gap-3 shadow-sm">
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span className="text-sm font-bold text-text-muted">Analiz ediyorum...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Container */}
           <div className="p-4 border-t border-border bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              <div className="max-w-4xl mx-auto flex gap-2">
                 <input 
                   ref={inputRef}
                   type="text" 
                   className="flex-1 bg-surface-2 border border-border rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-text-primary placeholder:text-text-muted disabled:opacity-50"
                   placeholder={isPremium ? "Bir soru sorun (Örn: Domateste mildiyö için ne yapmalıyım?)" : "Sohbet için Premium'a geçin"}
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   disabled={!isPremium}
                 />
                 <Button 
                   onClick={handleSend}
                   disabled={!input.trim() || isLoading || !isPremium}
                   className="shrink-0 px-6"
                 >
                    <Send size={20} />
                 </Button>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
