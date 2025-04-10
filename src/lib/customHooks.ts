import { useState, useEffect, useMemo } from 'react';
import { Product } from './types';

interface CleanProduct extends Omit<Product, 'id' | 'user'> {
  id?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

/**
 * Hook til at sanitere produkt-data for at fjerne ID'er
 * @param products Produkter der skal saniteres
 * @returns Saniterede produkter uden ID'er og UUID'er
 */
export function useSanitizedProducts(products: Product[]): Product[] {
  return useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    // Sanitize hvert produkt i arrayet
    return products.map(product => {
      // Lav en dyb kopi af produktet og fjern ID'er
      const cleanedProduct = removeId(product);
      
      // Rens også alle tekstfelter for UUID-mønstre
      Object.keys(cleanedProduct).forEach(key => {
        const value = cleanedProduct[key as keyof Product];
        if (typeof value === 'string') {
          (cleanedProduct as any)[key] = removeUuidPattern(value);
        }
      });
      
      return cleanedProduct;
    });
  }, [products]);
}

/**
 * Hjælpefunktion til at fjerne ID-relaterede data fra et produkt
 */
export function removeId(product: Product): Product {
  if (!product) return product;
  
  const cleanProduct = { ...product };
  
  // Slet ID felter fra produkt
  delete cleanProduct.id;
  delete cleanProduct.user_id;
  delete cleanProduct.userId;
  
  // Fjern også bruger ID hvis det findes
  if (cleanProduct.user) {
    cleanProduct.user = { ...cleanProduct.user };
    delete cleanProduct.user.id;
  }
  
  return cleanProduct;
}

/**
 * Fjerner UUID-mønstre fra en tekststreng
 */
export function removeUuidPattern(text: string): string {
  if (!text) return '';
  
  // Fjern hele teksten hvis den KUN er et UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) {
    return '';
  }
  
  // Regexp til at finde UUIDs og lignende mønstre
  const patterns = [
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,  // Standard UUID
    /f[0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,  // f-prefixed UUID
    /-[0-9a-f]{32}-/gi,  // Lange hex strenge
    /\b[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}\b/gi,  // UUID uden bindestreger
  ];
  
  // Anvend alle patterns
  let cleanText = text;
  patterns.forEach(pattern => {
    cleanText = cleanText.replace(pattern, '');
  });
  
  // Fjern eventuelle efterladte bindestreger i starten eller slutningen
  cleanText = cleanText.replace(/^-+|-+$/g, '');
  
  // Fjern dobbelte mellemrum
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText || '';
}

/**
 * Filtrerer og sorterer produkter baseret på kategori, søgning, pris og sorteringsvalg
 * @param products Produkter der skal filtreres
 * @param selectedCategory Valgt kategori eller 'Alle'
 * @param searchQuery Søgetekst
 * @param priceRange [min, max] prisområde
 * @param sortOption Sorteringsvalgmulighed
 * @param keepIds Hvis true, bevares produkt-ID'er (default: false)
 * @returns Filtrerede og sorterede produkter
 */
export function applyFilters(
  products: Product[], 
  selectedCategory: string, 
  searchQuery: string, 
  priceRange: number[], 
  sortOption: string,
  keepIds: boolean = false
): Product[] {
  if (!products || products.length === 0) {
    return [];
  }
  
  let result = [...products];
  
  // Filtrér efter kategori (hvis ikke 'Alle' er valgt)
  if (selectedCategory && selectedCategory !== 'Alle') {
    result = result.filter(product => product.category === selectedCategory);
  }
  
  // Filtrér efter prisområde
  result = result.filter(
    product => {
      const effectivePrice = product.discountActive && product.discount_price 
        ? product.discount_price 
        : product.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    }
  );
  
  // Filtrér efter søgning
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      product => 
        product.title?.toLowerCase().includes(query) || 
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.location?.toLowerCase().includes(query)
    );
  }
  
  // Sortér produkter
  switch (sortOption) {
    case 'price-low':
      result.sort((a, b) => {
        const priceA = a.discountActive && a.discount_price ? a.discount_price : a.price;
        const priceB = b.discountActive && b.discount_price ? b.discount_price : b.price;
        return priceA - priceB;
      });
      break;
    case 'price-high':
      result.sort((a, b) => {
        const priceA = a.discountActive && a.discount_price ? a.discount_price : a.price;
        const priceB = b.discountActive && b.discount_price ? b.discount_price : b.price;
        return priceB - priceA;
      });
      break;
    case 'name-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'name-desc':
      result.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'latest':
    default:
      result.sort((a, b) => {
        // Håndterer både createdAt og created_at felter
        const getDateValue = (product: Product) => {
          if (product.createdAt) {
            return new Date(product.createdAt).getTime();
          } else if (product.created_at) {
            return new Date(product.created_at).getTime();
          }
          return 0;
        };
        
        return getDateValue(b) - getDateValue(a);
      });
      break;
  }
  
  // Hvis keepIds er false, fjern ID-relaterede felter og UUIDs fra strenge
  if (!keepIds) {
    result = result.map(product => {
      // Først brug vores rensningsfunktion
      let cleanProduct = removeId(product);
      
      // Rens også alle strenge der ligner UUID'er
      Object.keys(cleanProduct).forEach(key => {
        const value = cleanProduct[key as keyof Product];
        if (typeof value === 'string') {
          cleanProduct[key] = removeUuidPattern(value);
        }
      });
      
      return cleanProduct;
    });
  }
  
  return result;
}

export const cleanProductData = (product: Product): CleanProduct => {
  const cleanProduct = { ...product } as CleanProduct;
  
  // Fjern UUID mønstre fra alle string værdier
  Object.keys(cleanProduct).forEach(key => {
    const value = (cleanProduct as any)[key];
    if (typeof value === 'string') {
      (cleanProduct as any)[key] = removeUuidPattern(value);
    }
  });

  // Gør id valgfri
  if (cleanProduct.id) {
    delete cleanProduct.id;
  }

  // Håndter user objekt hvis det findes
  if (cleanProduct.user) {
    if (cleanProduct.user.id) {
      delete cleanProduct.user.id;
    }
  }

  return cleanProduct;
}; 