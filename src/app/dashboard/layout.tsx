'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomBar from '@/components/BottomBar';
import AuthGuard from '@/components/AuthGuard';
import ExpenseModal from '@/components/forms/ExpenseForm';
import PremiumUpsellModal from '@/components/ui/PremiumUpsellModal';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpenseModalOpen, setIsExpenseModalOpen, showUpsell, closeUpsell } = useAppContext();

  return (
    <AuthGuard>
      <div className="flex flex-col lg:flex-row h-screen bg-bg text-text-primary overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 custom-scrollbar">
            <div className="max-w-[1400px] mx-auto w-full">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>

          {/* Mobile Bottom Bar — hidden on desktop */}
          <BottomBar className="lg:hidden" />
          
          {/* Global Expense Modal */}
          <ExpenseModal 
            isOpen={isExpenseModalOpen} 
            onClose={() => setIsExpenseModalOpen(false)} 
            defaultCategory="Diğer"
          />

          {/* Global Premium Modal */}
          <PremiumUpsellModal
            isOpen={showUpsell}
            onClose={closeUpsell}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
