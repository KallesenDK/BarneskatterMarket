'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ShoppingCart from './ShoppingCart';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  type?: string;
  duration_weeks?: number;
  product_limit?: number;
}

interface AddItemResult {
  success: boolean;
  error?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => AddItemResult;
  removeItem: (itemId: string) => void;
  toggleCart: () => void;
  isOpen: boolean;
  createCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cart-items');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Gem items i localStorage ved ændringer
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-items', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>): AddItemResult => {
  // Find ud af hvad der allerede er i kurven
  const currentItems = [...items];
  const hasPackage = currentItems.some(i => i.type === 'package');
  const hasSlot = currentItems.some(i => i.type === 'slot');
  const hasProduct = currentItems.some(i => i.type === 'product');
  const isPackage = newItem.type === 'package';
  const isSlot = newItem.type === 'slot';
  const isProduct = newItem.type === 'product';

  // Regel 3: Produkter kan ikke købes sammen med slots/pakker
  if ((isProduct && (hasSlot || hasPackage)) || ((isSlot || isPackage) && hasProduct)) {
    return { success: false, error: 'Du kan desværre ikke reservere et produkt på samme tid som du køber pakker og slots.' };
  }

  // Regel 2: Slots kræver aktiv pakke og ingen pakke i kurven
  if (isSlot) {
    // Her bør du tjekke om brugeren har en aktiv pakke (kræver async kald normalt)
    if (!hasPackage) {
      return { success: false, error: 'Du skal have en aktiv pakke for at kunne købe slots.' };
    }
    if (hasPackage) {
      // Må ikke være flere pakker i kurven
      // (Hvis man vil forhindre slots + pakke i samme kurv, men ifølge regel 1 må de gerne kombineres)
      // Så denne blok kan evt. fjernes hvis slots+pakkekøb er ok
    }
  }

  // Regel 1: Pakker og slots må gerne kombineres
  // Men kun én pakke ad gangen (hvis ønsket)
  if (isPackage && hasPackage) {
    return { success: false, error: 'Du kan kun købe én pakke ad gangen.' };
  }

  // Ingen dubletter
  if (currentItems.find(item => item.id === newItem.id)) {
    return { success: false, error: 'Denne vare er allerede i kurven.' };
  }

  setItems([...currentItems, { ...newItem }]);
  setIsOpen(true);
  return { success: true };
};

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const createCheckout = async () => {
    try {
      // Her kan vi tilføje logik for at gemme ordren i databasen hvis nødvendigt
      
      // Naviger til checkout siden med kurv-items som query parametre
      const encodedItems = encodeURIComponent(JSON.stringify(items));
      router.push(`/checkout?items=${encodedItems}`);
    } catch (error) {
      console.error('Fejl ved oprettelse af checkout:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleCart,
        isOpen,
        createCheckout
      }}
    >
      {children}
      <ShoppingCart 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        items={items}
        removeItem={removeItem}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 