"use client";
import SupabaseProvider from '@/components/SupabaseProvider';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
