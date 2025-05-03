'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1C] text-white">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold">Norsk Marketplace</h3>
          <p className="mt-2 text-sm text-gray-400">
            Din online destination for køb og salg af produkter i Norge.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Links</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <Link href="/om-os" className="text-sm text-gray-400 hover:text-white">
                Om os
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="text-sm text-gray-400 hover:text-white">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-sm text-gray-400 hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Kundeservice</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <Link href="/levering" className="text-sm text-gray-400 hover:text-white">
                Levering
              </Link>
            </li>
            <li>
              <Link href="/returpolitik" className="text-sm text-gray-400 hover:text-white">
                Returpolitik
              </Link>
            </li>
            <li>
              <Link href="/vilkar-og-betingelser" className="text-sm text-gray-400 hover:text-white">
                Vilkår og betingelser
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Nyhedsbrev</h3>
          <p className="mt-2 text-sm text-gray-400">
            Tilmeld dig vores nyhedsbrev for at få de seneste nyheder og tilbud.
          </p>
          <form className="mt-4">
            <div className="flex max-w-sm items-center gap-2">
              <input
                type="email"
                placeholder="Din email"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
              >
                Tilmeld
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Norsk Marketplace. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  )
} 