'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ShoppingCart from './ShoppingCart';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  toggleCart: () => void;
  isOpen: boolean;
  createCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);
      if (existingItem) {
        return currentItems; // Hvis varen allerede findes, gør ingenting
      }
      return [...currentItems, { ...newItem }];
    });
    setIsOpen(true); // Åbn kurven når et produkt tilføjes
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