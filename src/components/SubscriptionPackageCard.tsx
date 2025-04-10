import { Check, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionPackage } from '@/lib/types'
import { motion } from 'framer-motion'

interface SubscriptionPackageCardProps {
  pkg: SubscriptionPackage
  onSelect: (pkg: SubscriptionPackage) => void
}

export function SubscriptionPackageCard({ pkg, onSelect }: SubscriptionPackageCardProps) {
  // Tjek om der er en aktiv rabat
  const hasActiveDiscount = pkg.discount_price !== null && 
    pkg.discount_start_date && 
    pkg.discount_end_date &&
    new Date(pkg.discount_start_date) <= new Date() &&
    new Date(pkg.discount_end_date) >= new Date()

  const displayPrice = hasActiveDiscount ? pkg.discount_price! : pkg.price
  const savings = hasActiveDiscount ? Math.round((1 - pkg.discount_price! / pkg.price) * 100) : 0

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      pkg.is_popular ? 'border-2 border-[#1AA49A] shadow-xl' : 'hover:shadow-lg'
    }`}>
      {/* Populær badge */}
      {pkg.is_popular && (
        <div className="absolute -right-12 top-6 rotate-45 bg-[#1AA49A] py-1 px-12 text-white">
          <div className="flex items-center justify-center text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-1" />
            Mest populær
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          {pkg.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-6">
          {hasActiveDiscount ? (
            <>
              <div className="inline-block bg-[#F08319]/10 rounded-full px-3 py-1 text-sm font-medium text-[#F08319] mb-3">
                Spar {savings}%
              </div>
              <div className="flex items-center justify-center gap-3">
                <p className="text-4xl font-bold text-[#F08319]">
                  {displayPrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </p>
                <span className="text-xl text-gray-400 line-through">
                  {pkg.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </span>
              </div>
              <p className="text-sm font-medium text-[#F08319] mt-2">
                Tilbud udløber {new Date(pkg.discount_end_date!).toLocaleDateString('da-DK')}
              </p>
            </>
          ) : (
            <p className="text-4xl font-bold text-gray-900">
              {displayPrice.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">per {pkg.duration_weeks} uger</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <ul className="space-y-3">
            <motion.li 
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1AA49A]/10 flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-[#1AA49A]" />
              </div>
              <span className="text-gray-700">Op til {pkg.product_limit} produkter</span>
            </motion.li>
            <motion.li 
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1AA49A]/10 flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-[#1AA49A]" />
              </div>
              <span className="text-gray-700">Ubegrænset antal visninger</span>
            </motion.li>
            <motion.li 
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1AA49A]/10 flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-[#1AA49A]" />
              </div>
              <span className="text-gray-700">Support via email</span>
            </motion.li>
            <motion.li 
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1AA49A]/10 flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-[#1AA49A]" />
              </div>
              <span className="text-gray-700">Statistik og rapporter</span>
            </motion.li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <Button 
          className={`w-full py-6 text-lg font-medium rounded-xl transition-all duration-300 ${
            pkg.is_popular
              ? 'bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white shadow-lg shadow-[#1AA49A]/20'
              : 'bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white shadow-lg shadow-[#1AA49A]/20'
          }`}
          onClick={() => onSelect(pkg)}
        >
          {hasActiveDiscount ? 'Køb nu og spar' : 'Vælg pakke'}
        </Button>
      </CardFooter>
    </Card>
  )
} 