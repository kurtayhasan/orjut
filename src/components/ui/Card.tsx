import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CardProps as BaseCardProps } from '@/types';

const cardVariants = cva(
  'bg-surface/60 backdrop-blur-xl border border-white/5 rounded-lg shadow-sm overflow-hidden relative',
  {
    variants: {
      padding: {
        none: '',
        sm:   'p-3',
        md:   'p-4',
        lg:   'p-6',
      },
      hoverable: {
        true:  'cursor-pointer transition-all duration-300 active:scale-[0.99] hover:shadow-primary/10 hover:border-primary/30 hover:bg-surface/80',
        false: '',
      },
      status: {
        default: '',
        success: 'border-l-4 border-l-success',
        warning: 'border-l-4 border-l-warning',
        danger:  'border-l-4 border-l-danger',
        info:    'border-l-4 border-l-info',
      },
    },
    defaultVariants: { padding: 'md', hoverable: false, status: 'default' },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export default function Card({ padding, hoverable, status, className, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ padding, hoverable, status }), className)}
      {...props}
    />
  );
}
