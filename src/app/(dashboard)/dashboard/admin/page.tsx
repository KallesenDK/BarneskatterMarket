"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

export default function AdminDashboard() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/signin");
        return;
      }
      // Hent brugerens rolle fra profiles-tabellen
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (error || !profile) {
        router.replace("/dashboard/user");
        return;
      }
      const isAdminUser = profile.role === 'admin';
      setIsAdmin(isAdminUser);
      setLoading(false);
      if (!isAdminUser) {
        router.replace("/dashboard/user");
      }
    };
    checkSession();
    // eslint-disable-next-line
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {/* Her kan du nu begynde at tilføje statistik, ordrer mv. */}
    </div>
  );
}

