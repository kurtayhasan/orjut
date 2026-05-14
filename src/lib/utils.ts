import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class birleştirme — her component kullanacak
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Para birimi formatlama
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Tarih formatlama
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// Kısa tarih
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr));
}

// Dönüm formatlama
export function formatArea(decare: number): string {
  if (decare >= 100) return `${(decare / 10).toFixed(1)} hektar`; // 100 dekar = 10 hektar. Correction: 1 hektar = 10 dekar. So decare / 10.
  return `${decare} dönüm`;
}
