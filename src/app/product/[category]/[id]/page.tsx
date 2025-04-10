import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById, getProducts } from '@/lib/api'
import { Product } from '@/lib/types'
import ProductClientComponents from './client-components'

// Fallback mock produkt hvis databasen ikke er tilgængelig
const mockProduct: Product = {
  id: '1',
  title: 'iPhone 12 Pro - 128GB',
  description: 'Næsten ny iPhone 12 Pro med 128GB lagerplads. Ingen ridser eller skader. Inkluderer oplader og originale høretelefoner.\n\nSpecifikationer:\n- 128GB lagerplads\n- Farve: Graphite\n- Batteri: 100% sundhed\n- iOS 16 installeret\n- Face ID fungerer perfekt\n- Alle originale tilbehør medfølger\n\nGrund til salg: Har fået ny telefon gennem arbejdet.',
  price: 5999,
  discountPrice: 4999,
  discountActive: true,
  images: ['/images/product1.jpg', '/images/product1-2.jpg', '/images/product1-3.jpg'],
  tags: ['Elektronik', 'Smartphone', 'Apple'],
  category: 'Elektronik',
  createdAt: new Date('2023-05-15'),
  expiresAt: new Date('2023-06-15'),
  userId: 'user1',
  user: {
    id: 'user1',
    first_name: 'Anders',
    last_name: 'Jensen',
    credits: 0,
    created_at: new Date(),
    updatedAt: new Date()
  }
};

// Hjælpefunktion til at udtrække ID fra slug-ID kombinationen
function extractIdFromSlug(slugWithId: string): string {
  console.log(`Forsøger at udtrække ID fra: "${slugWithId}"`);
  
  // Tjek for 'undefined' eller tomme værdier som ID og returner en fejlværdi
  if (!slugWithId || slugWithId === 'undefined' || slugWithId.endsWith('-undefined')) {
    console.error('Ugyldigt ID i URL: undefined eller tom værdi');
    return 'ikke-fundet';
  }
  
  // Tjek om stien indeholder et UUID-mønster
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const uuidMatch = slugWithId.match(uuidPattern);
  
  if (uuidMatch) {
    console.log(`UUID matchet i URL: ${uuidMatch[0]}`);
    return uuidMatch[0]; // Returner det matchede UUID
  }
  
  // Hvis der ikke er et UUID, tjek for ID i slutningen af URL'en (efter sidste bindestreg)
  const parts = slugWithId.split('-');
  
  if (parts.length > 0) {
    const potentialId = parts[parts.length - 1];
    // Hvis ID'et ser ud til at være gyldigt (ikke 'undefined' eller en tom streng)
    if (potentialId && potentialId !== 'undefined' && potentialId.trim() !== '') {
      console.log(`ID fundet efter sidste bindestreg: ${potentialId}`);
      return potentialId; // Returner sidste del efter bindestreg som ID
    }
  }
  
  // Hvis vi ikke kunne finde et ID via en bindestreg, prøv at bruge hele slugWithId
  // Dette hjælper når ID'et er sendt direkte uden slug
  if (slugWithId && slugWithId !== 'undefined' && slugWithId.trim() !== '') {
    console.log(`Bruger hele URL-parameteren som ID: ${slugWithId}`);
    return slugWithId;
  }
  
  // Hvis ID'et er 'undefined' eller ikke kan findes, returner en fejlværdi
  console.error('Kunne ikke udtrække et gyldigt ID fra URL:', slugWithId);
  return 'ikke-fundet';
}

export default async function ProductDetailPage({ params }: { params: { id: string, category: string } }) {
  // Sikrer at vi har gyldige parametre
  const slugWithId = params.id || 'ikke-fundet';
  const urlCategory = decodeURIComponent(params.category || 'Kategori');
  
  // Udtrækker det faktiske produkt-ID fra URL-parameteren (som kan være slug-id)
  const productId = extractIdFromSlug(slugWithId);
  
  console.log(`URL-parameter: Kategori=${urlCategory}, ID-parameter=${slugWithId}, Udtrukket produkt-ID: ${productId}`);
  
  // Vis 404-siden hvis ID'et er 'ikke-fundet' eller kategorien indeholder UUID format
  if (productId === 'ikke-fundet' || 
     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(urlCategory)) {
    console.log(`Ugyldig URL format: ID=${productId}, Kategori=${urlCategory}`);
    return notFound();
  }
  
  let product: Product | null = null;
  
  try {
    console.log(`Forsøger at hente produkt: ${productId}`);
    product = await getProductById(productId);
    
    // Hvis produktet ikke blev fundet i databasen
    if (!product) {
      // Hvis ID'et matcher vores mock produkt, brug det
      if (productId === '1') {
        product = mockProduct;
      } else {
        console.log(`Produkt ikke fundet: ${productId}`);
        return notFound();
      }
    }
    
    // Tjek om URL-kategorien matcher produktkategorien (for SEO og konsistens)
    // Vi gør IKKE redirect her, da det kan skabe loops - log bare mismatchen
    if (product.category && product.category !== urlCategory) {
      console.log(`Kategori mismatch: ${urlCategory} vs ${product.category}, men fortsætter uden redirect`);
    }
    
    // Log produkt detaljer for fejlfinding
    console.log(`Produkt hentet: ${productId}, Navn: ${product.title}`);
    console.log(`Kategori i URL: ${urlCategory}, Kategori i produkt: ${product.category}`);
    console.log(`Billeder i produkt: ${product.images?.length || 0}`);
    if (product.images && product.images.length > 0) {
      console.log(`Første billede: ${product.images[0]}`);
    }
    
  } catch (error) {
    console.error(`Fejl ved indlæsning af produkt ${productId}:`, error);
    
    // Hvis ID'et matcher vores mock produkt, brug det
    if (productId === '1') {
      product = mockProduct;
    } else {
      return notFound();
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <ProductClientComponents 
          product={product} 
          category={product.category}
          productId={product.id}
          urlCategory={urlCategory}
        />
      </div>
    </div>
  );
} 