"use client";
import SupabaseProvider from '@/components/SupabaseProvider';

export default function DashboardClientProvider({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
