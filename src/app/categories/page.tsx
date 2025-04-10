'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Eksempelkategorier med billeder og beskrivelser
const categories = [
  {
    id: '1',
    name: 'Elektronik',
    description: 'Smartphones, computere, tablets og andet elektronisk udstyr',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1170&auto=format&fit=crop',
    productCount: 2345,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: '2',
    name: 'Tøj & Mode',
    description: 'Moderne tøj, sko og accessories til enhver stil',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1170&auto=format&fit=crop',
    productCount: 3456,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: '3',
    name: 'Hjem & Have',
    description: 'Alt til boligen, haven og indretning',
    image: 'https://images.unsplash.com/photo-1416339684178-3a239570f315?q=80&w=1167&auto=format&fit=crop',
    productCount: 2789,
    color: 'from-green-500 to-green-600'
  },
  {
    id: '4',
    name: 'Sport & Fritid',
    description: 'Udstyr og tilbehør til sport og fritidsaktiviteter',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1170&auto=format&fit=crop',
    productCount: 1890,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: '5',
    name: 'Bøger & Medier',
    description: 'Bøger, film, musik og spil',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1170&auto=format&fit=crop',
    productCount: 1567,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: '6',
    name: 'Børn & Baby',
    description: 'Legetøj, tøj og udstyr til børn og babyer',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1170&auto=format&fit=crop',
    productCount: 2123,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: '7',
    name: 'Biler & Motor',
    description: 'Bildele, tilbehør og motorudstyr',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1283&auto=format&fit=crop',
    productCount: 987,
    color: 'from-red-500 to-red-600'
  },
  {
    id: '8',
    name: 'Hobby & Kunst',
    description: 'Kunstartikler, håndarbejde og hobbyudstyr',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1171&auto=format&fit=crop',
    productCount: 1432,
    color: 'from-indigo-500 to-indigo-600'
  }
];

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse shadow-lg" />
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
              Udforsk Kategorier
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90">
              Find præcis det du leder efter blandt vores mange kategorier
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
      </div>

      {/* Kategorier Section */}
      <div className="relative z-10 -mt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <Link 
                  href={`/product?category=${encodeURIComponent(category.name)}`}
                  className="block group"
                >
                  <div className="relative h-64 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl">
                    <div className="absolute inset-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-b ${category.color} mix-blend-multiply opacity-75`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                    <div className="relative h-full flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-white/90 text-sm line-clamp-2 mb-2">
                        {category.description}
                      </p>
                      <div className="flex items-center text-white/75 text-sm">
                        <span>{category.productCount.toLocaleString('da-DK')} produkter</span>
                        <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
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
              Kan du ikke finde hvad du leder efter? Prøv vores{' '}
              <Link 
                href="/product" 
                className="text-[#1AA49A] hover:text-[#158C84] font-medium hover:underline transition-colors"
              >
                produktsøgning
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 