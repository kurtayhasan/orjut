import Button from '@/components/ui/Button';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;           // Alternatif emoji ikon
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon, emoji, title, description, actionLabel, onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-4">
        {emoji ? (
          <span className="text-6xl" aria-hidden="true">{emoji}</span>
        ) : Icon ? (
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <Icon size={32} className="text-primary" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-bold text-text-primary font-heading mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-base text-text-secondary max-w-xs mb-6">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
