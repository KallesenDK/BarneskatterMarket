import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  created_at: string;
}

export default function TopMonthlyOrders() {
  const { supabase } = useSupabase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get start of current month in ISO format
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthISO = startOfMonth.toISOString();

        // Fetch top 5 orders by amount for current month
        const { data, error } = await supabase
          .from("orders")
          .select("id, buyer_id, seller_id, amount, created_at")
          .gte("created_at", startOfMonthISO)
          .order("amount", { ascending: false })
          .limit(5);
        if (error) throw error;
        setOrders(data ?? []);
      } catch (err: any) {
        setError("Kunne ikke hente top handler.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopOrders();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1AA49A]"></div>
        <span>Indlæser største handler...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="py-4 text-gray-500">Ingen handler fundet for denne måned.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Top 5 største handler i måneden</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beløb</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dato</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Køber</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sælger</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-2 font-bold text-[#1AA49A]">{order.amount} kr</td>
              <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2">{order.buyer_id}</td>
              <td className="px-4 py-2">{order.seller_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
