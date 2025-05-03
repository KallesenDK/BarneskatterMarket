import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
}

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setSuggestions([]);
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        // Hent produkter der matcher søgningen
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, images, location')
          .ilike('title', `%${query}%`)
          .limit(5);

        if (error) throw error;

        // Generer forslag baseret på søgningen
        const uniqueTitles = [...new Set(data.map(p => p.title))];
        setSuggestions(uniqueTitles);
        setProducts(data);
      } catch (error) {
        console.error('Fejl ved søgning:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, supabase]);

  if (!query) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Venstre side - Forslag */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 mb-2">Forslag</h3>
          {loading ? (
            <div className="text-gray-500">Søger...</div>
          ) : suggestions.length > 0 ? (
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      // TODO: Implementer søgning med forslag
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Ingen forslag fundet</div>
          )}
        </div>

        {/* Højre side - Produkter */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 mb-2">Produkter</h3>
          {loading ? (
            <div className="text-gray-500">Søger...</div>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="relative w-16 h-16">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {product.location} • {product.price} kr
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Ingen produkter fundet</div>
          )}
        </div>
      </div>
    </div>
  );
} 