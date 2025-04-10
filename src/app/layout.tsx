import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SupabaseProvider from '@/components/SupabaseProvider'
import { CartProvider } from '@/components/Cart/CartProvider'
import DebugLogs from '@/components/DebugLogs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Norsk Marketplace',
  description: 'Din markedsplass for norske produkter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <DebugLogs />
          </CartProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
} 