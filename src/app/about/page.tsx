'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Aktive brugere', value: '10.000+' },
  { label: 'Produkter til salg', value: '25.000+' },
  { label: 'Gennemførte handler', value: '50.000+' },
  { label: 'Kundetilfredshed', value: '4.8/5' },
];

const teamMembers = [
  {
    name: 'Anders Jensen',
    role: 'Medstifter & CEO',
    image: '/team/anders.jpg',
    bio: 'Erfaren iværksætter med passion for bæredygtighed og cirkulær økonomi.'
  },
  {
    name: 'Marie Nielsen',
    role: 'Medstifter & CTO',
    image: '/team/marie.jpg',
    bio: 'Tech-entusiast med fokus på at skabe intuitive brugeroplevelser.'
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function AboutPage() {
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
              Om Norsk Markedsplace
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90">
              Vi forbinder købere og sælgere i Norge gennem en sikker og brugervenlig markedsplads
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
      </div>

      {/* Mission Section med moderne kort design */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="lg:text-center mb-16"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h2 className="text-3xl font-bold text-gray-900">Vores Mission</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              At skabe Norges mest pålidelige markedsplads, hvor kvalitet og tillid går hånd i hånd med bæredygtighed og brugervenlighed.
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...fadeIn.transition, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-[#1AA49A] mb-6">Vores Værdier</h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1AA49A]/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">Tillid og gennemsigtighed</p>
                      <p className="mt-1 text-sm text-gray-500">Vi sikrer ærlige og åbne handler mellem alle parter</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1AA49A]/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">Brugervenlig oplevelse</p>
                      <p className="mt-1 text-sm text-gray-500">Intuitiv platform der gør det nemt at købe og sælge</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1AA49A]/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#1AA49A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">Sikkerhed i fokus</p>
                      <p className="mt-1 text-sm text-gray-500">Beskyttede transaktioner og verificerede brugere</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...fadeIn.transition, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-[#1AA49A] mb-6">Vores Løfte</h3>
                <div className="prose prose-lg text-gray-500">
                  <p className="mb-6">
                    Vi stræber efter at levere den bedste markedspladsoplevelse for både købere og sælgere. 
                    Vores platform er designet til at være sikker, pålidelig og nem at bruge.
                  </p>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-[#1AA49A] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verificerede sælgere og købere
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-[#1AA49A] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sikker betalingshåndtering
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-[#1AA49A] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      24/7 kundesupport
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section med moderne design */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...fadeIn.transition, delay: index * 0.1 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-[#1AA49A]/10" />
                  </div>
                  <div className="relative">
                    <p className="text-4xl font-bold text-[#1AA49A]">{stat.value}</p>
                    <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section med moderne kort design */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h2 className="text-3xl font-bold text-gray-900">Mød Teamet</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Vi er et dedikeret team med passion for at skabe den bedste markedsplads i Norge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="relative"
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...fadeIn.transition, delay: index * 0.2 }}
              >
                <div className="group relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-white/90">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-center">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section med moderne design */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <motion.div 
            className="relative rounded-2xl bg-[#1AA49A] px-6 py-10 shadow-xl sm:px-12 sm:py-20"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <div className="relative lg:flex lg:items-center lg:justify-between">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Har du spørgsmål?
                </h2>
                <p className="mt-4 text-lg text-white/90">
                  Vi står klar til at hjælpe dig med at komme i gang på platformen.
                </p>
              </div>
              <div className="mt-10 lg:mt-0 lg:ml-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white px-8 py-3 text-base font-medium text-[#1AA49A] hover:bg-transparent hover:text-white transition-colors duration-200"
                >
                  Kontakt os
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 