'use client';
import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function BaseModal({
  isOpen, onClose, title, children, footer, size = 'md'
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape ile kapat
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Android geri butonu desteği
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    window.history.pushState({ modal: true }, '');
    const handlePop = () => onClose();
    window.addEventListener('popstate', handlePop);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePop);
    };
  }, [isOpen, handleKeyDown, onClose]);

  // Body scroll kilitle
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const maxWidthClass = { sm: 'md:max-w-sm', md: 'md:max-w-md', lg: 'md:max-w-lg' }[size];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay is now part of the parent container to simplify stacking */}
      <div
        className="absolute inset-0 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={cn(
        // Mobil: tam genişlik, alttan
        'relative w-full bg-surface',
        'rounded-t-2xl md:rounded-xl',
        'max-h-[92vh] flex flex-col',
        'animate-slide-up md:animate-scale-in',
        // Desktop: ortalanmış
        'md:mx-4', maxWidthClass
      )}>

        {/* Handle bar — sadece mobil */}
        <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-border-strong" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 id="modal-title" className="text-lg font-bold text-text-primary font-heading">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors min-h-[var(--touch-target-sm)] min-w-[var(--touch-target-sm)] flex items-center justify-center"
              aria-label="Kapat"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-border pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
