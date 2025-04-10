"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import InterestModal from '@/components/InterestModal';
import { getProducts } from '@/lib/api';

// Produktgalleri komponent - sikrer at billeder vises korrekt
function ProductGallery({ images }: { images: string[] }) {
  const [mainImage, setMainImage] = useState(0);
  
  // Tjek om billeder er tomme eller udefinerede
  const hasImages = Array.isArray(images) && images.length > 0;
  
  // Håndter fejl ved billedindlæsning
  const handleImageError = (index: number) => {
    console.log(`Fejl ved indlæsning af billede ${index}`);
    // Skift til næste billede hvis det nuværende ikke kan indlæses
    if (hasImages && index === mainImage && images.length > 1) {
      setMainImage((mainImage + 1) % images.length);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
        {hasImages ? (
          <Image
            src={images[mainImage]}
            alt="Produkt hovedbillede"
            fill
            priority
            className="object-contain"
            onError={() => handleImageError(mainImage)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">Intet billede</span>
          </div>
        )}
      </div>
      
      {hasImages && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-200 
                ${mainImage === index ? 'ring-2 ring-black opacity-100' : 'ring-1 ring-gray-200 opacity-80 hover:opacity-100'}`}
            >
              <Image
                src={image}
                alt={`Produktbillede ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Forenklet produktdetaljekomponent uden farver og størrelser
function ProductDetails({ product }: { product: Product }) {
  // Highlights fra produktet
  const highlights = product.tags?.slice(0, 4) || [];
  
  return (
    <div className="mt-8 lg:mt-0">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/product" className="hover:text-gray-700">Produkter</Link>
          </li>
          <li>
            <span className="mx-1">/</span>
          </li>
          <li>
            <Link href={`/product?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-700">
              {product.category}
            </Link>
          </li>
          {product.subcategory && (
            <>
              <li>
                <span className="mx-1">/</span>
              </li>
              <li className="hover:text-gray-700">
                {product.subcategory}
              </li>
            </>
          )}
        </ol>
      </nav>
      
      {/* Produkttitel og pris */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
        <div className="mt-3">
          {product.discountActive && product.discountPrice ? (
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{product.discountPrice} kr</p>
              <p className="ml-3 text-lg text-gray-500 line-through">{product.price} kr</p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{product.price} kr</p>
          )}
        </div>
      </div>
      
      {/* Produkt beskrivelse */}
      <div className="prose max-w-none mb-10">
        <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
      </div>
      
      {/* Highlights sektion */}
      {highlights.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Highlights</h3>
          <ul className="list-disc pl-5 space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="text-gray-600">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Kontaktknap - via platform for at skjule kundeinfo */}
      <div className="mt-8">
        <InterestModal 
          triggers={[
            "Hvornår kan jeg hente?",
            "Levering muligt?",
            "Andre spørgsmål"
          ]} 
          onSubmit={(message, contactInfo) => {
            console.log('Besked sendt:', { message, contactInfo, productId: product!.id });
          }}
          buttonClassName="w-full flex items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-50"
          buttonText="Kontakt om produkt"
        />
      </div>
    </div>
  );
}

// Relaterede produkter komponent
function RelatedProducts({ currentProductId, category }: { currentProductId: string, category: string }) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Hent relaterede produkter ved komponent montering
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const products = await getProducts(category, 4);
        // Filtrer det nuværende produkt ud
        const filtered = products.filter(p => p.id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 4)); // Begræns til 4 produkter
      } catch (error) {
        console.error('Fejl ved hentning af relaterede produkter:', error);
      }
    }
    
    fetchRelatedProducts();
  }, [currentProductId, category]);
  
  if (relatedProducts.length === 0) return null;
  
  return (
    <section className="mt-24 border-t border-gray-200 pt-16">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Du vil måske også kunne lide</h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {relatedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group relative">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-90 transition-opacity">
              <Image
                src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg'}
                alt={product.title}
                width={300}
                height={300}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <h3 className="mt-4 text-base font-medium text-gray-900 line-clamp-1">{product.title}</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {product.discountActive && product.discountPrice 
                ? `${product.discountPrice} kr` 
                : `${product.price} kr`}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Hovedkomponenten der viser produktdesign på klientsiden
export default function ProductClientComponents({
  product,
  category,
  productId
}: {
  product: Product;
  category: string;
  productId: string;
}) {
  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Produktbilleder */}
        <ProductGallery images={product.images || []} />
        
        {/* Produktinformation */}
        <ProductDetails product={product} />
      </div>
      
      {/* Relaterede produkter */}
      <RelatedProducts currentProductId={productId} category={category} />
    </>
  );
} 