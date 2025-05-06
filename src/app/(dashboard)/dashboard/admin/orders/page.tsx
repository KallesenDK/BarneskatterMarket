"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Transaction {
  id: string;
  seller_id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ordrer</h1>
      {loading ? (
        <div>Indlæser...</div>
      ) : orders.length === 0 ? (
        <div>Ingen ordrer endnu.</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Ordre ID</th>
              <th className="py-2 px-4 border">Køber</th>
              <th className="py-2 px-4 border">Sælger</th>
              <th className="py-2 px-4 border">Produkt</th>
              <th className="py-2 px-4 border">Beløb</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Dato</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 px-4 border">{order.id.slice(0, 8)}...</td>
                <td className="py-2 px-4 border">{order.buyer_id.slice(0, 8)}...</td>
                <td className="py-2 px-4 border">{order.seller_id.slice(0, 8)}...</td>
                <td className="py-2 px-4 border">{order.product_id.slice(0, 8)}...</td>
                <td className="py-2 px-4 border">{order.amount.toFixed(2)} kr.</td>
                <td className="py-2 px-4 border">{order.status}</td>
                <td className="py-2 px-4 border">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
