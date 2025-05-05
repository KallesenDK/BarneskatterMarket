"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

export default function DashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const authParam = searchParams.get("auth");
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace("/dashboard/main/auth-error");
          return;
        }
        const isAdmin = data.session.user.email === "kenneth@sigmatic.dk";
        if (isAdmin) {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/user");
        }
      } catch (error) {
        router.replace("/dashboard/main/auth-error");
      }
    };
    checkSessionAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
