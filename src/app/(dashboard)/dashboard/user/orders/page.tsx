"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Transaction {
  id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  product?: { id: string; title?: string };
  buyer?: { id: string; full_name?: string; email?: string };
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    async function fetchOrders() {
      // Hent nuværende bruger
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) return setLoading(false);
      // Hent ordrer hvor denne bruger er sælger
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, buyer:buyer_id(id, full_name, email), product:product_id(id, title)")
        .eq("seller_id", user.data.user.id)
        .order("created_at", { ascending: false });
      setOrders(transactions || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Mine Ordrer</h1>
      {loading ? (
        <div>Indlæser...</div>
      ) : orders.length === 0 ? (
        <div>Du har ingen ordrer endnu.</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Ordre ID</th>
              <th className="py-2 px-4 border">Køber</th>
              <th className="py-2 px-4 border">Produkt</th>
              <th className="py-2 px-4 border">Beløb</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Dato</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border font-mono text-xs">{order.id.slice(0, 8)}...</td>
                <td className="py-2 px-4 border">
                  <div className="font-semibold">{order.buyer?.full_name || order.buyer?.email || order.buyer_id.slice(0,8)}</div>
                  <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                </td>
                <td className="py-2 px-4 border">
                  <div className="font-medium">{order.product?.title || order.product_id.slice(0,8)}</div>
                  <div className="text-xs text-gray-400">{order.product_id.slice(0,8)}</div>
                </td>
                <td className="py-2 px-4 border">{order.amount.toFixed(2)} kr.</td>
                <td className="py-2 px-4 border">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                </td>
                <td className="py-2 px-4 border">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
