"use client";
export const dynamic = "force-dynamic";
import SupabaseProvider from '@/components/SupabaseProvider';

import Navbar from '@/components/Navbar';
import AdminNavigation from './dashboard/admin/components/AdminNavigation';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <Navbar />
      <AdminNavigation />
      {children}
    </SupabaseProvider>
  );
}
