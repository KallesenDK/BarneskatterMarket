import Link from 'next/link';
import { Product, CartItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { removeUuidPattern } from '@/lib/customHooks';
import Image from 'next/image';
import { useCart } from '@/components/Cart/CartProvider';
import { ShoppingCart } from 'lucide-react';

interface MockProductCardProps {
  product: Product;
}

// Komponent til at vise lokation - sikrer at location er renset for alle UUID-mønstre
const LocationTag = ({ product }: { product: Product }) => {
  // Bestem den faktiske lokation baseret på tilgængelige data og fjern UUID-mønstre
  let locationText = '';
  
  if (product.location && typeof product.location === 'string' && product.location.trim() !== '') {
    // Brug product.location hvis det er tilgængeligt
    locationText = removeUuidPattern(product.location.trim());
  } else if (product.user) {
    // Ellers prøv at bruge bruger data
    if (product.user.postal_code) {
      // Map postnummer til by
      if (product.user.postal_code === '2800') {
        locationText = 'Lyngby';
      } else if (product.user.postal_code === '8000') {
        locationText = 'Aarhus C';
      } else if (product.user.postal_code.startsWith('21')) {
        locationText = 'København Ø';
      } else {
        locationText = `${product.user.postal_code}`;
      }
    } else if (product.user.address) {
      // Kun tag det første ord i adressen for at få bynavnet
      const addressParts = removeUuidPattern(product.user.address).split(' ');
      // Hvis første del ser ud som et vejnavn, tag sidste del i stedet
      if (addressParts.length > 1 && addressParts[0].toLowerCase().includes('vej')) {
        locationText = addressParts[addressParts.length - 1];
      } else {
        locationText = addressParts[0];
      }
    }
  }
  
  // Sæt en standardværdi hvis vi ikke kunne finde en lokation
  if (!locationText) {
    locationText = 'Ikke angivet';
  }
  
  return (
    <div className="flex items-center space-x-1 text-gray-500 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{locationText}</span>
    </div>
  );
};

// Helper function to create a URL-friendly slug
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

// Hjælpefunktion til at få billedets URL
const getImageUrl = (image: string | { url: string } | undefined): string | undefined => {
  if (!image) return undefined;
  return typeof image === 'string' ? image : image.url;
};

export default function MockProductCard({ product }: MockProductCardProps) {
  const { addItem, items } = useCart();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isInCart = items.some(item => item.id === product.id);
  
  // Generer en brugervenlig URL for produktet
  const productUrl = useMemo(() => {
    const slug = createSlug(product.title);
    return `/product/kategori/${slug}-${product.id}`;
  }, [product.title, product.id]);
  
  // Faktiske produktbilleder eller backup billeder
  const productImages = useMemo(() => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return [];
    }
    
    // Håndter forskellige formater af billeder
    return product.images.map(image => {
      let imageUrl = '';
      if (typeof image === 'string') {
        imageUrl = image;
      } else if (typeof image === 'object' && image !== null && 'url' in image) {
        imageUrl = image.url;
      }
      
      if (!imageUrl) return null;
      
      // Bevar billedet men fjern ID fra visningen
      return imageUrl;
    }).filter(Boolean);
  }, [product.images]);
  
  // Backup billeder hvis vi ikke har produktbilleder
  const fallbackImages = [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25'
  ];
  
  // Håndter billede fejl med bedre fallbacks
  const handleImageError = () => {
    setImageError(true);
  };

  // Tjek om produktet faktisk har billeder
  const hasProductImages = productImages.length > 0;

  // Funktion til at skifte billeder i galleriet
  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Forebyg at Link trigges
    e.stopPropagation(); // Stop event bubble
    
    if (productImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length);
    } else if (fallbackImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fallbackImages.length);
    }
  };

  // Nuværende billede baseret på om vi bruger produkt eller fallback billeder
  const currentImageUrl = useMemo(() => {
    try {
      const baseUrl = productImages.length > 0 
        ? productImages[currentImageIndex % productImages.length]
        : fallbackImages[currentImageIndex % fallbackImages.length];
      
      return baseUrl || fallbackImages[0];
    } catch (error) {
      console.error('Fejl ved generering af billed-URL:', error);
      return fallbackImages[0];
    }
  }, [productImages, currentImageIndex]);

  // Beregn rabatprocent
  const calculateDiscount = () => {
    const hasDiscount = product.discountActive || product.discount_active;
    const discountPrice = product.discount_price || product.discountPrice;
    
    if (hasDiscount && discountPrice) {
      return Math.round(((product.price - discountPrice) / product.price) * 100);
    }
    return 0;
  };

  // Få dato på korrekt format
  const getCreatedDate = () => {
    if (product.createdAt) {
      return new Date(product.createdAt);
    }
    if (product.created_at) {
      return new Date(product.created_at);
    }
    return null;
  };

  const isNewProduct = () => {
    const date = getCreatedDate();
    if (!date) return false;
    
    const oneDayAgo = new Date(Date.now() - 86400000);
    return date > oneDayAgo;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Forebyg at Link trigges
    e.stopPropagation(); // Stop event bubble
    
    addItem({
      id: product.id,
      title: product.title,
      price: 
        product.discount_price || product.discountPrice || product.price
        : product.price,
      image: product.image_url || (product.images?.[0] 
        ? (typeof product.images[0] === 'string' 
          ? product.images[0] 
          : product.images[0].url)
        : undefined)
    });
  };

  const addToCart = () => {
    const imageUrl = product.image_url || 
      (product.images && product.images.length > 0 && typeof product.images[0] === 'string' 
        ? product.images[0] 
        : product.images?.[0]?.url);

    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: imageUrl,
      description: product.description,
    };
    
    addItem(cartItem);
  };

  return (
    <div className="product-card group relative border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 bg-white">
      <Link 
        href={productUrl}
        className="block"
      >
        <figure className="relative h-52 overflow-hidden bg-gray-100 rounded-t-xl">
          {hasProductImages || imageError ? (
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={getImageUrl(product.images?.[0]) || '/images/placeholder.jpg'}
                  alt={product.title || 'Produktbillede'}
                  className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105"
                  width={500}
                  height={500}
                  onError={handleImageError}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Billede på vej</p>
              <p className="text-xs text-gray-400 mt-1">Dette produkt mangler billeder</p>
            </div>
          )}
          
          {calculateDiscount() > 0 && (
            <Badge className="absolute top-3 right-3 bg-[#BC1964] hover:bg-[#BC1964]/90 px-2 py-1">
              {calculateDiscount()}% rabat
            </Badge>
          )}
          
          {product.category && (
            <Badge 
              variant="outline" 
              className="absolute bottom-3 left-3 bg-white/90 text-[#0F172A] border-0 backdrop-blur-sm"
            >
              {removeUuidPattern(product.category)}
            </Badge>
          )}
          
          {/* Galleri kontrol knap - vises kun hvis der faktisk er flere billeder */}
          {(productImages.length > 1) && (
            <button 
              className="absolute bottom-3 right-3 bg-white/80 text-black border border-[#1AA49A] backdrop-blur-sm rounded-full p-1 hover:bg-white transition-colors z-10"
              onClick={handleGalleryClick}
              aria-label="Næste billede"
              title="Se næste billede"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </figure>
      </Link>
      
      <section className="p-4 flex-grow flex flex-col">
        <Link href={productUrl} className="group/title">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-[#0F172A] group-hover/title:text-[#1AA49A] transition-colors">
            {product.title || 'Produkt uden titel'}
          </h3>
        </Link>
        
        <p className="text-[#0F172A]/70 text-sm line-clamp-2 mb-3 h-10">
          {product.description}
        </p>
        
        <footer className="mt-auto">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              {(product.discountActive || product.discount_active) && (product.discount_price || product.discountPrice) ? (
                <>
                  <span className="text-xl font-bold text-[#BC1964]">{product.discount_price || product.discountPrice} kr</span>
                  <span className="text-sm text-[#0F172A]/60 line-through">{product.price} kr</span>
                </>
              ) : (
                <span className="text-xl font-bold text-[#0F172A]">{product.price} kr</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-full">
              {isInCart ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 w-full cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Sælges</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1 w-full"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Køb nu</span>
                </button>
              )}
              
              <Link 
                href={productUrl}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center w-full"
              >
                <span>Se mere</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            {/* Forbedret LocationTag der aldrig viser UUIDs */}
            <LocationTag product={product} />
            
            <span className={cn(
              "text-xs text-[#0F172A]/60 px-2 py-1 rounded-full",
              isNewProduct() ? "bg-green-50 text-green-700" : "bg-[#F8FAFC]"
            )}>
              {isNewProduct() ? "Ny i dag" : "Standvare"}
            </span>
          </div>
        </footer>
      </section>
    </div>
  );
}