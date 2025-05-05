import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

interface Statistics {
  userCount: number;
  orderCount: number;
}

export default function AdminStatistics() {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });
        if (userError) throw userError;

        // Fetch order count
        const { count: orderCount, error: orderError } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true });
        if (orderError) throw orderError;

        setStats({ userCount: userCount ?? 0, orderCount: orderCount ?? 0 });
      } catch (err: any) {
        setError("Kunne ikke hente statistik.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1AA49A]"></div>
        <span>Indlæser statistik...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-3xl font-bold text-[#1AA49A]">{stats?.userCount}</span>
        <span className="text-gray-700 mt-2">Brugere</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-3xl font-bold text-[#BC1964]">{stats?.orderCount}</span>
        <span className="text-gray-700 mt-2">Ordrer</span>
      </div>
    </div>
  );
}
