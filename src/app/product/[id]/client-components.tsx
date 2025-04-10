"use client";

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import InterestModal from '@/components/InterestModal';
import { getProducts } from '@/lib/api';

// Moderne produktgalleri komponent med zoom effekt
function ModernProductGallery({ images }: { images: string[] }) {
  const [mainImage, setMainImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  
  console.log("Produkt billeder:", images);
  
  // Tjek om billeder er tomme eller udefinerede
  const hasImages = Array.isArray(images) && images.length > 0;
  
  // Håndter fejl ved billedindlæsning
  const handleImageError = (index: number) => {
    console.log(`Fejl ved indlæsning af billede ${index}:`, images[index]);
    setImageError(prev => ({ ...prev, [index]: true }));
    
    if (hasImages && index === mainImage && images.length > 1) {
      // Skift til næste billede som ikke har fejl
      const nextImages = images.filter((_, i) => !imageError[i] && i !== index);
      if (nextImages.length > 0) {
        const nextIndex = images.findIndex(img => img === nextImages[0]);
        setMainImage(nextIndex >= 0 ? nextIndex : 0);
      }
    }
  };

  // Sikre at alle billeder har en gyldig URL
  const safeImages = hasImages 
    ? images.filter(img => typeof img === 'string' && img.trim() !== '')
    : [];
  
  useEffect(() => {
    console.log(`ModernProductGallery - Safeimages: ${safeImages.length} billeder`);
  }, [safeImages]);
  
  // Hvis der ingen gyldige billeder er, vis kun ikon
  if (safeImages.length === 0) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="aspect-square w-full bg-gray-50 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">Ingen billeder tilgængelige</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Hvis alle billederne har fejlet, vis meddelelse
  if (safeImages.length > 0 && Object.keys(imageError).length >= safeImages.length) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="aspect-square w-full bg-gray-50 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">Kunne ikke indlæse billederne</p>
          </div>
        </div>
      </div>
    );
  }
  
  // For produkter med kun ét billede - vis billedet i fuld størrelse
  if (safeImages.length === 1) {
    return (
      <div className="flex flex-col space-y-4">
        {/* Hovedbillede med zoom effekt */}
        <div 
          className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {!imageError[mainImage] ? (
            <div className="relative h-full w-full">
              <img
                src={safeImages[mainImage]}
                alt="Produkt hovedbillede"
                className={`w-full h-full object-contain transition-transform duration-500 ${isZoomed ? 'scale-110' : 'scale-100'}`}
                onError={(e) => {
                  handleImageError(mainImage);
                  (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Billede ikke tilgængeligt</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enkelt thumbnail med mere fokus på produktet */}
        <div className="flex justify-center w-full">
          <button
            className="relative w-full max-w-xs aspect-[3/2] overflow-hidden rounded-lg border-2 border-[#1AA49A] shadow-md"
          >
            {!imageError[0] ? (
              <div className="relative h-full w-full">
                <img
                  src={safeImages[0]}
                  alt="Produktbillede 1"
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    handleImageError(0);
                    (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }
  
  // For produkter med flere billeder - vis grid med thumbnails
  return (
    <div className="flex flex-col space-y-4">
      {/* Hovedbillede med zoom effekt */}
      <div 
        className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {!imageError[mainImage] ? (
          <div className="relative h-full w-full">
            <img
              src={safeImages[mainImage]}
              alt="Produkt hovedbillede"
              className={`w-full h-full object-contain transition-transform duration-500 ${isZoomed ? 'scale-110' : 'scale-100'}`}
              onError={(e) => {
                handleImageError(mainImage);
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Billede ikke tilgængeligt</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Thumbnails med highlight - multiple */}
      <div className={`grid ${
        safeImages.length === 2 ? 'grid-cols-2' : 
        safeImages.length === 3 ? 'grid-cols-3' : 
        'grid-cols-4'
      } gap-3`}>
        {safeImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setMainImage(index)}
            className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-300 
              ${mainImage === index 
                ? 'ring-2 ring-[#1AA49A] opacity-100 scale-105' 
                : 'ring-1 ring-gray-200 opacity-80 hover:opacity-100 hover:ring-[#1AA49A]/50'}`}
          >
            {!imageError[index] ? (
              <div className="relative h-full w-full">
                <img
                  src={image}
                  alt={`Produktbillede ${index + 1}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    handleImageError(index);
                    (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Moderne produktdetaljekomponent med visuelle elementer
function ModernProductDetails({ product, hideProductId }: { product: Product, hideProductId?: boolean }) {
  // Highlights fra produktet
  const highlights = product.tags?.slice(0, 4) || [];
  
  // Bestem lokalitet - vis kun byen, skjul sælger
  const getLocation = () => {
    // Hvis der er en specifik lokation på produktet, brug den
    if (product.location && typeof product.location === 'string' && product.location.trim() !== '') {
      return product.location;
    }
    
    // Ellers tjek om der er adresse eller postnummer på bruger
    if (product.user?.postalCode) {
      return `${product.user.postalCode.slice(0, 4)}`;
    }
    
    return 'Lokalitet ikke angivet';
  };
  
  // Visuelt pris badge
  const PriceBadge = ({ price, discountPrice, discountActive }: { price: number, discountPrice?: number, discountActive?: boolean }) => {
    if (discountActive && discountPrice) {
      const discountPercent = Math.round(((price - discountPrice) / price) * 100);
      return (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#BC1964]">{discountPrice} kr</span>
            <span className="text-lg text-gray-500 line-through">{price} kr</span>
            <span className="px-2 py-1 rounded-full bg-[#F08319] text-white text-sm font-medium">-{discountPercent}%</span>
          </div>
          <p className="text-sm text-[#1AA49A] mt-1">Du sparer {price - discountPrice} kr!</p>
        </div>
      );
    }
    return <span className="text-4xl font-bold text-[#BC1964]">{price} kr</span>;
  };
  
  return (
    <div className="mt-8 lg:mt-0">
      {/* Tydelig breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/product" className="text-[#1AA49A] hover:text-[#BC1964] font-medium">Produkter</Link>
          </li>
          <li>
            <span className="mx-1 text-gray-400">/</span>
          </li>
          <li>
            <Link href={`/product?category=${encodeURIComponent(product.category)}`} className="text-[#1AA49A] hover:text-[#BC1964] font-medium">
              {product.category === "Kategori" ? "Alle produkter" : product.category}
            </Link>
          </li>
          <li>
            <span className="mx-1 text-gray-400">/</span>
          </li>
          <li className="text-gray-600">
            {product.title}
          </li>
        </ol>
      </nav>
      
      {/* Visuelt fremhævet produkttitel og pris */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
        <div className="mt-3">
          <PriceBadge 
            price={product.price} 
            discountPrice={product.discountPrice} 
            discountActive={product.discountActive} 
          />
        </div>
      </div>
      
      {/* Tillidsopbyggende elementer med ikoner */}
      <div className="grid grid-cols-3 gap-3 mb-8 text-center">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-xs font-medium">Sikker handel</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium">Verificeret sælger</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-xs font-medium">Genbrug er guld</p>
        </div>
      </div>
      
      {/* Lokation information med kort-ikon */}
      <div className="mb-8 flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="w-12 h-12 bg-[#1AA49A] rounded-full flex items-center justify-center text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900">Lokation</p>
          <p className="text-sm text-gray-500">{getLocation()}</p>
        </div>
      </div>
      
      {/* Handlingsknapper */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button 
          onClick={() => console.log('Køb produkt:', product.id)}
          className="flex items-center justify-center rounded-lg bg-[#1AA49A] px-6 py-3 text-base font-medium text-white hover:bg-[#158f86] transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          Køb nu
        </button>
        
        <InterestModal 
          triggers={[]} 
          onSubmit={(message, contactInfo) => {
            console.log('Interesse udtrykt:', { message, contactInfo, productId: product.id });
          }}
          buttonClassName="flex items-center justify-center rounded-lg border border-[#BC1964] bg-white px-6 py-3 text-base font-medium text-[#BC1964] hover:bg-[#BC1964]/5 transition-colors duration-300"
          buttonText="Vis interesse"
          iconStart={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
      </div>
      
      {/* Produkt beskrivelse med bedre formatering */}
      <div className="prose max-w-none mb-10 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-[#1AA49A] mb-4">Produktbeskrivelse</h2>
        <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
      </div>
      
      {/* Visuelt fremhævede highlights */}
      {highlights.length > 0 && (
        <div className="mt-10 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-[#1AA49A] mb-4">Nøgledetaljer</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <span className="mr-2 text-[#F08319]">✓</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Relaterede produkter komponent med mere moderne stil
function RelatedProducts({ currentProductId, category }: { currentProductId: string, category: string }) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  
  // Hent relaterede produkter ved komponent montering
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const products = await getProducts(category, 8);
        // Filtrer det nuværende produkt ud
        const filtered = products.filter(p => p.id !== currentProductId);
        
        // Log de relaterede produkter for fejlfinding
        console.log(`Fandt ${filtered.length} relaterede produkter i kategori "${category}"`);
        if (filtered.length > 0) {
          console.log('Første relaterede produkt:', filtered[0].title);
          console.log('Billeder på første relaterede produkt:', filtered[0].images?.length || 0);
        }
        
        setRelatedProducts(filtered.slice(0, 4)); // Begræns til 4 produkter
      } catch (error) {
        console.error('Fejl ved hentning af relaterede produkter:', error);
      }
    }
    
    fetchRelatedProducts();
  }, [currentProductId, category]);
  
  // Håndter fejl ved billedindlæsning
  const handleImageError = (productId: string) => {
    setImageError(prev => ({ ...prev, [productId]: true }));
  };
  
  if (relatedProducts.length === 0) return null;
  
  return (
    <section className="mt-24 border-t border-gray-200 pt-16">
      <h2 className="text-2xl font-bold tracking-tight text-[#1AA49A] mb-2">Du vil måske også kunne lide</h2>
      <p className="text-gray-500 mb-10">Andre produkter i samme kategori</p>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group relative flex flex-col h-full">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 group-hover:shadow-md transition-all duration-300 border border-gray-100">
              {!imageError[product.id] && product.images && product.images.length > 0 ? (
                <div className="w-full h-full relative">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                      handleImageError(product.id);
                    }}
                  />
                  
                  {product.discountActive && product.discountPrice && (
                    <div className="absolute top-2 right-2 bg-[#F08319] text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex-grow">
              <h3 className="text-base font-medium text-gray-900 line-clamp-1 group-hover:text-[#BC1964] transition-colors duration-300">{product.title}</h3>
              <p className="mt-1 font-bold text-lg text-[#BC1964]">
                {product.discountActive && product.discountPrice 
                  ? `${product.discountPrice} kr` 
                  : `${product.price} kr`}
                {product.discountActive && product.discountPrice && (
                  <span className="ml-2 text-sm text-gray-500 line-through">{product.price} kr</span>
                )}
              </p>
            </div>
            
            {/* Lokation indikator */}
            {product.location && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {product.location}
              </div>
            )}
          </Link>
        ))}
      </div>
      
      {/* Se flere-knap */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 text-center">
          <Link href={`/product?category=${encodeURIComponent(category)}`} className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#1AA49A] hover:bg-[#158f86] transition-colors duration-300">
            Se flere produkter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}

// Hovedkomponenten der viser produktdesign på klientsiden
export default function ProductClientComponents({
  product,
  category,
  productId,
  hideProductId = false
}: {
  product: Product;
  category: string;
  productId: string;
  hideProductId?: boolean;
}) {
  useEffect(() => {
    console.log("Produkt informationer:", {
      id: productId,
      title: product.title,
      billeder: product.images?.length || 0
    });
    
    if (product.images && product.images.length > 0) {
      console.log("Alle produktbilleder URLs (første 100 tegn):", 
        product.images.map(img => typeof img === 'string' ? img.substring(0, 100) + '...' : 'Ikke en gyldig URL')
      );
    }
  }, [product, productId]);
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Produktbilleder */}
        <ModernProductGallery images={product.images || []} />
        
        {/* Produktinformation */}
        <ModernProductDetails product={product} hideProductId={hideProductId} />
      </div>
      
      {/* Relaterede produkter */}
      <RelatedProducts currentProductId={productId} category={category} />
    </div>
  );
} 