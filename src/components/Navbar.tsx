'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, ShoppingCart, User, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSupabase } from '@/components/SupabaseProvider'
import { useCart } from '@/components/Cart/CartProvider'
import Image from 'next/image'
import AdminMegaMenu from './AdminMegaMenu'

const navLinks = [
  { href: '/', label: 'Hjem' },
  { href: '/products', label: 'Produkter' },
  { href: '/categories', label: 'Kategorier' },
  { href: '/packages', label: 'Pakker' },
  { href: '/product-slots', label: 'Ekstra produkter' },
  { href: '/about', label: 'Om os' },
  { href: '/contact', label: 'Kontakt' },
]

// Funktion til at slette alle cookies
const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
};

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { supabase } = useSupabase()
  const { toggleCart, items } = useCart()
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Fejl ved hentning af session:', error)
          setIsLoggedIn(false)
          return
        }
        
        if (session) {
          setIsLoggedIn(true)
          const isAdmin = session.user.email === 'kenneth@sigmatic.dk'
          setUserRole(isAdmin ? 'admin' : 'user')
        } else {
          setIsLoggedIn(false)
          setUserRole(null)
        }
      } catch (error) {
        console.error('Fejl ved tjek af login status:', error)
        setIsLoggedIn(false)
        setUserRole(null)
      }
    }
    
    checkLoginStatus()
  }, [supabase])

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
    }

    checkAdmin()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      deleteAllCookies()
      setIsLoggedIn(false)
      setUserRole(null)
      router.push('/')
    } catch (error) {
      console.error('Fejl ved logout:', error)
    }
  }

  const getDashboardLink = () => {
    if (!isLoggedIn) return '/auth/signin'
    return userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user'
  }
  
  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white text-sm py-3 sm:py-0">
      <nav className="relative max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-none">
              <Image
                src="/images/logo.png"
                alt="Norsk Markedsplace"
                width={140}
                height={35}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="sm:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 inline-flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div id="navbar-collapse" className={cn(
            "hidden overflow-hidden transition-all duration-300 basis-full grow sm:block",
            isMenuOpen && "!block"
          )}>
            <div className="flex flex-col gap-y-4 gap-x-0 mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-y-0 sm:gap-x-4 sm:mt-0 sm:ps-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "sm:py-3 font-medium transition-colors",
                    pathname === link.href 
                      ? "text-[#BC1964]"
                      : "text-[#5f6368] hover:text-[#BC1964]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAdmin && (
                <div className="sm:ps-3">
                  <AdminMegaMenu />
                </div>
              )}

              <div className="flex items-center gap-4 sm:ml-auto">
                <form className="hidden lg:block relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Søg efter produkter..."
                    className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </form>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleCart}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#BC1964] text-[10px] font-medium text-white">
                      {items.length}
                    </span>
                  )}
                </Button>
                
                <Link 
                  href={getDashboardLink()}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full p-2 transition-colors",
                    isLoggedIn 
                      ? "bg-[#1AA49A]/10 text-[#1AA49A] hover:bg-[#1AA49A]/20"
                      : "hover:bg-gray-100"
                  )}
                >
                  <User className="h-5 w-5" />
                </Link>
                
                {isLoggedIn && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                    title="Log ud"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container p-4">
            <form className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Søg efter produkter..."
                className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </form>
          </div>
        </div>
      )}
    </header>
  )
} 