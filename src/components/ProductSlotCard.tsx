'use client'

import { useRouter } from 'next/navigation'

interface ProductSlot {
  id: string
  name: string
  description: string | null
  slot_count: number
  price: number
  is_active: boolean
  is_popular: boolean
  discount_price: number | null
  discount_start_date: string | null
  discount_end_date: string | null
}

interface ProductSlotCardProps {
  slot: ProductSlot
}

export function ProductSlotCard({ slot }: ProductSlotCardProps) {
  const router = useRouter()

  const isDiscountActive = () => {
    if (!slot.discount_price || !slot.discount_start_date || !slot.discount_end_date) {
      return false
    }

    const now = new Date()
    const startDate = new Date(slot.discount_start_date)
    const endDate = new Date(slot.discount_end_date)
    
    return startDate <= now && now <= endDate
  }

  const calculateDiscount = () => {
    if (!isDiscountActive() || !slot.discount_price) return 0
    return Math.round(((slot.price - slot.discount_price) / slot.price) * 100)
  }

  const handleSelect = () => {
    router.push(`/checkout?product-slots=${slot.id}`)
  }

  const discountActive = isDiscountActive()
  const discountPercentage = calculateDiscount()

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${
      slot.is_popular ? 'ring-2 ring-[#1AA49A]' : ''
    }`}>
      {slot.is_popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-[#1AA49A] text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
            Mest populær
          </div>
        </div>
      )}
      
      {discountActive && discountPercentage > 0 && (
        <div className="absolute top-0 left-0">
          <div className="bg-[#F08319] text-white px-3 py-1 rounded-br-lg text-sm font-medium">
            Spar {discountPercentage}%
          </div>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{slot.name}</h3>
        <div className="mt-4">
          {discountActive ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#F08319]">
                {slot.discount_price?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
              </span>
              <span className="text-lg text-gray-500 line-through">
                {slot.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {slot.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
              </span>
            </div>
          )}
          {discountActive && (
            <p className="mt-1 text-sm text-[#F08319]">
              Tilbud slutter {new Date(slot.discount_end_date!).toLocaleDateString('da-DK')}
            </p>
          )}
        </div>
        <p className="mt-4 text-gray-600">{slot.description}</p>
        <div className="mt-6">
          <button
            onClick={handleSelect}
            className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              slot.is_popular
                ? 'bg-[#1AA49A] text-white hover:bg-[#158C84]'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Vælg {slot.slot_count} pladser
          </button>
        </div>
      </div>
    </div>
  )
} 