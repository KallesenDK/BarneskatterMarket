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
    discount_active: false,
    images: [],
    tags: [],
    category: "",
    category_id: "",
    category_id_old: "",
    created_at: new Date().toISOString(),
    expires_at: "",
    user_id: "",
    condition: "",
    location: "",
    status: "active",
    views: 0,
    featured: false,
    stripe_product_id: "",
    stripe_price_id: "",
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
      "title", "description", "price", "discount_price", "images", "tags", "category", "expires_at", "user_id", "condition", "location", "butik",
      "status", "featured", "stripe_product_id", "stripe_price_id", "category_id", "category_id_old"
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
      discount_active: product.discount_active,
      images: product.images,
      tags: product.tags,
      category: product.category,
      category_id: product.category_id || null,
      category_id_old: product.category_id_old || null,
      created_at: product.created_at,
      expires_at: product.expires_at,
      user_id: product.user_id,
      condition: product.condition,
      location: product.location,
      status: product.status,
      views: product.views,
      featured: product.featured,
      stripe_product_id: product.stripe_product_id,
      stripe_price_id: product.stripe_price_id,
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
          <label className="block font-medium mb-1">Tilbudspris (DKK)</label>
          <input type="number" name="discount_price" value={product.discount_price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tilbud aktiv?</label>
          <input type="checkbox" name="discount_active" checked={product.discount_active} onChange={e => setProduct(prev => ({ ...prev, discount_active: e.target.checked }))} />
        </div>
        <div>
          <label className="block font-medium mb-1">Billeder (kommasepareret URL) *</label>
          <input type="text" name="images" value={product.images.join(", ")} onChange={e => handleArrayChange("images", e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (kommasepareret, max 5) *</label>
          <input type="text" name="tags" value={product.tags.join(", ")} onChange={e => handleArrayChange("tags", e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Kategori *</label>
          <input type="text" name="category" value={product.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Kategori ID</label>
          <input type="text" name="category_id" value={product.category_id} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Kategori ID (gammel)</label>
          <input type="text" name="category_id_old" value={product.category_id_old} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Oprettet</label>
          <input type="text" name="created_at" value={product.created_at} className="w-full border rounded px-3 py-2 bg-gray-100" readOnly />
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
          <label className="block font-medium mb-1">Status</label>
          <select name="status" value={product.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="active">Aktiv</option>
            <option value="draft">Kladde</option>
            <option value="sold">Solgt</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Antal visninger</label>
          <input type="number" name="views" value={product.views} className="w-full border rounded px-3 py-2 bg-gray-100" readOnly />
        </div>
        <div>
          <label className="block font-medium mb-1">Udvalgt (featured)</label>
          <input type="checkbox" name="featured" checked={product.featured} onChange={e => setProduct(prev => ({ ...prev, featured: e.target.checked }))} />
        </div>
        <div>
          <label className="block font-medium mb-1">Stripe produkt ID</label>
          <input type="text" name="stripe_product_id" value={product.stripe_product_id} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Stripe pris ID</label>
          <input type="text" name="stripe_price_id" value={product.stripe_price_id} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
