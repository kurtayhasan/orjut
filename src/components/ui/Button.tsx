'use client';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

const buttonVariants = cva(
  // Base — tüm varyantlarda ortak
  [
    'inline-flex items-center justify-center gap-2',
    'font-bold rounded-md',
    'transition-all duration-150 ease-out',
    'active:scale-[0.97]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    // Touch hedefi garantisi
    'min-h-[var(--touch-target)]',
  ],
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-dark shadow-sm',
        secondary: 'bg-primary-100 text-primary-dark hover:bg-primary-100/80',
        outline:   'border-2 border-primary text-primary bg-transparent hover:bg-primary-50',
        ghost:     'text-primary bg-transparent hover:bg-primary-50',
        danger:    'bg-danger text-white hover:bg-red-700 shadow-sm',
        neutral:   'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border',
      },
      size: {
        sm:  'h-9 px-3 text-sm min-h-[36px]',      // Yardımcı aksiyon
        md:  'h-11 px-4 text-base min-h-[44px]',   // Standart
        lg:  'h-13 px-5 text-lg min-h-[52px]',     // Birincil aksiyon
        xl:  'h-15 px-6 text-xl min-h-[60px]',     // Mobil CTA
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  variant, size, fullWidth,
  isLoading, leftIcon, rightIcon,
  children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
