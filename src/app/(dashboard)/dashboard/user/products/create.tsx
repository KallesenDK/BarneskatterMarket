"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

export default function CreateProductPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    discount_price: "",
    images: [],
    tags: [],
    category: "",
    expires_at: "",
    user_id: "",
    condition: "",
    location: "",
    butik: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProduct((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayChange = (name: string, value: string) => {
    setProduct((prev: any) => ({ ...prev, [name]: value.split(",").map((v) => v.trim()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Validate all required fields
    const requiredFields: (keyof typeof product)[] = [
      "title", "description", "price", "discount_price", "images", "tags", "category", "expires_at", "user_id", "condition", "location", "butik"
    ];
    for (const key of requiredFields) {
      const value = product[key];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setError("Alle felter skal udfyldes.");
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.from("products").insert({
      title: product.title,
      description: product.description,
      price: Number(product.price),
      discount_price: Number(product.discount_price),
      images: product.images,
      tags: product.tags,
      category: product.category,
      expires_at: product.expires_at,
      user_id: product.user_id,
      condition: product.condition,
      location: product.location,
      butik: product.butik,
    });
    setLoading(false);
    if (error) setError("Kunne ikke oprette produkt: " + error.message);
    else router.push("/dashboard/user/products");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Opret nyt produkt</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Titel *</label>
          <input type="text" name="title" value={product.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Beskrivelse *</label>
          <textarea name="description" value={product.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Pris (DKK) *</label>
          <input type="number" name="price" value={product.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Tilbudspris (DKK) *</label>
          <input type="number" name="discount_price" value={product.discount_price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Billeder (kommasepareret URL) *</label>
          <input type="text" name="images" value={product.images.join(", ")} onChange={e => handleArrayChange("images", e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (kommasepareret) *</label>
          <input type="text" name="tags" value={product.tags.join(", ")} onChange={e => handleArrayChange("tags", e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Kategori *</label>
          <input type="text" name="category" value={product.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Udløbsdato *</label>
          <input type="datetime-local" name="expires_at" value={product.expires_at} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Bruger ID *</label>
          <input type="text" name="user_id" value={product.user_id} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Stand (condition) *</label>
          <input type="text" name="condition" value={product.condition} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Lokation *</label>
          <input type="text" name="location" value={product.location} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Butik (afhentning) *</label>
          <input type="text" name="butik" value={product.butik} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-[#1AA49A] text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Opretter..." : "Opret produkt"}
        </button>
      </form>
    </div>
  );
}
