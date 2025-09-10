'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:ml-56">
        {/* Mobile header spacing */}
        <div className="lg:hidden h-16"></div>
        <main className="py-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

