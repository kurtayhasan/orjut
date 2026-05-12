'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Bot, Send, Sparkles, Lock, Crown, Loader2, User, Leaf } from 'lucide-react';
import Card from '@/components/ui/Card';

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

  const handleInteraction = () => {
    if (!isPremium) {
      triggerUpsell();
    }
  };

  return (
    <div className="space-y-6 pb-48">
      {/* Header */}
      <Card padding="md" className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-2xl text-indigo-600">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              Yapay Zekâ Asistanı
              {!isPremium && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Crown size={10} /> Premium
                </span>
              )}
            </h1>
            <p className="text-zinc-500 font-bold text-sm">Kişiselleştirilmiş zirai danışmanlık</p>
          </div>
        </div>
      </Card>

      {/* Chat Container */}
      <div className="relative">
        {/* Premium Lock Overlay */}
        {!isPremium && (
          <div className="absolute inset-0 z-20 rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/80 backdrop-blur-md" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <Lock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
                Premium Özellik
              </h3>
              <p className="text-sm text-zinc-500 font-medium mb-6 max-w-sm">
                Yapay zekâ asistanınızla sohbet etmek için Premium&apos;a yükseltin. Tarlalarınız hakkında kişiselleştirilmiş tavsiyeler alın.
              </p>
              <button
                onClick={triggerUpsell}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Crown size={16} />
                Premium&apos;a Yükselt
              </button>
            </div>
          </div>
        )}

        <Card padding="none" className={`flex flex-col h-[calc(100vh-320px)] min-h-[400px] ${!isPremium ? 'pointer-events-none select-none' : ''}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl flex items-center justify-center">
                  <Sparkles size={32} className="text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-700 dark:text-zinc-300 text-lg mb-1">Merhaba, {userProfile?.first_name || 'Çiftçi'}!</h3>
                  <p className="text-sm text-zinc-500 font-medium max-w-md">
                    Size gübreleme, ilaçlama, sulama ve hasat zamanlaması hakkında kişiselleştirilmiş tavsiyeler verebilirim.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-lg">
                  {[
                    'Buğdayda yaprak sarılığı için ne yapmalıyım?',
                    'Mısır tarlama ne zaman gübre atmalıyım?',
                    'Bu haftaki hava durumuna göre ilaçlama uygun mu?',
                    'Sera domatesimde verim artırmak için öneriler neler?'
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!isPremium) {
                          triggerUpsell();
                          return;
                        }
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
                    >
                      <Leaf size={12} className="inline mr-1.5 text-emerald-500" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-md' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-tl-md'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-md p-4 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span className="text-sm text-zinc-500 font-medium">Düşünüyorum...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={isPremium ? 'Sorunuzu yazın...' : 'Premium gereklidir...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInteraction}
                disabled={!isPremium}
                className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={isPremium ? handleSend : handleInteraction}
                disabled={isLoading || (!isPremium)}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
