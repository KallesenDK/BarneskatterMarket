'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Footer() {
  return (
    <footer className="border-t border-[#1a2942] bg-[#0B1120] shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Norsk Marketplace</h3>
            <p className="text-gray-300">
              Din online destination for køb og salg af produkter i Norge.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Om os
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Kundeservice</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Levering
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returpolitik
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Vilkår og betingelser
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Nyhedsbrev</h3>
            <p className="mb-4 text-gray-300">
              Tilmeld dig vores nyhedsbrev for at få de seneste nyheder og tilbud.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Din email"
                className="w-full rounded-md border border-[#1a2942] bg-[#0B1120] py-2 px-3 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              />
              <Button variant="outline" className="border-[#1a2942] text-white hover:bg-[#1a2942]">Tilmeld</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-[#1a2942] pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Norsk Marketplace. Alle rettigheder forbeholdes.</p>
        </div>
      </div>
    </footer>
  )
} 