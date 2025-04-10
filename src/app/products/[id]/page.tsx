import { redirect } from 'next/navigation';
import { getProductById } from '@/lib/api';

// Hjælpefunktion til at skabe en URL-venlig slug
const createSlug = (text: string) => {
  if (!text) return 'produkt';
  return text
    .toLowerCase()
    .replace(/[^\w\såæø]/g, '-') // Replace non-word chars with dash
    .replace(/\s+/g, '-')        // Replace spaces with dash
    .replace(/å/g, 'aa')         // Convert Nordic characters
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-+/, '')          // Trim dash from start
    .replace(/-+$/, '');         // Trim dash from end
};

export default async function ProductRedirect({ params }: { params: { id: string } }) {
  // Hent produktets titel hvis muligt for en mere brugervenlig URL
  try {
    const product = await getProductById(params.id);
    if (product && product.title) {
      const slug = createSlug(product.title);
      // Redirect til den nye URL-struktur med slug og ID
      redirect(`/product/${slug}-${params.id}`);
    }
  } catch (error) {
    console.error('Fejl ved hentning af produkt:', error);
  }
  
  // Fallback: Redirect fra gammelt URL-format (/products/[id]) til nyt (/product/[id])
  redirect(`/product/${params.id}`);
} 