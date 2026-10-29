import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { EvidenceDrawer } from '../modals/EvidenceDrawer';
import { ContextualAIDrawer } from '../modals/ContextualAIDrawer';
import { HowScoreModal } from '../modals/HowScoreModal';
import { AuthModal } from '../modals/AuthModal';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface AppShellProps {
  children: React.ReactNode;
  headerActionSlot?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, headerActionSlot }) => {
  return (
    <div className="flex h-screen w-full bg-[#F7F8FC] dark:bg-[#080D1C] overflow-hidden text-[#111936] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header actionSlot={headerActionSlot} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals & Drawers */}
      <EvidenceDrawer />
      <ContextualAIDrawer />
      <HowScoreModal />
      <AuthModal />
    </div>
  );
};
