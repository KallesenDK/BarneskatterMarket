'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const productSlots = [
  {
    id: '1',
    name: '5 Ekstra pladser',
    price: 199,
    slots: 5,
    description: 'Perfekt til dig der har brug for lidt ekstra plads'
  },
  {
    id: '2',
    name: '10 Ekstra pladser',
    price: 349,
    slots: 10,
    description: 'Mest populære valg for aktive sælgere',
    isPopular: true
  },
  {
    id: '3',
    name: '20 Ekstra pladser',
    price: 599,
    slots: 20,
    description: 'Ideel til store sælgere med mange produkter'
  },
  {
    id: '4',
    name: '50 Ekstra pladser',
    price: 1299,
    slots: 50,
    description: 'Til professionelle sælgere med stort sortiment'
  }
];

export default function ProductSlotsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectSlots = (slotId: string) => {
    router.push(`/checkout?product-slots=${slotId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-[#1AA49A] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1AA49A]/90 to-[#158C84]/90" />
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse mx-auto" />
              <div className="h-6 w-64 bg-white/20 rounded animate-pulse mx-auto mt-4" />
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
        </div>
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl animate-pulse shadow-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section med bølgeeffekt */}
      <div className="relative bg-[#1AA49A] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1AA49A]/90 to-[#158C84]/90" />
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Ekstra Produktpladser
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90">
              Udvid din forretning med flere produktpladser og nå ud til flere kunder
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
      </div>

      {/* Produktpladser Section */}
      <div className="relative z-10 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {productSlots.map((slot, index) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${
                  slot.isPopular ? 'ring-2 ring-[#1AA49A]' : ''
                }`}>
                  {slot.isPopular && (
                    <div className="bg-[#1AA49A] text-white text-sm font-medium px-4 py-1 text-center">
                      Mest populær
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{slot.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{slot.price}</span>
                      <span className="text-xl font-semibold text-gray-500">kr</span>
                    </div>
                    <p className="mt-4 text-gray-600">{slot.description}</p>
                    <div className="mt-6">
                      <button
                        onClick={() => handleSelectSlots(slot.id)}
                        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                          slot.isPopular
                            ? 'bg-[#1AA49A] text-white hover:bg-[#158C84]'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Vælg {slot.slots} pladser
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-gray-600">
              Ønsker du en komplet pakke? Se vores{' '}
              <a 
                href="/packages" 
                className="text-[#1AA49A] hover:text-[#158C84] font-medium hover:underline transition-colors"
              >
                abonnementspakker
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 