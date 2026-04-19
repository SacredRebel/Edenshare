"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import BottomTabs from '@/components/layout/BottomTabs';
import AppHeader from '@/components/layout/AppHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Redirect to onboarding if not completed
    if (!loading && user && profile && !profile.onboarding_completed && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1a10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#0a1a10]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <AppHeader />

        {/* Page content */}
        <main className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom tabs */}
        <BottomTabs />
      </div>
    </div>
  );
}
