'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as CartIcon, X, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from './CartProvider';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  removeItem: (itemId: string) => void;
}

export default function ShoppingCart({ 
  isOpen, 
  onClose,
  items,
  removeItem
}: ShoppingCartProps) {
  const { createCheckout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Beregn total
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await createCheckout();
    } catch (err) {
      setError('Der opstod en fejl ved oprettelse af checkout. Prøv venligst igen.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          
          {/* Cart panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <CartIcon className="w-6 h-6 text-[#1AA49A]" />
                <h2 className="text-xl font-semibold">Din indkøbskurv</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Din indkøbskurv er tom
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {item.image && (
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[#0F172A]">{item.title}</h3>
                          <p className="text-[#1AA49A] font-semibold mt-1">
                            {item.price.toLocaleString('da-DK', {
                              style: 'currency',
                              currency: 'DKK'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-semibold">
                  {total.toLocaleString('da-DK', {
                    style: 'currency',
                    currency: 'DKK'
                  })}
                </span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || isProcessing}
                className="w-full bg-[#1AA49A] text-white py-3 rounded-md font-medium
                         hover:bg-[#158F86] transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Behandler...
                  </>
                ) : (
                  'Gå til betaling'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 