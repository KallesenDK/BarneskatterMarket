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

export interface SubscriptionPackage {
  id: string
  name: string
  description: string
  duration_weeks: number
  product_limit: number
  price: number
  is_active: boolean
}

interface SubscriptionPackageCardProps {
  pkg: SubscriptionPackage
  onSelect: (pkg: SubscriptionPackage) => void
}

export function SubscriptionPackageCard({ pkg, onSelect }: SubscriptionPackageCardProps) {
  const isPopular = pkg.name === 'Basic'

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      isPopular ? 'border-[#1AA49A] shadow-lg' : 'hover:shadow-lg'
    }`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-[#1AA49A] text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
            Mest populær
          </div>
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
          <p className="text-3xl font-bold">
            {pkg.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
          </p>
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
          onClick={() => onSelect(pkg)}
        >
          Køb pakke
        </Button>
      </CardFooter>
    </Card>
  )
} 