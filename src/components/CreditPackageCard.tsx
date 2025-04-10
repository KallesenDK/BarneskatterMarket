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

export interface CreditPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  is_active: boolean
}

interface CreditPackageCardProps {
  pkg: CreditPackage
  onSelect: (pkg: CreditPackage) => void
}

export function CreditPackageCard({ pkg, onSelect }: CreditPackageCardProps) {
  const isPopular = pkg.name === 'Medium pakke'

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
          <p className="text-sm text-gray-500">Engangskøb</p>
        </div>

        <ul className="space-y-3">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>{pkg.credits} ekstra produktpladser</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Ingen udløbsdato</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Brug når du har behov</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-[#1AA49A] shrink-0 mr-2" />
            <span>Fuld fleksibilitet</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-[#1AA49A] to-[#158C84] hover:from-[#158C84] hover:to-[#1AA49A] text-white transition-all duration-300"
          onClick={() => onSelect(pkg)}
        >
          Køb kreditter
        </Button>
      </CardFooter>
    </Card>
  )
} 