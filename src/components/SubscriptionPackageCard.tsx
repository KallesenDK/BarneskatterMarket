'use client'

import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  product_limit: number;
  price: number;
  is_active: boolean;
  is_popular?: boolean;
  discount_price?: number | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  max_quantity?: number | null;
  sold_quantity?: number;
}

interface SubscriptionPackageCardProps {
  package: SubscriptionPackage
}

export function SubscriptionPackageCard({ package: pkg }: SubscriptionPackageCardProps) {
  const router = useRouter()

  const isDiscountActive = pkg.discount_price != null && 
    pkg.discount_start_date != null && 
    pkg.discount_end_date != null && 
    new Date(pkg.discount_start_date) <= new Date() && 
    new Date() <= new Date(pkg.discount_end_date)

  const calculateDiscount = () => {
    if (!isDiscountActive || !pkg.discount_price) return 0
    return Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)
  }

  const handleSelect = () => {
    router.push(`/checkout?package=${pkg.id}`)
  }

  const discountPercentage = calculateDiscount()

  // Udsolgt? (kun hvis max_quantity sat)
  const isSoldOut =
    typeof pkg.max_quantity === 'number' &&
    pkg.max_quantity > 0 &&
    typeof pkg.sold_quantity === 'number' &&
    pkg.sold_quantity >= pkg.max_quantity;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      pkg.is_popular ? 'border-[#1AA49A] shadow-lg' : 'hover:shadow-lg'
    }`}>
      {pkg.is_popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-[#1AA49A] text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
            Mest populær
          </div>
        </div>
      )}
      
      {isDiscountActive && discountPercentage > 0 && (
        <div className="absolute top-0 left-0">
          <div className="bg-[#F08319] text-white px-3 py-1 rounded-br-lg text-sm font-medium">
            Spar {discountPercentage}%
          </div>
        </div>
      )}
      {/* VIS "X ud af Y tilbage" hvis max_quantity er sat */}
      {typeof pkg.max_quantity === 'number' && pkg.max_quantity > 0 && (
        <div className="absolute bottom-2 left-2 z-10">
          <span className={`text-xs px-2 py-1 rounded-full ${isSoldOut ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            {isSoldOut
              ? 'Udsolgt'
              : `${pkg.max_quantity - (pkg.sold_quantity || 0)} ud af ${pkg.max_quantity} tilbage`}
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          {pkg.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          {isDiscountActive ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-[#F08319]">
                  {pkg.discount_price?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  {pkg.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </p>
              </div>
              <p className="text-sm text-[#F08319]">
                Tilbud slutter {new Date(pkg.discount_end_date!).toLocaleDateString('da-DK')}
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold">
              {pkg.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
            </p>
          )}
          <p className="text-sm text-gray-500">per {pkg.duration_weeks} uger</p>
        </div>

        <ul className="space-y-3">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Op til {pkg.product_limit} produkter</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Ubegrænset antal visninger</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Support via email</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Statistik og rapporter</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-[#1AA49A] to-[#158C84] hover:from-[#158C84] hover:to-[#1AA49A] text-white transition-all duration-300"
          onClick={handleSelect}
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Udsolgt' : 'Køb pakke'}
        </Button>
      </CardFooter>
    </Card>
  )
} 