"use client";
export const dynamic = "force-dynamic";
import SupabaseProvider from '@/components/SupabaseProvider';

import AdminNavigation from './dashboard/admin/components/AdminNavigation';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AdminNavigation />
      {children}
    </SupabaseProvider>
  );
}
