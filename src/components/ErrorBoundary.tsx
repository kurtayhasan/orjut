'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-3xl gap-3 text-center my-6">
          <p className="text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest">
            ⚠️ Bu bileşen yüklenirken bir hata oluştu
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium max-w-md">
            Lütfen sayfayı yenilemeyi deneyin veya verilerin tam girildiğinden emin olun.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
