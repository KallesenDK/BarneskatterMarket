"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import Image from "next/image";
import Link from "next/link";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setError("Kunne ikke hente produkt.");
      else setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProduct((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("products")
      .update({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        tags: product.tags,
      })
      .eq("id", id);
    if (error) setError("Kunne ikke opdatere produkt.");
    else router.push("/dashboard/user/products");
  };

  if (loading) return <div>Indlæser...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Rediger produkt</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Titel</label>
          <input
            type="text"
            name="title"
            value={product.title || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Beskrivelse</label>
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={5}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Pris</label>
          <input
            type="number"
            name="price"
            value={product.price || 0}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Kategori</label>
          <input
            type="text"
            name="category"
            value={product.category || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (kommasepareret)</label>
          <input
            type="text"
            name="tags"
            value={product.tags || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-[#1AA49A] text-white px-6 py-2 rounded hover:bg-[#158F86]"
        >
          Gem ændringer
        </button>
        <Link href="/dashboard/user/products" className="ml-4 text-gray-600 hover:underline">
          Annuller
        </Link>
      </form>
      {product.images && Array.isArray(product.images) && product.images.length > 0 && (
        <div className="mt-6">
          <h2 className="font-medium mb-2">Billeder</h2>
          <div className="flex gap-2">
            {product.images.map((img: string, idx: number) => (
              <Image key={idx} src={img} alt="Produktbillede" width={80} height={80} className="rounded object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
