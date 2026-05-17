'use client';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  as?: 'input' | 'select' | 'textarea';
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, as = 'input', children, ...props }, ref) => {
    const inputId = id || props.name || `input-${Math.random().toString(36).slice(2)}`;
    const inputName = props.name || inputId;
    const errorId = `${inputId}-error`;
    const hintId  = `${inputId}-hint`;

    const baseClassName = cn(
      // Base
      'w-full rounded-md bg-surface-2 border-2 border-border',
      'text-base text-text-primary placeholder:text-text-muted',
      'min-h-[var(--touch-target)] py-3 px-4',
      'transition-colors duration-150',
      // Focus
      'focus:outline-none focus:border-border-focus focus:bg-surface',
      // Error
      error && 'border-danger focus:border-danger bg-danger-bg',
      // Disabled
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Icon padding
      leftIcon   && 'pl-10',
      rightElement && 'pr-10',
      className
    );

    const renderInput = () => {
      switch (as) {
        case 'select':
          return (
            <select
              ref={ref as any}
              id={inputId}
              name={inputName}
              aria-label={label || props.placeholder}
              className={cn(baseClassName, 'appearance-none cursor-pointer')}
              {...(props as any)}
            >
              {children}
            </select>
          );
        case 'textarea':
          return (
            <textarea
              ref={ref as any}
              id={inputId}
              name={inputName}
              aria-label={label || props.placeholder}
              className={cn(baseClassName, 'min-h-[100px] resize-none')}
              {...(props as any)}
            />
          );
        default:
          return (
            <input
              ref={ref as any}
              id={inputId}
              name={inputName}
              aria-label={label || props.placeholder}
              className={baseClassName}
              {...(props as any)}
            />
          );
      }
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-text-primary"
          >
            {label}
            {props.required && (
              <span className="text-danger ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          {renderInput()}

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              {rightElement}
            </div>
          )}
          
          {as === 'select' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
